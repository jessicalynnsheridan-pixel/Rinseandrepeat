'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, ArrowRight, ArrowLeft, Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { BusinessType, BusinessStage, OnboardingData } from '@/types'
import { BUSINESS_TYPES } from '@/types'

// ── Step data ──────────────────────────────────────────────────────────────

const STAGES: { value: BusinessStage; label: string; description: string; icon: string }[] = [
  { value: 'idea', label: 'Just an idea', description: "I have a concept but haven't started yet", icon: '💡' },
  { value: 'building', label: 'Building now', description: "I've started but haven't launched", icon: '🔨' },
  { value: 'launched', label: 'Launched', description: "I'm open for business but growing", icon: '🚀' },
  { value: 'scaling', label: 'Scaling up', description: "I'm making money and want more", icon: '📈' },
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

// ── Animations ─────────────────────────────────────────────────────────────

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0, scale: 0.97 }),
  center: { x: 0, opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0, scale: 0.97, transition: { duration: 0.25 } }),
}

// ── Shared styles ───────────────────────────────────────────────────────────

const CARD_SELECTED = 'border-[#7C3AED] bg-[#EDE9FE]'
const CARD_DEFAULT  = 'border-[#E4E4E7] bg-white hover:border-[#C4B5FD]'

// ── Steps ───────────────────────────────────────────────────────────────────

function StepName({ data, onChange }: { data: OnboardingData; onChange: (d: Partial<OnboardingData>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#18181B] mb-2">
          Welcome to your<br />
          <span className="text-[#7C3AED]">CEO era ✨</span>
        </h1>
        <p className="text-[#71717A]">Let's personalise your dashboard. First  -  what's your name?</p>
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
        <h2 className="text-3xl font-bold text-[#18181B] mb-2">
          What kind of business<br />do you want to build?
        </h2>
        <p className="text-[#71717A]">Choose the one that excites you most  -  you can change this later.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {(Object.entries(BUSINESS_TYPES) as [BusinessType, typeof BUSINESS_TYPES[BusinessType]][]).map(([key, bt]) => (
          <motion.button
            key={key}
            onClick={() => onChange({ business_type: key })}
            whileTap={{ scale: 0.97 }}
            className={cn('flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all',
              data.business_type === key ? CARD_SELECTED : CARD_DEFAULT)}
          >
            <span className="text-2xl flex-shrink-0 mt-0.5">{bt.icon}</span>
            <div className="min-w-0">
              <p className={cn('text-sm font-semibold leading-tight',
                data.business_type === key ? 'text-[#5B21B6]' : 'text-[#18181B]')}>
                {bt.label}
              </p>
              <p className="text-xs text-[#A1A1AA] mt-0.5 leading-snug">{bt.description}</p>
            </div>
            {data.business_type === key && (
              <div className="w-5 h-5 rounded-full bg-[#7C3AED] flex items-center justify-center flex-shrink-0 ml-auto">
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
        <h2 className="text-3xl font-bold text-[#18181B] mb-2">Where are you right now?</h2>
        <p className="text-[#71717A]">No judgment  -  every CEO started somewhere.</p>
      </div>
      <div className="space-y-3">
        {STAGES.map(stage => (
          <motion.button
            key={stage.value}
            onClick={() => onChange({ business_stage: stage.value })}
            whileTap={{ scale: 0.98 }}
            className={cn('w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all',
              data.business_stage === stage.value ? CARD_SELECTED : CARD_DEFAULT)}
          >
            <span className="text-2xl flex-shrink-0">{stage.icon}</span>
            <div className="flex-1">
              <p className={cn('font-semibold text-sm',
                data.business_stage === stage.value ? 'text-[#5B21B6]' : 'text-[#18181B]')}>
                {stage.label}
              </p>
              <p className="text-xs text-[#A1A1AA] mt-0.5">{stage.description}</p>
            </div>
            <div className={cn('w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
              data.business_stage === stage.value ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-[#D4D4D8]')}>
              {data.business_stage === stage.value && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function StepGoals({ data, onChange }: { data: OnboardingData; onChange: (d: Partial<OnboardingData>) => void }) {
  const toggle = (id: string) => {
    const updated = data.goals.includes(id)
      ? data.goals.filter(g => g !== id)
      : [...data.goals, id]
    onChange({ goals: updated })
  }
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-[#18181B] mb-2">What are you working<br />toward?</h2>
        <p className="text-[#71717A]">Pick all that apply  -  your goals shape your roadmap.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {GOALS.map(goal => {
          const selected = data.goals.includes(goal.id)
          return (
            <motion.button
              key={goal.id}
              onClick={() => toggle(goal.id)}
              whileTap={{ scale: 0.96 }}
              className={cn('flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all',
                selected ? CARD_SELECTED : CARD_DEFAULT)}
            >
              <span className="text-xl">{goal.icon}</span>
              <span className={cn('text-xs font-semibold leading-tight flex-1',
                selected ? 'text-[#5B21B6]' : 'text-[#3F3F46]')}>
                {goal.label}
              </span>
              {selected && (
                <div className="w-4 h-4 rounded-full bg-[#7C3AED] flex items-center justify-center flex-shrink-0">
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
        <h2 className="text-3xl font-bold text-[#18181B] mb-2">Pick your first roadmap</h2>
        <p className="text-[#71717A]">This will be your step-by-step guide. You can unlock more later.</p>
      </div>
      <div className="space-y-3">
        {ROADMAPS.map(roadmap => (
          <motion.button
            key={roadmap.id}
            onClick={() => onChange({ selected_roadmap: roadmap.id })}
            whileTap={{ scale: 0.98 }}
            className={cn('w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all',
              data.selected_roadmap === roadmap.id ? CARD_SELECTED : CARD_DEFAULT)}
          >
            <span className="text-3xl flex-shrink-0">{roadmap.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={cn('font-semibold text-sm',
                  data.selected_roadmap === roadmap.id ? 'text-[#5B21B6]' : 'text-[#18181B]')}>
                  {roadmap.title}
                </p>
                {roadmap.tag && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#7C3AED] text-white rounded-full">
                    {roadmap.tag}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#A1A1AA] mt-0.5">{roadmap.subtitle} · {roadmap.weeks} weeks</p>
            </div>
            <ChevronRight className={cn('w-4 h-4 flex-shrink-0 transition-colors',
              data.selected_roadmap === roadmap.id ? 'text-[#7C3AED]' : 'text-[#D4D4D8]')} />
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ── Day One Mission data ────────────────────────────────────────────────────

const DAY_ONE_MISSIONS: Record<string, { task: string; description: string; xp: number; time: string }> = {
  shopify: {
    task: 'Choose your niche',
    description: 'Research 5 potential niches using TikTok/Instagram. Validate demand, check competition, and commit to one. This single decision unlocks everything else.',
    xp: 50,
    time: '~2 hours',
  },
  digital: {
    task: 'Define your core offer in one sentence',
    description: 'Write exactly who your product is for, what transformation it delivers, and why they should buy from you. Clarity here = every marketing decision made easier.',
    xp: 50,
    time: '~1 hour',
  },
  creator: {
    task: 'Record your first piece of content',
    description: 'Film a 60-second intro video  -  who you are, what you\'re building, and why. Don\'t edit. Post it raw. Authenticity beats perfection every single time.',
    xp: 50,
    time: '~30 min',
  },
  service: {
    task: 'Write your service offer',
    description: 'Define what you do, who it\'s for, and your starting price. If you can\'t describe it in two sentences, you can\'t sell it. Start here.',
    xp: 50,
    time: '~1 hour',
  },
  affiliate: {
    task: 'Choose your niche & first product',
    description: 'Pick a niche you genuinely know. Find one product you\'d recommend to a friend. Apply to its affiliate program today. Real recommenders always outperform fake ones.',
    xp: 50,
    time: '~2 hours',
  },
  medspa: {
    task: 'Draft your service menu',
    description: 'List your top 3–5 services with prices. Research 3 competitors nearby. Validate your pricing against local market rates. Done in an afternoon.',
    xp: 50,
    time: '~2 hours',
  },
}

// Confetti burst for the completion screen
function Confetti() {
  const particles = [
    { x: 12, color: '#7C3AED', delay: 0, size: 8 },
    { x: 25, color: '#F97316', delay: 0.1, size: 6 },
    { x: 38, color: '#16A34A', delay: 0.05, size: 10 },
    { x: 50, color: '#E8B4B8', delay: 0.15, size: 7 },
    { x: 62, color: '#FFD700', delay: 0.08, size: 9 },
    { x: 75, color: '#7C3AED', delay: 0.2, size: 6 },
    { x: 88, color: '#F97316', delay: 0.12, size: 8 },
    { x: 20, color: '#16A34A', delay: 0.25, size: 5 },
    { x: 45, color: '#7C3AED', delay: 0.18, size: 11 },
    { x: 70, color: '#FFD700', delay: 0.22, size: 7 },
    { x: 8,  color: '#E8B4B8', delay: 0.3, size: 6 },
    { x: 92, color: '#16A34A', delay: 0.28, size: 9 },
  ]
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ y: '-5vh', x: `${p.x}vw`, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ y: '110vh', opacity: 0, rotate: 360, scale: 0.5 }}
          transition={{ duration: 2.5 + Math.random(), delay: p.delay, ease: [0.2, 0.8, 0.9, 1] }}
          className="absolute rounded-sm"
          style={{ width: p.size, height: p.size * 0.6, backgroundColor: p.color }}
        />
      ))}
    </div>
  )
}

function StepComplete({ data }: { data: OnboardingData }) {
  const firstName = data.full_name?.split(' ')[0] || 'CEO'
  const roadmapId = data.selected_roadmap ?? 'shopify'
  const mission = DAY_ONE_MISSIONS[roadmapId] ?? DAY_ONE_MISSIONS.shopify

  return (
    <div className="space-y-6 py-2">
      <Confetti />

      {/* Identity reveal */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.05 }}
        className="flex flex-col items-center text-center"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center shadow-[0_0_48px_rgba(124,58,237,0.35)] mb-4">
          <Crown className="w-10 h-10 text-white" />
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-2xl sm:text-3xl font-bold text-[#18181B] leading-tight"
        >
          Welcome to your CEO era,<br />
          <span className="text-[#7C3AED]">{firstName}.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-[#71717A] mt-2"
        >
          Your dashboard is personalised. Your roadmap is loaded.<br />
          Now  -  your first mission starts today.
        </motion.p>
      </motion.div>

      {/* Day One Mission card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative bg-[#18181B] rounded-2xl p-5 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/20 to-transparent" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED]">Day One Mission</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#52525B]">{mission.time}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#7C3AED]/20 text-[#A78BFA] rounded-full">
                +{mission.xp} XP
              </span>
            </div>
          </div>
          <h3 className="text-base font-semibold text-white mb-2 leading-snug">{mission.task}</h3>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">{mission.description}</p>
        </div>
      </motion.div>

      {/* Quick wins */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="grid grid-cols-3 gap-2"
      >
        {[
          { icon: '🗺️', label: 'Roadmap\nready' },
          { icon: '🔥', label: 'Streak\nstarts today' },
          { icon: '🤖', label: 'AI assistant\nunlocked' },
        ].map(item => (
          <div key={item.label} className="bg-[#EDE9FE] border border-[#C4B5FD] rounded-xl p-3 text-center">
            <span className="text-xl">{item.icon}</span>
            <p className="text-[10px] font-semibold text-[#5B21B6] mt-1 leading-tight whitespace-pre-line">{item.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

// ── Progress dots ───────────────────────────────────────────────────────────

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <motion.div
          key={i}
          animate={{ width: i === current ? 20 : 6, backgroundColor: i <= current ? '#7C3AED' : '#E4E4E7' }}
          transition={{ duration: 0.3 }}
          className="h-1.5 rounded-full"
        />
      ))}
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────

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

  const updateData = (updates: Partial<OnboardingData>) => setData(prev => ({ ...prev, ...updates }))

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

    // Safety net: if any await hangs (Safari ITP / slow network),
    // navigate after 4 s so the user is never permanently stuck
    const safetyTimer = setTimeout(() => router.push('/dashboard'), 4000)

    try {
      // getSession reads localStorage (no network)  -  avoids hanging on getUser()
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id

      if (userId) {
        // Single upsert: one round trip, marks onboarding complete + saves profile
        await supabase.from('profiles').upsert({
          id: userId,
          onboarding_completed: true,
          full_name: data.full_name,
          business_type: data.business_type,
          business_stage: data.business_stage,
          goals: data.goals,
          selected_roadmap: data.selected_roadmap,
        })
      }
    } catch (err) {
      console.error('Onboarding save error (non-fatal):', err)
    } finally {
      // Always navigate  -  finally runs even if the try block throws or hangs
      clearTimeout(safetyTimer)
      router.push('/dashboard')
    }
  }

  const steps = [
    <StepName key="name" data={data} onChange={updateData} />,
    <StepBusinessType key="type" data={data} onChange={updateData} />,
    <StepStage key="stage" data={data} onChange={updateData} />,
    <StepGoals key="goals" data={data} onChange={updateData} />,
    <StepRoadmap key="roadmap" data={data} onChange={updateData} />,
  ]

  // ── Completion screen ──────────────────────────────────────────────────────
  if (isComplete) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6">
        <div className="max-w-lg w-full">
          <StepComplete data={data} />
          <div className="mt-8 flex justify-center">
            <motion.button
              onClick={handleSubmit}
              disabled={isSubmitting}
              whileTap={{ scale: 0.97 }}
              className="btn-primary text-base py-3.5 px-10 disabled:opacity-70"
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
                  Start my Day One Mission <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    )
  }

  // ── Step flow ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Left branding panel (desktop) */}
      <div className="hidden lg:flex flex-col w-96 bg-[#18181B] p-10 relative overflow-hidden flex-shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#7C3AED]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#7C3AED]/10 rounded-full blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED] flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Rinse & Repeat</p>
              <p className="text-[10px] font-semibold text-[#7C3AED] uppercase tracking-widest">CEO</p>
            </div>
          </div>

          <div className="space-y-6 mt-8">
            {[
              { step: 1, label: 'Your name', done: step > 0 },
              { step: 2, label: 'Business type', done: step > 1 },
              { step: 3, label: 'Where you are now', done: step > 2 },
              { step: 4, label: 'Your goals', done: step > 3 },
              { step: 5, label: 'Your roadmap', done: step > 4 },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all',
                  item.done
                    ? 'bg-[#7C3AED] text-white'
                    : step === i
                    ? 'bg-white text-[#18181B]'
                    : 'bg-white/10 text-white/30'
                )}>
                  {item.done ? <Check className="w-3 h-3" strokeWidth={3} /> : item.step}
                </div>
                <p className={cn('text-sm font-medium transition-all',
                  item.done ? 'text-white/60 line-through' : step === i ? 'text-white' : 'text-white/30')}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-auto">
          <p className="text-xs text-white/30">Step {step + 1} of {TOTAL_STEPS}</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-[#F4F4F5]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-[#18181B]">Rinse & Repeat CEO</span>
          </div>
          <ProgressDots current={step} total={TOTAL_STEPS} />
        </div>

        {/* Step content */}
        <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-xl mx-auto w-full">
          <div className="hidden lg:block mb-8">
            <ProgressDots current={step} total={TOTAL_STEPS} />
          </div>

          <div className="relative overflow-hidden">
            <AnimatePresence custom={direction} mode="wait">
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

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={goBack}
              className={cn(
                'flex items-center gap-2 text-sm font-medium text-[#A1A1AA] hover:text-[#71717A] transition-colors',
                step === 0 && 'invisible'
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={isLastStep ? goNext : goNext}
              disabled={!canAdvance()}
              className="btn-primary py-3 px-8 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLastStep ? (
                <span className="flex items-center gap-2">
                  Finish <Check className="w-4 h-4" />
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
