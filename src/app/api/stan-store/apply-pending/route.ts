import { createAdminClient } from '@/lib/supabase-server'
import { NextRequest } from 'next/server'

// Called during onboarding to apply any pending Stan Store upgrade
// for users who purchased before creating their app account.
export async function POST(req: NextRequest) {
  try {
    const { email, userId } = await req.json()
    if (!email || !userId) {
      return Response.json({ error: 'Missing email or userId' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Look for a pending upgrade for this email
    const { data: pending, error: fetchError } = await supabase
      .from('pending_upgrades')
      .select('plan_id')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (fetchError || !pending) {
      return Response.json({ applied: false })
    }

    // Apply the upgrade
    await supabase
      .from('profiles')
      .update({ subscription_tier: pending.plan_id })
      .eq('id', userId)

    await supabase.from('subscriptions').upsert({
      user_id: userId,
      plan_id: pending.plan_id,
      status: 'active',
      stripe_subscription_id: `stan_pending_${userId}`,
      stripe_customer_id: `stan_email_${email}`,
    })

    // Award XP
    await supabase.rpc('award_xp', { p_user_id: userId, p_xp: 200 })

    // Clean up the pending record
    await supabase.from('pending_upgrades').delete().eq('email', email.toLowerCase())

    console.log(`[Stan pending] ✅ Applied ${pending.plan_id} to ${email} (${userId})`)
    return Response.json({ applied: true, plan: pending.plan_id })
  } catch (err) {
    console.error('[Stan pending] Error:', err)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
