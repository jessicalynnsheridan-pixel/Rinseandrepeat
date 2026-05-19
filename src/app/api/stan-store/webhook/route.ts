import { createAdminClient } from '@/lib/supabase-server'
import { NextRequest } from 'next/server'
import crypto from 'crypto'

// Map your Stan Store product IDs → app plan tiers
// Set these in Vercel env vars
const PRODUCT_PLAN_MAP: Record<string, string> = {
  [process.env.STAN_PRO_MONTHLY_PRODUCT_ID ?? '']: 'pro',
  [process.env.STAN_PRO_YEARLY_PRODUCT_ID ?? '']: 'pro',
  [process.env.STAN_CEO_MONTHLY_PRODUCT_ID ?? '']: 'ceo',
  [process.env.STAN_CEO_YEARLY_PRODUCT_ID ?? '']: 'ceo',
}

function verifySignature(body: string, signature: string, secret: string): boolean {
  try {
    const hmac = crypto.createHmac('sha256', secret)
    const digest = hmac.update(body).digest('hex')
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text()

  // Require webhook signature verification in production
  const secret = process.env.STAN_WEBHOOK_SECRET
  if (!secret && process.env.NODE_ENV === 'production') {
    console.error('[Stan webhook] STAN_WEBHOOK_SECRET is not set — rejecting request')
    return Response.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }
  if (secret) {
    const signature = req.headers.get('x-stan-signature') ?? req.headers.get('x-webhook-signature') ?? ''
    if (!verifySignature(body, signature, secret)) {
      console.error('[Stan webhook] Invalid signature')
      return Response.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(body)
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Log raw payload on first setup so you can inspect the shape
  if (process.env.NODE_ENV !== 'production' || process.env.STAN_WEBHOOK_DEBUG === 'true') {
    console.log('[Stan webhook] Raw payload:', JSON.stringify(payload, null, 2))
  }

  // ── Parse Stan Store payload ──────────────────────────────────────────
  // Stan Store sends order data nested under various keys depending on event type.
  // We support a few common shapes here.
  const event = (payload.event ?? payload.type ?? payload.status) as string | undefined
  const data = (payload.data ?? payload.order ?? payload) as Record<string, unknown>

  // Only process completed/successful orders
  if (event && !['order.completed', 'purchase.completed', 'payment.succeeded', 'new_order'].includes(event)) {
    return Response.json({ received: true, skipped: `event type "${event}" not handled` })
  }

  // Extract customer email
  const customer = (data.customer ?? data.buyer ?? {}) as Record<string, unknown>
  const email = (
    (customer.email as string) ??
    (data.email as string) ??
    (data.customer_email as string) ??
    (payload.email as string)
  )?.toLowerCase()

  // Extract product ID
  const product = (data.product ?? data.item ?? {}) as Record<string, unknown>
  const productId = (
    (product.id as string) ??
    (product.product_id as string) ??
    (data.product_id as string) ??
    (data.item_id as string) ??
    (payload.product_id as string)
  ) as string | undefined

  if (!email) {
    console.error('[Stan webhook] No email found in payload')
    return Response.json({ error: 'No customer email in payload' }, { status: 400 })
  }

  // Determine plan tier
  const planId = productId ? (PRODUCT_PLAN_MAP[productId] ?? null) : null

  if (!planId) {
    // Log but don't error — could be a non-subscription product (template, course, etc.)
    console.log(`[Stan webhook] No plan mapping for product "${productId}" — skipping tier upgrade`)
    return Response.json({ received: true, skipped: `no plan mapped for product "${productId}"` })
  }

  const supabase = createAdminClient()

  // ── Look up user by email via profiles table ──────────────────────────
  // profiles doesn't store email, so we query auth.users through the admin API.
  // listUsers supports a page filter — page through until found or exhausted.
  const { data: listData, error: lookupError } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (lookupError) {
    console.error('[Stan webhook] Failed to list users:', lookupError)
    return Response.json({ error: 'User lookup failed' }, { status: 500 })
  }

  const user = (listData?.users ?? []).find((u: { email?: string }) => u.email?.toLowerCase() === email) ?? null

  if (user) {
    // User has an account — upgrade them immediately
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ subscription_tier: planId })
      .eq('id', user.id)

    if (updateError) {
      console.error('[Stan webhook] Failed to update profile:', updateError)
      return Response.json({ error: 'Profile update failed' }, { status: 500 })
    }

    // Upsert subscriptions table too
    await supabase.from('subscriptions').upsert({
      user_id: user.id,
      plan_id: planId,
      status: 'active',
      stripe_subscription_id: (data.subscription_id as string) ?? `stan_${Date.now()}`,
      stripe_customer_id: (data.customer_id as string) ?? `stan_email_${email}`,
    })

    // Award XP for upgrading
    await supabase.rpc('award_xp', { p_user_id: user.id, p_xp: 200 })

    console.log(`[Stan webhook] ✅ Upgraded ${email} → ${planId}`)
    return Response.json({ received: true, upgraded: email, plan: planId })

  } else {
    // No account yet — store a pending upgrade keyed by email
    // When the user signs up with this email, the onboarding flow will pick it up
    const { error: pendingError } = await supabase
      .from('pending_upgrades')
      .upsert({ email, plan_id: planId, created_at: new Date().toISOString() }, { onConflict: 'email' })

    if (pendingError) {
      // Table might not exist yet — log but don't fail
      console.warn('[Stan webhook] Could not store pending upgrade (table may need creating):', pendingError.message)
    }

    console.log(`[Stan webhook] 📬 Stored pending upgrade for ${email} → ${planId}`)
    return Response.json({ received: true, pending: email, plan: planId })
  }
}
