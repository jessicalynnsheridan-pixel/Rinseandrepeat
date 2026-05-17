'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flame, Zap, TrendingUp, Check, ChevronRight,
  ArrowRight, BookOpen, Plus, Sparkles, Crown, Target,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn, getGreeting, formatCurrency } from '@/lib/utils'
import { Sidebar } from '@/components/navigation/Sidebar'
import { MobileNav } from '@/components/navigation/MobileNav'
import { useUser } from '@/components/providers/UserProvider'

// ─── Helpers ───────────────────────────────────────────────────────────────

function todayKey() {
  return new Date().toISOString().split('T')[0]
}
function ringsStorageKey(userId: string) {
  return `${userId}_rings_${todayKey()}`
}

// ─── Roadmap metadata ──────────────────────────────────────────────────────

const ROADMAP_META: Record<string, {
  label: string
  firstStep: string
  firstStepDesc: string
  xp: number
  steps: { id: string; title: string }[]
}> = {
  shopify: {
    label: 'Shopify Brand',
    firstStep: 'Choose your niche',
    firstStepDesc: 'Research 5 potential niches, validate with TikTok/Instagram, and decide. This is your foundation  -  everything else builds on this.',
    xp: 50,
    steps: [
      { id: 's1', title: 'Choose your niche' },
      { id: 's2', title: 'Register your business' },
      { id: 's3', title: 'Set up your Shopify store' },
      { id: 's4', title: 'Source your first products' },
    ],
  },
  digital: {
    label: 'Digital Products',
    firstStep: 'Define your core offer',
    firstStepDesc: 'Decide what digital product to create  -  a course, ebook, template, or toolkit. Research what your audience already buys.',
    xp: 50,
    steps: [
      { id: 'd1', title: 'Define your core offer' },
      { id: 'd2', title: 'Validate the idea' },
      { id: 'd3', title: 'Create your product' },
      { id: 'd4', title: 'Set up your sales page' },
    ],
  },
  creator: {
    label: 'Content Creator',
    firstStep: 'Choose your content niche',
    firstStepDesc: 'Pick the topic you can create content about consistently. Narrow beats broad  -  "skincare for Black women" beats "beauty tips".',
    xp: 50,
    steps: [
      { id: 'c1', title: 'Choose your content niche' },
      { id: 'c2', title: 'Set up your platforms' },
      { id: 'c3', title: 'Create your first 10 posts' },
      { id: 'c4', title: 'Build your content system' },
    ],
  },
  service: {
    label: 'Service Business',
    firstStep: 'Define your service offer',
    firstStepDesc: 'Decide exactly what you do, for who, and at what price. One clear offer closes faster than a menu of options.',
    xp: 50,
    steps: [
      { id: 'sv1', title: 'Define your service offer' },
      { id: 'sv2', title: 'Set your pricing' },
      { id: 'sv3', title: 'Build a simple landing page' },
      { id: 'sv4', title: 'Do outreach and land your first client' },
    ],
  },
  affiliate: {
    label: 'Affiliate Marketing',
    firstStep: 'Choose your affiliate niche',
    firstStepDesc: 'Pick a niche you can speak about authentically. The best affiliates recommend products they actually use.',
    xp: 50,
    steps: [
      { id: 'a1', title: 'Choose your affiliate niche' },
      { id: 'a2', title: 'Join affiliate programmes' },
      { id: 'a3', title: 'Build your content channel' },
      { id: 'a4', title: 'Publish your first review' },
    ],
  },
  medspa: {
    label: 'Med Spa / Wellness',
    firstStep: 'Research licensing requirements',
    firstStepDesc: 'Find out exactly what licences and certifications you need in your state. This is non-negotiable  -  get clarity here first.',
    xp: 50,
    steps: [
      { id: 'm1', title: 'Research licensing requirements' },
      { id: 'm2', title: 'Write your business plan' },
      { id: 'm3', title: 'Register your business' },
      { id: 'm4', title: 'Secure your location' },
    ],
  },
}

const DEFAULT_ROADMAP = 'shopify'

// ─── Context-aware greeting ────────────────────────────────────────────────

function getContextGreeting(firstName: string | undefined, streak: number): { line1: string; line2: string } {
  const name = firstName ? `, ${firstName}` : ''
  const hour = new Date().getHours()
  const timeWord = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

  if (streak === 0) return { line1: `Good ${timeWord}${name}.`, line2: 'Start your streak today.' }
  if (streak === 1) return { line1: `Day 1${name}.`, line2: 'Every empire starts somewhere.' }
  if (streak === 7) return { line1: `One week straight${name}.`, line2: "You're building something real." }
  if (streak === 14) return { line1: `Two weeks in${name}.`, line2: 'This is already more than most.' }
  if (streak === 30) return { line1: `30 days${name}.`, line2: "You're in the top 1%." }
  if (streak >= 100) return { line1: `${streak} days${name}.`, line2: 'The Century Club. Welcome.' }
  if (streak > 0 && streak < 7) return { line1: `Day ${streak}${name}.`, line2: 'Keep the momentum.' }
  return { line1: `Good ${timeWord}${name}.`, line2: `Day ${streak} streak. Don't stop now.` }
}

// ─── THREE RINGS ───────────────────────────────────────────────────────────

function ThreeRings({ build, earn, grow }: { build: boolean; earn: boolean; grow: boolean }) {
  const rings = [
    { done: build, color: '#7C3AED', bg: '#EDE9FE', r: 54, label: 'BUILD' },
    { done: earn, color: '#16A34A', bg: '#DCFCE7', r: 40, label: 'EARN' },
    { done: grow, color: '#F97316', bg: '#FEF3C7', r: 26, label: 'GROW' },
  ]
  const total = [build, earn, grow].filter(Boolean).length
  const circumference = (r: number) => 2 * Math.PI * r

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-[130px] h-[130px]">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 130 130">
          {rings.map(ring => (
            <g key={ring.label}>
              <circle cx="65" cy="65" r={ring.r} fill="none" stroke={ring.bg} strokeWidth="8" />
              <motion.circle
                cx="65" cy="65" r={ring.r}
                fill="none" stroke={ring.color} strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference(ring.r)}
                initial={{ strokeDashoffset: circumference(ring.r) }}
                animate={{ strokeDashoffset: ring.done ? 0 : circumference(ring.r) }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
              />
            </g>
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {total === 3 ? (
            <Crown className="w-6 h-6 text-[#7C3AED]" />
          ) : (
            <>
              <span className="text-xl font-bold text-[#18181B]">{total}</span>
              <span className="text-[10px] text-[#A1A1AA]">of 3</span>
            </>
          )}
        </div>
      </div>
      <div className="flex gap-3 mt-2">
        {rings.map(ring => (
          <div key={ring.label} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ring.done ? ring.color : '#E4E4E7' }} />
            <span className="text-[10px] font-semibold" style={{ color: ring.done ? ring.color : '#A1A1AA' }}>{ring.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Mobile rings: horizontal strip
function RingStrip({ build, earn, grow }: { build: boolean; earn: boolean; grow: boolean }) {
  const total = [build, earn, grow].filter(Boolean).length
  const items = [
    { done: build, color: '#7C3AED', label: 'BUILD' },
    { done: earn, color: '#16A34A', label: 'EARN' },
    { done: grow, color: '#F97316', label: 'GROW' },
  ]
  return (
    <div className="flex items-center gap-4">
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-full border-2"
            style={{
              backgroundColor: item.done ? item.color : 'transparent',
              borderColor: item.done ? item.color : '#D4D4D8',
            }}
          />
          <span className="text-xs font-semibold" style={{ color: item.done ? item.color : '#A1A1AA' }}>
            {item.label}
          </span>
        </div>
      ))}
      <span className="text-xs text-[#A1A1AA] ml-1"> -  {total}/3 today</span>
    </div>
  )
}

// ─── STREAK TIER DISPLAY ───────────────────────────────────────────────────

function StreakDisplay({ streak }: { streak: number }) {
  type Tier = 'cold' | 'warm' | 'hot' | 'blazing' | 'legendary'
  const tier: Tier = streak === 0 ? 'cold' : streak < 7 ? 'warm' : streak < 30 ? 'hot' : streak < 100 ? 'blazing' : 'legendary'
  const config: Record<Tier, { color: string; bg: string; icon: string; label: string }> = {
    cold: { color: '#A1A1AA', bg: '#F4F4F5', icon: '○', label: 'Start streak' },
    warm: { color: '#F97316', bg: '#FEF3C7', icon: '🔥', label: `Day ${streak}` },
    hot: { color: '#EA580C', bg: '#FFEDD5', icon: '🔥', label: `${streak} days` },
    blazing: { color: '#7C3AED', bg: '#EDE9FE', icon: '🔥', label: `${streak} days` },
    legendary: { color: '#18181B', bg: '#F4F4F5', icon: '👑', label: `${streak} days` },
  }
  const { color, bg, icon, label } = config[tier]

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: bg }}>
      <span className="text-base leading-none">{icon}</span>
      <div>
        <p className="text-xs font-bold leading-none" style={{ color }}>{label}</p>
        <p className="text-[10px] text-[#A1A1AA] mt-0.5">{streak === 0 ? 'no streak yet' : 'streak'}</p>
      </div>
    </div>
  )
}

// ─── SETUP GUIDE ───────────────────────────────────────────────────────────

const SETUP_ITEMS = [
  { id: 'habit', label: 'Add your first habit', href: '/habits' },
  { id: 'milestone', label: 'Complete your first milestone', href: '/roadmaps' },
  { id: 'income', label: 'Log your first income', href: '/revenue' },
  { id: 'community', label: 'Introduce yourself in the community', href: '/community' },
  { id: 'profile', label: 'Complete your profile', href: '/settings' },
]

function SetupGuide({ userId }: { userId?: string }) {
  const router = useRouter()
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [dismissed, setDismissed] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (!userId) return
    try {
      const raw = localStorage.getItem(`${userId}_setup_v1`)
      const saved = raw ? JSON.parse(raw) : {}
      const initialChecked: Set<string> = new Set(saved.checked ?? [])
      if (saved.dismissed) { setDismissed(true); setHydrated(true); return }

      // Auto-check habit
      const habitsRaw = localStorage.getItem(`${userId}_habits_v1`)
      if (habitsRaw && JSON.parse(habitsRaw).length > 0) initialChecked.add('habit')

      // Auto-check income
      const revRaw = localStorage.getItem(`${userId}_revenue_v1`)
      if (revRaw) {
        const revData = JSON.parse(revRaw)
        const hasEntries = ['week', 'month', 'year'].some(
          (p) => Array.isArray(revData[p]?.entries) && revData[p].entries.length > 0
        )
        if (hasEntries) initialChecked.add('income')
      }

      setChecked(initialChecked)
    } catch { /* ignore */ }
    setHydrated(true)
  }, [userId])

  function persist(nextChecked: Set<string>, nextDismissed: boolean) {
    if (!userId) return
    try {
      localStorage.setItem(
        `${userId}_setup_v1`,
        JSON.stringify({ checked: Array.from(nextChecked), dismissed: nextDismissed })
      )
    } catch { /* ignore */ }
  }

  function toggleItem(id: string) {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      persist(next, dismissed)
      return next
    })
  }

  function dismiss() {
    setDismissed(true)
    persist(checked, true)
  }

  if (!hydrated || dismissed) return null

  const completedCount = checked.size
  const totalCount = SETUP_ITEMS.length
  const allDone = completedCount === totalCount
  const pct = Math.round((completedCount / totalCount) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[#E4E4E7] p-5"
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold uppercase tracking-widest text-[#A1A1AA]">Getting Started</p>
        <button onClick={dismiss} className="text-[10px] text-[#A1A1AA] hover:text-[#71717A] transition-colors">
          {allDone ? 'Dismiss ✓' : 'Skip'}
        </button>
      </div>
      <p className="text-sm font-semibold text-[#18181B] mb-3">
        {allDone ? "Setup complete! You're ready to build." : `${completedCount} of ${totalCount} steps complete`}
      </p>
      <div className="w-full h-1 bg-[#F4F4F5] rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full rounded-full bg-[#7C3AED]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <div className="space-y-2">
        {SETUP_ITEMS.map(item => {
          const done = checked.has(item.id)
          return (
            <div key={item.id} className="flex items-center gap-3">
              <button
                onClick={() => toggleItem(item.id)}
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                  done ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-[#D4D4D8] hover:border-[#7C3AED]'
                )}
              >
                {done && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
              </button>
              <button
                onClick={() => router.push(item.href)}
                className={cn(
                  'text-sm flex-1 text-left transition-colors',
                  done ? 'text-[#A1A1AA] line-through' : 'text-[#3F3F46] font-medium hover:text-[#7C3AED]'
                )}
              >
                {item.label}
              </button>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── RINGS WIDGET CARD ─────────────────────────────────────────────────────

function RingsCard({
  rings,
  isMobile,
}: {
  rings: { build: boolean; earn: boolean; grow: boolean }
  isMobile?: boolean
}) {
  const router = useRouter()

  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-[#E4E4E7] p-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-2">Daily CEO Ritual</p>
            <RingStrip {...rings} />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/roadmaps')}
              className="px-2.5 py-1.5 text-[10px] font-semibold rounded-lg bg-[#EDE9FE] text-[#7C3AED]"
            >
              BUILD
            </button>
            <button
              onClick={() => router.push('/revenue')}
              className="px-2.5 py-1.5 text-[10px] font-semibold rounded-lg bg-[#DCFCE7] text-[#16A34A]"
            >
              EARN
            </button>
            <button
              onClick={() => router.push('/habits')}
              className="px-2.5 py-1.5 text-[10px] font-semibold rounded-lg bg-[#FEF3C7] text-[#F97316]"
            >
              GROW
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[#E4E4E7] p-5 flex flex-col items-center"
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-4 self-start">Daily CEO Ritual</p>
      <ThreeRings {...rings} />
      <p className="text-xs text-[#A1A1AA] mt-3 text-center">
        {[rings.build, rings.earn, rings.grow].filter(Boolean).length === 3
          ? 'All three rings closed. Crowned.'
          : 'Close all 3 rings today.'}
      </p>
      <div className="flex gap-2 mt-4 w-full">
        <button
          onClick={() => router.push('/roadmaps')}
          className="flex-1 py-2 text-[10px] font-bold rounded-xl bg-[#EDE9FE] text-[#7C3AED] hover:bg-[#DDD6FE] transition-colors"
        >
          BUILD
        </button>
        <button
          onClick={() => router.push('/revenue')}
          className="flex-1 py-2 text-[10px] font-bold rounded-xl bg-[#DCFCE7] text-[#16A34A] hover:bg-[#BBF7D0] transition-colors"
        >
          EARN
        </button>
        <button
          onClick={() => router.push('/habits')}
          className="flex-1 py-2 text-[10px] font-bold rounded-xl bg-[#FEF3C7] text-[#F97316] hover:bg-[#FDE68A] transition-colors"
        >
          GROW
        </button>
      </div>
    </motion.div>
  )
}

// ─── TODAY'S FOCUS ─────────────────────────────────────────────────────────

function TodayFocus({ roadmapSlug, userId }: { roadmapSlug: string; userId?: string }) {
  const router = useRouter()
  const [done, setDone] = useState(false)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  const meta = ROADMAP_META[roadmapSlug] ?? ROADMAP_META[DEFAULT_ROADMAP]

  useEffect(() => {
    if (!userId) return
    try {
      const raw = localStorage.getItem(`${userId}_roadmap_${roadmapSlug}_v1`)
      if (raw) {
        const saved = JSON.parse(raw)
        setCompletedIds(new Set(saved.completed ?? []))
      }
    } catch { /* ignore */ }
  }, [userId, roadmapSlug])

  // Find first uncompleted step
  const nextStep = meta.steps.find(s => !completedIds.has(s.id))
  const allDone = !nextStep

  const stepTitle = nextStep?.title ?? meta.firstStep
  const stepDesc = allDone
    ? 'You have completed all steps in this phase. Check your roadmap for what comes next.'
    : (nextStep?.id === meta.steps[0].id ? meta.firstStepDesc : `Continue with: ${stepTitle}`)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl border border-[#E4E4E7] p-6 relative overflow-hidden"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#7C3AED] rounded-l-2xl" />
      <div className="pl-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED]">Today&apos;s focus</span>
          <span className="text-[10px] text-[#A1A1AA]">· {meta.label}</span>
        </div>
        <h2 className="text-lg font-semibold text-[#18181B] leading-snug mb-2">{stepTitle}</h2>
        <p className="text-sm text-[#71717A] leading-relaxed mb-5">{stepDesc}</p>
        <div className="flex items-center gap-3 flex-wrap">
          {!allDone && (
            <button
              onClick={() => setDone(!done)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                done
                  ? 'bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]'
                  : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
              )}
            >
              <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
              {done ? `Done! +${meta.xp} XP` : 'Mark as done'}
            </button>
          )}
          <button
            onClick={() => router.push(`/roadmaps/${roadmapSlug}`)}
            className="flex items-center gap-1.5 text-sm text-[#71717A] hover:text-[#18181B] transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            {allDone ? 'View roadmap' : 'Open roadmap'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── ROADMAP PROGRESS ──────────────────────────────────────────────────────

function RoadmapProgress({ roadmapSlug, userId }: { roadmapSlug: string; userId?: string }) {
  const router = useRouter()
  const meta = ROADMAP_META[roadmapSlug] ?? ROADMAP_META[DEFAULT_ROADMAP]
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!userId) return
    try {
      const raw = localStorage.getItem(`${userId}_roadmap_${roadmapSlug}_v1`)
      if (raw) {
        const saved = JSON.parse(raw)
        setCompletedIds(new Set(saved.completed ?? []))
      }
    } catch { /* ignore */ }
  }, [userId, roadmapSlug])

  const completed = meta.steps.filter(s => completedIds.has(s.id)).length
  const pct = Math.round((completed / meta.steps.length) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white rounded-2xl border border-[#E4E4E7] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-0.5">Your roadmap</p>
          <p className="text-sm font-semibold text-[#18181B]">{meta.label} · Foundation</p>
        </div>
        <span className="text-xs font-semibold text-[#A1A1AA]">{completed}/{meta.steps.length} done</span>
      </div>
      <div className="w-full h-1.5 bg-[#F4F4F5] rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-[#7C3AED] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="space-y-1.5 mb-4">
        {meta.steps.map(step => {
          const isDone = completedIds.has(step.id)
          return (
            <div key={step.id} className="flex items-center gap-3 py-1.5 px-2 rounded-lg">
              <div className={cn(
                'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                isDone ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-[#D4D4D8]'
              )}>
                {isDone && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
              </div>
              <span className={cn(
                'text-xs flex-1',
                isDone ? 'text-[#A1A1AA] line-through' : 'text-[#3F3F46] font-medium'
              )}>
                {step.title}
              </span>
              {!isDone && <ChevronRight className="w-3 h-3 text-[#D4D4D8]" />}
            </div>
          )
        })}
      </div>
      {completed === 0 ? (
        <button
          onClick={() => router.push(`/roadmaps/${roadmapSlug}`)}
          className="w-full py-2.5 text-sm font-semibold text-white bg-[#7C3AED] rounded-xl hover:bg-[#6D28D9] transition-colors flex items-center justify-center gap-2"
        >
          Start your first task <ArrowRight className="w-3.5 h-3.5" />
        </button>
      ) : (
        <button
          onClick={() => router.push(`/roadmaps/${roadmapSlug}`)}
          className="w-full py-2.5 text-sm font-semibold text-[#7C3AED] border border-[#DDD6FE] rounded-xl hover:bg-[#EDE9FE] transition-colors flex items-center justify-center gap-2"
        >
          Continue roadmap <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.div>
  )
}

// ─── QUICK HABITS ──────────────────────────────────────────────────────────

function QuickHabits({ userId }: { userId?: string }) {
  const [habits, setHabits] = useState<{ id: string; title: string; completed: boolean }[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (!userId) return
    try {
      const raw = localStorage.getItem(`${userId}_habits_v1`)
      if (raw) {
        const all = JSON.parse(raw) as { id: string; name: string; completedToday: boolean }[]
        setHabits(all.slice(0, 3).map(h => ({ id: h.id, title: h.name, completed: h.completedToday })))
      }
    } catch { /* ignore */ }
    setHydrated(true)
  }, [userId])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl border border-[#E4E4E7] p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA]">Daily habits</p>
        {habits.length > 0 && (
          <span className="text-xs text-[#A1A1AA]">
            {habits.filter(h => h.completed).length}/{habits.length} today
          </span>
        )}
      </div>
      {hydrated && habits.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-xs text-[#A1A1AA] mb-3">No habits yet  -  small daily actions compound into big results.</p>
          <Link
            href="/habits"
            className="inline-flex items-center gap-1.5 text-xs text-[#7C3AED] font-semibold hover:underline"
          >
            <Plus className="w-3 h-3" /> Add your first habit
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-1 mb-2">
            {habits.map(habit => (
              <div
                key={habit.id}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl',
                  habit.completed ? 'bg-[#F4F4F5]' : 'bg-transparent'
                )}
              >
                <div className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                  habit.completed ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-[#D4D4D8]'
                )}>
                  {habit.completed && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                </div>
                <span className={cn(
                  'text-sm flex-1',
                  habit.completed ? 'text-[#A1A1AA] line-through' : 'text-[#3F3F46] font-medium'
                )}>
                  {habit.title}
                </span>
              </div>
            ))}
          </div>
          <Link href="/habits" className="flex items-center gap-1 text-xs text-[#A1A1AA] hover:text-[#71717A] transition-colors">
            <Plus className="w-3 h-3" /> Manage habits
          </Link>
        </>
      )}
    </motion.div>
  )
}

// ─── REVENUE SNAPSHOT ──────────────────────────────────────────────────────

function RevenueSnapshot({ profile }: {
  profile: { current_revenue?: number | null; revenue_goal?: number | null } | null
}) {
  const current = profile?.current_revenue ?? 0
  const goal = profile?.revenue_goal ?? 5000
  const pct = Math.min(Math.round((current / goal) * 100), 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl border border-[#E4E4E7] p-5"
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-3">Revenue · This month</p>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-semibold text-[#18181B]">{formatCurrency(current)}</span>
        <span className="text-sm text-[#A1A1AA]">/ {formatCurrency(goal)}</span>
      </div>
      {current === 0 ? (
        <p className="text-xs text-[#A1A1AA] mt-2 mb-3">No income logged yet. Every empire starts at $0.</p>
      ) : (
        <div className="w-full h-1.5 bg-[#F4F4F5] rounded-full overflow-hidden mt-2 mb-3">
          <motion.div
            className="h-full rounded-full bg-[#16A34A]"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </div>
      )}
      <Link
        href="/revenue"
        className="flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-[#71717A] transition-colors"
      >
        <Plus className="w-3 h-3" /> Log income
      </Link>
    </motion.div>
  )
}

// ─── STAT CHIP ─────────────────────────────────────────────────────────────

function StatChip({ icon: Icon, value, label, color }: {
  icon: React.ElementType; value: string; label: string; color: string
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-[#F4F4F5]">
      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
      <span className="text-sm font-semibold text-[#18181B]">{value}</span>
      <span className="text-xs text-[#A1A1AA]">{label}</span>
    </div>
  )
}

// ─── PAGE ──────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { profile, user, signOut, loading } = useUser()
  const firstName = profile?.full_name?.split(' ')[0]
  const streak = profile?.streak_current ?? 0
  const roadmapSlug = (profile?.selected_roadmap ?? DEFAULT_ROADMAP) as string

  // Rings state
  const [rings, setRings] = useState({ build: false, earn: false, grow: false })

  useEffect(() => {
    if (!user?.id) return
    try {
      const raw = localStorage.getItem(ringsStorageKey(user.id))
      const base = raw ? JSON.parse(raw) : {}

      // Auto-fill GROW from habits
      const habitsRaw = localStorage.getItem(`${user.id}_habits_v1`)
      let growDone = base.grow ?? false
      if (habitsRaw) {
        const habits = JSON.parse(habitsRaw) as { completedToday?: boolean }[]
        if (habits.some(h => h.completedToday)) growDone = true
      }

      setRings({ build: base.build ?? false, earn: base.earn ?? false, grow: growDone })
    } catch { /* ignore */ }
  }, [user?.id])

  // Determine if setup guide should show (first 14 days)
  const showSetupGuide = useMemo(() => {
    if (!profile?.created_at) return false
    const createdAt = new Date(profile.created_at)
    const diffDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 14
  }, [profile?.created_at])

  const greeting = getContextGreeting(firstName, streak)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-12 h-12 rounded-2xl bg-[#7C3AED] flex items-center justify-center"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
          <p className="text-sm text-[#A1A1AA] font-medium">Loading your dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar profile={profile} onSignOut={signOut} />

      <div className="lg:pl-64 pb-24 lg:pb-8">

        {/* ── Header ── */}
        <div className="bg-white border-b border-[#F4F4F5] px-6 py-5">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-xs text-[#A1A1AA]">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="text-lg font-semibold text-[#18181B] mt-0.5">{greeting.line1}</h1>
              <p className="text-sm text-[#71717A] mt-0.5">{greeting.line2}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#EDE9FE] flex items-center justify-center text-sm font-semibold text-[#7C3AED] flex-shrink-0">
              {firstName?.[0]?.toUpperCase() ?? '✦'}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-4">

          {/* ── Setup Guide (first 14 days only) ── */}
          <AnimatePresence>
            {showSetupGuide && <SetupGuide userId={user?.id} />}
          </AnimatePresence>

          {/* ── Stats + Rings strip (mobile) ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2"
          >
            <StreakDisplay streak={streak} />
            <StatChip icon={Zap} value={(profile?.xp_points ?? 0).toLocaleString()} label="XP" color="#7C3AED" />
            <StatChip icon={TrendingUp} value={formatCurrency(profile?.current_revenue ?? 0)} label="this month" color="#16A34A" />
          </motion.div>

          {/* ── Rings mobile strip ── */}
          <div className="lg:hidden">
            <RingsCard rings={rings} isMobile />
          </div>

          {/* ── Main 2-col grid ── */}
          <div className="grid lg:grid-cols-5 gap-4">

            {/* Left col  -  primary focus */}
            <div className="lg:col-span-3 space-y-4">
              <TodayFocus roadmapSlug={roadmapSlug} userId={user?.id} />
              <RoadmapProgress roadmapSlug={roadmapSlug} userId={user?.id} />
              <QuickHabits userId={user?.id} />
            </div>

            {/* Right col  -  supporting info */}
            <div className="lg:col-span-2 space-y-4">

              {/* Rings (desktop) */}
              <div className="hidden lg:block">
                <RingsCard rings={rings} />
              </div>

              <RevenueSnapshot profile={profile} />

              {/* Motivation card */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="rounded-2xl bg-[#18181B] px-5 py-4"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#52525B] mb-2">Remember</p>
                <p className="text-sm text-[#E4E4E7] leading-relaxed">
                  &ldquo;Every action you take today is a vote for the business owner you&apos;re becoming.&rdquo;
                </p>
              </motion.div>

              {/* Quick links */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-[#E4E4E7] p-4 space-y-1"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-3">Quick access</p>
                {[
                  { label: 'Resource Vault', href: '/vault', emoji: '📁' },
                  { label: 'AI Assistant', href: '/ai-assistant', emoji: '🤖' },
                  { label: 'Revenue Tracker', href: '/revenue', emoji: '💰' },
                  { label: 'Community', href: '/community', emoji: '👭' },
                ].map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F4F4F5] transition-colors group"
                  >
                    <span className="text-base">{item.emoji}</span>
                    <span className="text-sm text-[#3F3F46] font-medium group-hover:text-[#18181B] transition-colors">{item.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#D4D4D8] ml-auto group-hover:text-[#A1A1AA] transition-colors" />
                  </Link>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  )
}
