'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, ArrowRight, ArrowLeft, Check, Sparkles, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BusinessType, BusinessStage, OnboardingData } from '@/types'
import { BUSINESS_TYPES } from '@/types'

// ──────────────────────────────────────────
// Step data
// ──────────────────────────────────────────
const STAGES: { value: BusinessStage; label: string; description: string; icon: string }[] = [
  { value: 'idea', label: 'Just an idea', description: 'I have a concept but haven\'t started yet', icon: '💡' },
  { value: 'building', label: 'Building now', description: 'I\'ve started but haven\'t launched', icon: '🔨' },
  { value: 'launched', label: 'Launched', description: 'I\'m open for business but growing', icon: '🚀' },
  { value: 'scaling', label: 'Scaling up', description: 'I\'m making money and want more', icon: '📈' },
]

const GOALS = [
  { id: 'income', label: 'Replace my 9-5 income', icon: '💰' },
  { id: 'side-hustle', label: 'Build a side hustle', icon: '⚡' },
  { id: 'brand', label: 'Build a personal brand', icon: '🌟' },
  { id: 'freedom', label: 'Achieve time freedom', icon: '🏖️' },
  { id: 'community', label: 'Build a community', icon: '🤝' },
  { id: 'passive', label: 'Create passive income', icon: '💸' },
  { id: 'scale', label: 'Scale an existing business', icon: '📈' },
  { id: 'invest', label: 'Learn to invest profits', icon: '💎' },
]

const ROADMAPS = [
  { id: 'shopify', icon: '🛍️', title: 'Shopify Brand', subtitle: 'E-commerce & product brand', weeks: 12, tag: 'Most Popular' },
  { id: 'digital', icon: '💻', title: 'Digital Products', subtitle: 'Courses, ebooks & tools', weeks: 8, tag: 'High ROI' },
  { id: 'creator', icon: '🎥', title: 'Content Creator', subtitle: 'Audience & monetization', weeks: 10, tag: null },
  { id: 'service', icon: '✨', title: 'Service Business', subtitle: 'Consulting, freelance & agency', weeks: 6, tag: 'Fastest Start' },
  { id: 'affiliate', icon: '🔗', title: 'Affiliate Marketing', subtitle: 'Passive income streams', weeks: 6, tag: null },
  { id: 'medspa', icon: '💆‍♀️', title: 'Med Spa / Wellness', subtitle: 'Beauty & wellness business', weeks: 16, tag: null },
]

const TOTAL_STEPS = 5

// ──────────────────────────────────────────
// Animations
// ──────────────────────────────────────────
const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
    scale: 0.97,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.25 },
  }),
}

// ──────────────────────────────────────────
// Step Components
// ──────────────────────────────────────────
function StepName({ data, onChange }: { data: OnboardingData; onChange: (d: Partial<OnboardingData>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 mb-2">
          Welcome to your<br />
          <span className="text-gradient-gold">CEO era ✨</span>
        </h1>
        <p className="text-ink-500">Let's personalize your dashboard. First — what's your name?</p>
      </div>
      <input
        className="input-field text-lg font-medium"
        placeholder="Your first name..."
        value={data.full_name}
        onChange={e => onChange({ full_name: e.target.value })}
        autoFocus
      />
    </div>
  )
}

function StepBusinessType({ data, onChange }: { data: OnboardingData; onChange: (d: Partial<OnboardingData>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold text-ink-900 mb-2">
          What kind of business<br />do you want to build?
        </h2>
        <p className="text-ink-500">Choose the one that excites you most — you can change this later.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {(Object.entries(BUSINESS_TYPES) as [BusinessType, typeof BUSINESS_TYPES[BusinessType]][]).map(([key, bt]) => (
          <motion.button
            key={key}
            onClick={() => onChange({ business_type: key })}
            whileTap={{ scale: 0.97 }}
            className={cn(
              'flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all',
              data.business_type === key
                ? 'border-gold-500 bg-gold-50 shadow-glow'
                : 'border-ink-100 bg-white hover:border-ink-300 hover:shadow-card'
            )}
          >
            <span className="text-2xl flex-shrink-0 mt-0.5">{bt.icon}</span>
            <div className="min-w-0">
              <p className={cn(
                'text-sm font-semibold leading-tight',
                data.business_type === key ? 'text-gold-700' : 'text-ink-900'
              )}>
                {bt.label}
              </p>
              <p className="text-xs text-ink-400 mt-0.5 leading-snug">{bt.description}</p>
            </div>
            {data.business_type === key && (
              <div className="w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center flex-shrink-0 ml-auto">
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function StepStage({ data, onChange }: { data: OnboardingData; onChange: (d: Partial<OnboardingData>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold text-ink-900 mb-2">
          Where are you right now?
        </h2>
        <p className="text-ink-500">No judgment — every CEO started somewhere. We just want to meet you there.</p>
      </div>
      <div className="space-y-3">
        {STAGES.map(stage => (
          <motion.button
            key={stage.value}
            onClick={() => onChange({ business_stage: stage.value })}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all',
              data.business_stage === stage.value
                ? 'border-gold-500 bg-gold-50'
                : 'border-ink-100 bg-white hover:border-ink-200'
            )}
          >
            <span className="text-2xl flex-shrink-0">{stage.icon}</span>
            <div className="flex-1">
              <p className={cn(
                'font-semibold text-sm',
                data.business_stage === stage.value ? 'text-gold-700' : 'text-ink-900'
              )}>
                {stage.label}
              </p>
              <p className="text-xs text-ink-400 mt-0.5">{stage.description}</p>
            </div>
            <div className={cn(
              'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
              data.business_stage === stage.value
                ? 'bg-gold-500 border-gold-500'
                : 'border-ink-200'
            )}>
              {data.business_stage === stage.value && (
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function StepGoals({ data, onChange }: { data: OnboardingData; onChange: (d: Partial<OnboardingData>) => void }) {
  const toggle = (id: string) => {
    const current = data.goals
    const updated = current.includes(id) ? current.filter(g => g !== id) : [...current, id]
    onChange({ goals: updated })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold text-ink-900 mb-2">
          What are you working<br />toward?
        </h2>
        <p className="text-ink-500">Pick all that apply — your goals shape your roadmap.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {GOALS.map(goal => {
          const selected = data.goals.includes(goal.id)
          return (
            <motion.button
              key={goal.id}
              onClick={() => toggle(goal.id)}
              whileTap={{ scale: 0.96 }}
              className={cn(
                'flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all',
                selected
                  ? 'border-gold-500 bg-gold-50'
                  : 'border-ink-100 bg-white hover:border-ink-200'
              )}
            >
              <span className="text-xl">{goal.icon}</span>
              <span className={cn(
                'text-xs font-semibold leading-tight flex-1',
                selected ? 'text-gold-700' : 'text-ink-700'
              )}>
                {goal.label}
              </span>
              {selected && (
                <div className="w-4 h-4 rounded-full bg-gold-500 flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

function StepRoadmap({ data, onChange }: { data: OnboardingData; onChange: (d: Partial<OnboardingData>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold text-ink-900 mb-2">
          Pick your first roadmap
        </h2>
        <p className="text-ink-500">This will be your step-by-step guide. You can unlock more later.</p>
      </div>
      <div className="space-y-3">
        {ROADMAPS.map(roadmap => (
          <motion.button
            key={roadmap.id}
            onClick={() => onChange({ selected_roadmap: roadmap.id })}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all',
              data.selected_roadmap === roadmap.id
                ? 'border-gold-500 bg-gold-50 shadow-glow'
                : 'border-ink-100 bg-white hover:border-ink-200 hover:shadow-card'
            )}
          >
            <span className="text-3xl flex-shrink-0">{roadmap.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={cn(
                  'font-semibold text-sm',
                  data.selected_roadmap === roadmap.id ? 'text-gold-700' : 'text-ink-900'
                )}>
                  {roadmap.title}
                </p>
                {roadmap.tag && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-gold-100 text-gold-700 rounded-full border border-gold-200">
                    {roadmap.tag}
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-400 mt-0.5">{roadmap.subtitle} • {roadmap.weeks} weeks</p>
            </div>
            <ChevronRight className={cn(
              'w-4 h-4 flex-shrink-0 transition-colors',
              data.selected_roadmap === roadmap.id ? 'text-gold-500' : 'text-ink-300'
            )} />
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function StepComplete({ data }: { data: OnboardingData }) {
  return (
    <div className="text-center space-y-6 py-4">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto shadow-glow"
      >
        <Crown className="w-12 h-12 text-white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 mb-3">
          {data.full_name ? `You're ready, ${data.full_name}!` : "You're ready!"}
        </h2>
        <p className="text-ink-500 text-lg">
          Your CEO dashboard is set up.<br />Let's build your empire. 👑
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-3 gap-3 max-w-sm mx-auto"
      >
        {[
          { icon: '🗺️', label: 'Roadmap ready' },
          { icon: '🔥', label: 'Streak starts today' },
          { icon: '🤖', label: 'AI unlocked' },
        ].map(item => (
          <div key={item.label} className="bg-gold-50 border border-gold-200 rounded-2xl p-3 text-center">
            <span className="text-2xl">{item.icon}</span>
            <p className="text-xs font-semibold text-gold-700 mt-1 leading-tight">{item.label}</p>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-wrap gap-2 justify-center"
      >
        {[
          { icon: '✅', text: 'Dashboard personalized' },
          { icon: '✅', text: 'Goals set' },
          { icon: '✅', text: 'Roadmap selected' },
        ].map(item => (
          <span key={item.text} className="flex items-center gap-1.5 text-xs text-success-dark font-medium px-3 py-1.5 bg-success-light rounded-full">
            {item.icon} {item.text}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

// ──────────────────────────────────────────
// Progress dots
// ──────────────────────────────────────────
function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === current ? 20 : 6,
            backgroundColor: i <= current ? '#C4A264' : '#E8E7E3',
          }}
          transition={{ duration: 0.3 }}
          className="h-1.5 rounded-full"
        />
      ))}
    </div>
  )
}

// ──────────────────────────────────────────
// Main Onboarding Page
// ──────────────────────────────────────────
const DEFAULT_DATA: OnboardingData = {
  full_name: '',
  business_type: null,
  business_stage: null,
  goals: [],
  selected_roadmap: null,
  revenue_goal: null,
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [data, setData] = useState<OnboardingData>(DEFAULT_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isLastStep = step === TOTAL_STEPS - 1
  const isComplete = step === TOTAL_STEPS

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const canAdvance = () => {
    switch (step) {
      case 0: return data.full_name.trim().length >= 2
      case 1: return data.business_type !== null
      case 2: return data.business_stage !== null
      case 3: return data.goals.length > 0
      case 4: return data.selected_roadmap !== null
      default: return true
    }
  }

  const goNext = () => {
    if (!canAdvance()) return
    setDirection(1)
    setStep(s => s + 1)
  }

  const goBack = () => {
    if (step === 0) return
    setDirection(-1)
    setStep(s => s - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: data.full_name,
        business_type: data.business_type,
        business_stage: data.business_stage,
        goals: data.goals,
        selected_roadmap: data.selected_roadmap,
        revenue_goal: data.revenue_goal,
        onboarding_completed: true,
      })
      if (error) throw error
      router.push('/dashboard')
    } catch (err) {
      console.error('Onboarding save failed:', err)
      setIsSubmitting(false)
    }
  }

  const steps = [
    <StepName key="name" data={data} onChange={updateData} />,
    <StepBusinessType key="type" data={data} onChange={updateData} />,
    <StepStage key="stage" data={data} onChange={updateData} />,
    <StepGoals key="goals" data={data} onChange={updateData} />,
    <StepRoadmap key="roadmap" data={data} onChange={updateData} />,
  ]

  if (isComplete) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-6">
        <div className="max-w-lg w-full">
          <StepComplete data={data} />
          <div className="mt-8 flex justify-center">
            <motion.button
              onClick={handleSubmit}
              disabled={isSubmitting}
              whileTap={{ scale: 0.97 }}
              className="btn-gold text-base py-3.5 px-10 shadow-glow disabled:opacity-70"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                  />
                  Setting up...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Enter your dashboard <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col w-96 bg-ink-900 p-10 relative overflow-hidden flex-shrink-0">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-400/10 rounded-full blur-2xl" />

        <div className="relative">
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-glow">
              <Crown className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-sm text-white">Rinse & Repeat</span>
              <span className="block text-[10px] font-bold text-gold-400 uppercase tracking-widest">CEO</span>
            </div>
          </div>

          <h2 className="font-display text-2xl font-bold text-white mb-3 leading-snug">
            You're 2 minutes away from your CEO dashboard.
          </h2>
          <p className="text-ink-300 text-sm leading-relaxed mb-10">
            Join 12,400+ founders who chose to build their dream business instead of waiting for the perfect moment.
          </p>

          {/* Step list */}
          <div className="space-y-4">
            {['Your profile', 'Your business type', 'Your stage', 'Your goals', 'Your roadmap'].map(
              (label, i) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all',
                    i < step
                      ? 'bg-gold-500 text-white'
                      : i === step
                      ? 'bg-white text-ink-900'
                      : 'bg-ink-700 text-ink-400'
                  )}>
                    {i < step ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
                  </div>
                  <span className={cn(
                    'text-sm font-medium transition-colors',
                    i === step ? 'text-white' : i < step ? 'text-gold-400' : 'text-ink-500'
                  )}>
                    {label}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative mt-auto pt-8 border-t border-ink-700">
          <p className="text-ink-300 text-sm italic leading-relaxed">
            "She believed she could, so she did."
          </p>
          <div className="flex mt-3 gap-1">
            {[1,2,3,4,5].map(i => <Sparkles key={i} className="w-3 h-3 text-gold-500" />)}
          </div>
        </div>
      </div>

      {/* Right panel — steps */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 sm:px-10 py-5 border-b border-ink-100 bg-white lg:bg-transparent">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
              <Crown className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-sm text-ink-900">CEO</span>
          </div>
          <ProgressDots current={step} total={TOTAL_STEPS} />
          <span className="text-xs font-medium text-ink-400">
            {step + 1} of {TOTAL_STEPS}
          </span>
        </div>

        {/* Step content */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-8 overflow-y-auto">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {steps[step]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-6 sm:px-10 py-6 border-t border-ink-100 flex items-center justify-between">
          <button
            onClick={goBack}
            disabled={step === 0}
            className={cn(
              'flex items-center gap-2 text-sm font-medium transition-colors',
              step === 0 ? 'text-ink-200 cursor-not-allowed' : 'text-ink-500 hover:text-ink-900'
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <motion.button
            onClick={isLastStep ? () => { setDirection(1); setStep(TOTAL_STEPS) } : goNext}
            disabled={!canAdvance()}
            whileTap={{ scale: 0.97 }}
            className={cn(
              'btn-gold py-2.5 px-6 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none'
            )}
          >
            {isLastStep ? (
              <span className="flex items-center gap-2">Let's go! <Crown className="w-4 h-4" /></span>
            ) : (
              <span className="flex items-center gap-2">Continue <ArrowRight className="w-4 h-4" /></span>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
