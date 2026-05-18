import Stripe from 'stripe'
import { createRouteClient } from '@/lib/supabase-server'
import { NextRequest } from 'next/server'
import { SUBSCRIPTION_PLANS } from '@/types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId, billingCycle = 'monthly' } = await req.json()

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
    if (!plan || plan.id === 'free') {
      return Response.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const priceId = billingCycle === 'yearly'
      ? plan.stripe_price_id_yearly
      : plan.stripe_price_id_monthly

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, full_name')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile?.full_name ?? undefined,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      subscription_data: {
        trial_period_days: 7,
        metadata: { supabase_user_id: user.id, plan_id: planId },
      },
      metadata: { supabase_user_id: user.id, plan_id: planId },
      allow_promotion_codes: true,
    })

    return Response.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return Response.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
