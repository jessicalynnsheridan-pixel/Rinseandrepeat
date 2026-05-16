import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase'
import { NextRequest } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const PLAN_MAP: Record<string, string> = {
  [process.env.STRIPE_PRO_MONTHLY_PRICE_ID!]: 'pro',
  [process.env.STRIPE_PRO_YEARLY_PRICE_ID!]: 'pro',
  [process.env.STRIPE_CEO_MONTHLY_PRICE_ID!]: 'ceo',
  [process.env.STRIPE_CEO_YEARLY_PRICE_ID!]: 'ceo',
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.supabase_user_id
      const planId = session.metadata?.plan_id

      if (userId && planId) {
        await supabase.from('profiles').update({
          subscription_tier: planId,
          stripe_subscription_id: session.subscription as string,
        }).eq('id', userId)

        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_subscription_id: session.subscription as string,
          stripe_customer_id: session.customer as string,
          plan_id: planId,
          status: 'trialing',
        })

        // Award XP for upgrading
        await supabase.rpc('award_xp', { p_user_id: userId, p_xp: 200 })
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.supabase_user_id
      const priceId = sub.items.data[0]?.price.id
      const planId = PLAN_MAP[priceId] ?? 'free'

      if (userId) {
        await supabase.from('profiles').update({
          subscription_tier: planId,
        }).eq('id', userId)

        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_subscription_id: sub.id,
          stripe_customer_id: sub.customer as string,
          plan_id: planId,
          status: sub.status,
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
        })
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.supabase_user_id

      if (userId) {
        await supabase.from('profiles').update({
          subscription_tier: 'free',
          stripe_subscription_id: null,
        }).eq('id', userId)

        await supabase.from('subscriptions').update({
          status: 'canceled',
          plan_id: 'free',
        }).eq('stripe_subscription_id', sub.id)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      await supabase.from('subscriptions').update({
        status: 'past_due',
      }).eq('stripe_customer_id', customerId)
      break
    }
  }

  return Response.json({ received: true })
}
