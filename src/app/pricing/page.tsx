'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, Crown, Zap, Star, ArrowLeft, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/components/providers/UserProvider'
import { SUBSCRIPTION_PLANS } from '@/types'

// ─── Icons per plan ──────────────────────────────────────────────────────────
const PLAN_ICONS = { free: Star, pro: Zap, ceo: Crown }
const PLAN_COLORS = {
  free: { bg: '#F4F4F5', text: '#52525B', ring: '#E4E4E7' },
  pro:  { bg: '#EDE9FE', text: '#7C3AED', ring: '#DDD6FE' },
  ceo:  { bg: '#18181B', text: '#FFFFFF', ring: '#3F3F46' },
}

export default function PricingPage() {
  const { profile, user } = useUser()
  const router = useRouter()
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)

  const currentTier = profile?.subscription_tier ?? 'free'

  async function handleUpgrade(planId: string) {
    if (planId === 'free') { router.push('/dashboard'); return }
    if (!user) { router.push('/signup'); return }
    if (planId === currentTier) { router.push('/dashboard'); return }

    setLoading(planId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle: billing }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('Checkout error:', data.error)
        setLoading(null)
      }
    } catch (err) {
      console.error('Checkout failed:', err)
      setLoading(null)
    }
  }

  const yearSavings = (plan: typeof SUBSCRIPTION_PLANS[0]) =>
    plan.price_monthly > 0
      ? Math.round(((plan.price_monthly * 12 - plan.price_yearly) / (plan.price_monthly * 12)) * 100)
      : 0

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-[#71717A] hover:text-[#18181B] transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EDE9FE] text-[#7C3AED] text-xs font-semibold mb-4">
            <Crown className="w-3 h-3" />
            Enter your CEO era
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#18181B] leading-tight mb-3">
            Build your business.<br />
            <span className="text-[#7C3AED]">Not just your to-do list.</span>
          </h1>
          <p className="text-base text-[#71717A] max-w-md mx-auto">
            Every tool you need to go from idea to income — roadmaps, AI, community, and daily accountability.
          </p>
        </motion.div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className={cn('text-sm font-medium', billing === 'monthly' ? 'text-[#18181B]' : 'text-[#A1A1AA]')}>
            Monthly
          </span>
          <button
            onClick={() => setBilling(b => b === 'monthly' ? 'yearly' : 'monthly')}
            className={cn(
              'relative w-12 h-6 rounded-full transition-colors',
              billing === 'yearly' ? 'bg-[#7C3AED]' : 'bg-[#E4E4E7]'
            )}
          >
            <div className={cn(
              'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
              billing === 'yearly' ? 'translate-x-7' : 'translate-x-1'
            )} />
          </button>
          <span className={cn('text-sm font-medium', billing === 'yearly' ? 'text-[#18181B]' : 'text-[#A1A1AA]')}>
            Yearly
          </span>
          {billing === 'yearly' && (
            <span className="text-xs font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
              Save up to 24%
            </span>
          )}
        </div>

        {/* Plan cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-16">
          {SUBSCRIPTION_PLANS.map((plan, i) => {
            const Icon = PLAN_ICONS[plan.id as keyof typeof PLAN_ICONS] ?? Star
            const colors = PLAN_COLORS[plan.id as keyof typeof PLAN_COLORS]
            const isCurrent = currentTier === plan.id
            const price = billing === 'yearly' ? plan.price_yearly : plan.price_monthly
            const monthlyEquiv = billing === 'yearly' && plan.price_yearly > 0
              ? (plan.price_yearly / 12).toFixed(0)
              : null
            const savings = yearSavings(plan)
            const isCeo = plan.id === 'ceo'

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  'relative rounded-3xl border-2 p-6 flex flex-col',
                  isCeo
                    ? 'bg-[#18181B] border-[#3F3F46]'
                    : plan.highlighted
                    ? 'bg-white border-[#7C3AED] shadow-[0_0_0_4px_rgba(124,58,237,0.08)]'
                    : 'bg-white border-[#E4E4E7]'
                )}
              >
                {/* Badge */}
                {(plan.badge || isCurrent) && (
                  <div className={cn(
                    'absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap',
                    isCurrent
                      ? 'bg-[#16A34A] text-white'
                      : isCeo
                      ? 'bg-[#7C3AED] text-white'
                      : 'bg-[#7C3AED] text-white'
                  )}>
                    {isCurrent ? 'Current Plan' : plan.badge}
                  </div>
                )}

                {/* Icon + name */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: colors.bg }}
                  >
                    <Icon className="w-5 h-5" style={{ color: colors.text }} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className={cn('text-sm font-bold', isCeo ? 'text-white' : 'text-[#18181B]')}>
                      {plan.name}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-5">
                  {plan.price_monthly === 0 ? (
                    <p className={cn('text-3xl font-bold', isCeo ? 'text-white' : 'text-[#18181B]')}>Free</p>
                  ) : (
                    <>
                      <div className="flex items-end gap-1.5">
                        <span className={cn('text-3xl font-bold', isCeo ? 'text-white' : 'text-[#18181B]')}>
                          ${billing === 'yearly' ? monthlyEquiv : price}
                        </span>
                        <span className={cn('text-sm mb-1', isCeo ? 'text-[#71717A]' : 'text-[#A1A1AA]')}>/mo</span>
                      </div>
                      {billing === 'yearly' && (
                        <p className={cn('text-xs mt-0.5', isCeo ? 'text-[#71717A]' : 'text-[#A1A1AA]')}>
                          ${price}/yr · save {savings}%
                        </p>
                      )}
                      {billing === 'monthly' && (
                        <p className={cn('text-xs mt-0.5', isCeo ? 'text-[#52525B]' : 'text-[#A1A1AA]')}>
                          Billed monthly · cancel anytime
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <div className={cn(
                        'w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                        isCeo ? 'bg-[#7C3AED]' : 'bg-[#EDE9FE]'
                      )}>
                        <Check className={cn('w-2.5 h-2.5', isCeo ? 'text-white' : 'text-[#7C3AED]')} strokeWidth={3} />
                      </div>
                      <span className={cn('text-xs leading-relaxed', isCeo ? 'text-[#D4D4D8]' : 'text-[#52525B]')}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading === plan.id || isCurrent}
                  className={cn(
                    'w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all',
                    isCurrent
                      ? 'bg-[#F4F4F5] text-[#A1A1AA] cursor-default'
                      : isCeo
                      ? 'bg-[#7C3AED] text-white hover:bg-[#5B21B6]'
                      : plan.highlighted
                      ? 'bg-[#7C3AED] text-white hover:bg-[#5B21B6]'
                      : 'bg-[#F4F4F5] text-[#18181B] hover:bg-[#E4E4E7]'
                  )}
                >
                  {loading === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrent ? (
                    'Current plan'
                  ) : plan.price_monthly === 0 ? (
                    'Get started free'
                  ) : (
                    `Get started →`
                  )}
                </button>

                {!isCurrent && plan.price_monthly > 0 && (
                  <p className={cn('text-center text-[10px] mt-2', isCeo ? 'text-[#52525B]' : 'text-[#A1A1AA]')}>
                    Cancel anytime · billed {billing === 'yearly' ? 'annually' : 'monthly'}
                  </p>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Trust row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-2 pb-12"
        >
          <p className="text-xs text-[#A1A1AA]">
            Trusted by 1,000+ women building their first (or next) business
          </p>
          <p className="text-xs text-[#A1A1AA]">
            Questions? Email <a href="mailto:support@rinseandrepeatceo.com" className="text-[#7C3AED] hover:underline">support@rinseandrepeatceo.com</a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
