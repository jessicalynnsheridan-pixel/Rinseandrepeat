'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flame, Zap, TrendingUp, Check, ChevronRight,
  ArrowRight, Plus, Sparkles, Crown, Shield, AlertCircle,
  Users, Trophy, Rocket,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn, formatCurrency } from '@/lib/utils'
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
function daysInApp(createdAt: string | null): number {
  if (!createdAt) return 0
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
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
    firstStepDesc: 'Research 5 potential niches, validate with TikTok/Instagram, and decide. This is your foundation — everything else builds on this.',
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
    firstStepDesc: 'Decide what digital product to create — a course, ebook, template, or toolkit. Research what your audience already buys.',
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
    firstStepDesc: 'Pick the topic you can create content about consistently. Narrow beats broad — "skincare for Black women" beats "beauty tips".',
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
      { id: 'sv4', title: 'Land your first client' },
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
    firstStepDesc: 'Find out exactly what licences and certifications you need in your state. This is non-negotiable — get clarity here first.',
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

// ─── Dynamic daily brief copy ─────────────────────────────────────────────

const BUSINESS_VERBS: Record<string, string> = {
  shopify: 'building your brand',
  digital: 'creating your offer',
  creator: 'growing your audience',
  service: 'landing clients',
  affiliate: 'building passive income',
  medspa: 'building your practice',
}

function getDailyBrief(
  firstName: string | undefined,
  streak: number,
  days: number,
  businessType: string | null,
  hour: number,
): { headline: string; subtext: string; tag: string } {
  const name = firstName ?? 'CEO'
  const verb = BUSINESS_VERBS[businessType ?? 'shopify'] ?? 'building your business'

  // Special milestone days
  if (days === 1) return {
    tag: 'Day One',
    headline: `This is where it starts, ${name}.`,
    subtext: `Every CEO you admire had a Day One. Yours is today. Don't overthink it — just begin.`,
  }
  if (days === 7) return {
    tag: 'One Week In',
    headline: `You made it a full week.`,
    subtext: `Most people quit before Day 7. You didn't. That already puts you ahead of the majority. Keep that energy.`,
  }
  if (days === 14) return {
    tag: 'Two Weeks Strong',
    headline: `Two weeks of showing up.`,
    subtext: `This is the part where the results aren't obvious yet, but the roots are growing. Trust the process, ${name}.`,
  }
  if (days === 30) return {
    tag: '30-Day CEO',
    headline: `30 days. You're the real deal now.`,
    subtext: `You've proven something to yourself. Most entrepreneurs never make it a month in. You did. This is your foundation.`,
  }
  if (days === 60) return {
    tag: '60 Days',
    headline: `Two months of building, ${name}.`,
    subtext: `At 60 days, compounding starts to kick in. Every habit, every step, every dollar logged — it adds up faster from here.`,
  }
  if (days === 90) return {
    tag: '90-Day Milestone',
    headline: `Quarter one of your CEO era. Done.`,
    subtext: `90 days of ${verb}. This is the moment most people say "I wish I'd started." You started. Now you scale.`,
  }

  // Streak milestones
  if (streak === 3) return {
    tag: '3-Day Streak',
    headline: `Three days straight. The habit is forming.`,
    subtext: `Research says it takes 21 days to form a habit. You're 3 in. Don't break the chain.`,
  }
  if (streak === 7) return {
    tag: 'Week Streak 🔥',
    headline: `7 days on fire. You're building a real habit.`,
    subtext: `One week of daily consistency. That's more than 80% of people ever manage. What you do today determines if this becomes permanent.`,
  }
  if (streak === 30) return {
    tag: '30-Day Streak 👑',
    headline: `30 days without stopping. You're elite.`,
    subtext: `This kind of consistency is what separates the ones who make it. You're not just building a business — you're building a new identity.`,
  }

  // Time-of-day based (fallback)
  if (hour < 9) return {
    tag: 'Morning Brief',
    headline: `Up early. That's the energy.`,
    subtext: `The best CEOs own their morning before the world can steal it. You're already ahead. Now make it count.`,
  }
  if (hour < 12) return {
    tag: 'Morning Brief',
    headline: `Good morning, ${name}.`,
    subtext: `You have the whole day ahead of you. One focused hour on ${verb} today beats ten scattered ones. Let's go.`,
  }
  if (hour < 17) return {
    tag: 'Afternoon',
    headline: `The day isn't over, ${name}.`,
    subtext: `Whatever's happened so far — the afternoon is your second chance. ${streak > 0 ? `Your ${streak}-day streak is counting on you.` : 'Use it.'}`,
  }
  return {
    tag: 'Evening',
    headline: `End the day strong.`,
    subtext: `Whatever you accomplish in the next hour will compound. Future-${name} is watching what you do right now.`,
  }
}

// ─── COMMUNITY PULSE (social proof that makes the app feel alive) ──────────

const PULSE_MESSAGES = [
  { emoji: '🎉', text: 'Maya just logged her first $1,000 month' },
  { emoji: '🔥', text: '47 entrepreneurs kept their streak alive today' },
  { emoji: '💼', text: 'Priya landed her first coaching client this week' },
  { emoji: '👑', text: '12 women in this community hit $10K+ this month' },
  { emoji: '📈', text: 'Danielle completed her Shopify roadmap milestone' },
  { emoji: '⚡', text: '183 habits completed across the community today' },
  { emoji: '🚀', text: 'Camille hit a 30-day streak this morning' },
  { emoji: '💰', text: 'Revenue logged today: $18,240 across the community' },
]

function CommunityPulse() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * PULSE_MESSAGES.length))
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % PULSE_MESSAGES.length)
        setVisible(true)
      }, 400)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const msg = PULSE_MESSAGES[idx]

  return (
    <Link href="/community">
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-white border border-[#E4E4E7] rounded-2xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-[#C4B5FD] transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-[#EDE9FE] flex items-center justify-center flex-shrink-0">
          <Users className="w-3.5 h-3.5 text-[#7C3AED]" />
        </div>
        <AnimatePresence mode="wait">
          {visible && (
            <motion.p
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="text-xs text-[#52525B] flex-1"
            >
              <span className="mr-1">{msg.emoji}</span>
              {msg.text}
            </motion.p>
          )}
        </AnimatePresence>
        <ChevronRight className="w-3.5 h-3.5 text-[#D4D4D8] flex-shrink-0" />
      </motion.div>
    </Link>
  )
}

// ─── STREAK DEFENSE BANNER ────────────────────────────────────────────────

function StreakDefenseBanner({ streak, habitsAllDone }: { streak: number; habitsAllDone: boolean }) {
  const [dismissed, setDismissed] = useState(false)
  const hour = new Date().getHours()

  // Show warning after 3pm if streak > 0 and habits not all done
  const isAtRisk = streak > 0 && !habitsAllDone && hour >= 15 && !dismissed

  if (!isAtRisk) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      className="relative bg-gradient-to-r from-[#F97316] to-[#EA580C] rounded-2xl p-4 text-white overflow-hidden"
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjA1Ij48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMjAiLz48cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIvPjwvZz48L3N2Zz4=')] opacity-30" />
      <div className="relative flex items-center gap-3">
        <div className="text-2xl flex-shrink-0">🔥</div>
        <div className="flex-1">
          <p className="text-sm font-bold leading-tight">Your {streak}-day streak is at risk</p>
          <p className="text-xs text-orange-100 mt-0.5">Complete at least one habit before midnight to keep it alive.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/habits"
            className="px-3 py-1.5 bg-white text-[#EA580C] text-xs font-bold rounded-xl hover:bg-orange-50 transition-colors"
          >
            Save it
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-orange-200 hover:text-white transition-colors"
          >
            <AlertCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── COMEBACK BANNER (for users returning after a break) ─────────────────

function ComebackBanner({ streak, daysInApp: days, firstName }: { streak: number; daysInApp: number; firstName?: string }) {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Streak just reset (was >0 at some point, now 0 or 1, days >3)
    const key = `comeback_shown_${todayKey()}`
    if (streak <= 1 && days > 3 && !localStorage.getItem(key)) {
      setShow(true)
    }
  }, [streak, days])

  function dismiss() {
    localStorage.setItem(`comeback_shown_${todayKey()}`, '1')
    setDismissed(true)
  }

  if (!show || dismissed) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="bg-[#18181B] rounded-2xl p-5 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/20 to-transparent" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#7C3AED] mb-1">You're back 👋</p>
            <h3 className="text-base font-semibold text-white leading-snug">
              The 3% who return become the 1% who succeed{firstName ? `, ${firstName}` : ''}.
            </h3>
            <p className="text-sm text-[#71717A] mt-1.5 leading-relaxed">
              Life happens. What matters is you're here. Start fresh today — your streak resets at 1, not zero.
            </p>
          </div>
          <button onClick={dismiss} className="text-[#52525B] hover:text-[#71717A] flex-shrink-0 mt-0.5 transition-colors text-xs">
            ✕
          </button>
        </div>
        <button
          onClick={dismiss}
          className="mt-4 w-full py-2.5 bg-[#7C3AED] text-white text-sm font-semibold rounded-xl hover:bg-[#6D28D9] transition-colors"
        >
          Let's go — Day 1 again 🔥
        </button>
      </div>
    </motion.div>
  )
}

// ─── CELEBRATION OVERLAY ──────────────────────────────────────────────────

interface CelebrationProps {
  type: 'habit_done' | 'all_habits' | 'streak_milestone'
  streak?: number
  onDone: () => void
}

function CelebrationOverlay({ type, streak, onDone }: CelebrationProps) {
  useEffect(() => {
    const t = setTimeout(onDone, type === 'all_habits' ? 3500 : 2000)
    return () => clearTimeout(t)
  }, [type, onDone])

  const particles = ['#7C3AED', '#A78BFA', '#F97316', '#FFD700', '#16A34A', '#E8B4B8']
    .flatMap((c, i) => [
      { x: 10 + i * 14, color: c, delay: i * 0.05, size: 8 },
      { x: 5 + i * 16, color: c, delay: i * 0.08 + 0.1, size: 6 },
    ])

  if (type === 'habit_done') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#18181B] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5"
        onClick={onDone}
      >
        <span className="text-lg">🔥</span>
        <p className="text-sm font-semibold">Habit done. Keep going.</p>
        <span className="text-xs text-[#7C3AED] font-bold">+5 XP</span>
      </motion.div>
    )
  }

  if (type === 'all_habits') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={onDone}
      >
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {particles.map((p, i) => (
            <motion.div
              key={i}
              initial={{ y: '-5vh', x: `${p.x}vw`, opacity: 1 }}
              animate={{ y: '110vh', opacity: 0 }}
              transition={{ duration: 2.2, delay: p.delay, ease: [0.2, 0.8, 0.9, 1] }}
              className="absolute rounded-sm"
              style={{ width: p.size, height: p.size * 0.6, backgroundColor: p.color }}
            />
          ))}
        </div>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-xs w-full mx-4 relative"
          onClick={e => e.stopPropagation()}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center mx-auto mb-4 shadow-[0_0_32px_rgba(124,58,237,0.4)]"
          >
            <Crown className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED] mb-1">CEO Ritual Complete</p>
          <p className="text-2xl font-bold text-[#18181B] mb-2">All habits done. 👑</p>
          <p className="text-sm text-[#71717A]">You just closed your rings for today. That's elite consistency.</p>
          <p className="text-xs text-[#A1A1AA] mt-4">Tap anywhere to continue</p>
        </motion.div>
      </motion.div>
    )
  }

  // streak_milestone
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onDone}
    >
      <motion.div
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="bg-[#18181B] rounded-3xl p-8 text-center max-w-xs w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-5xl mb-3">🔥</div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#F97316] mb-2">Streak Milestone</p>
        <p className="text-3xl font-bold text-white mb-1">{streak} days straight</p>
        <p className="text-sm text-[#71717A]">You're in the top 5% of entrepreneurs who make it this far.</p>
      </motion.div>
    </motion.div>
  )
}

// ─── THE ONE THING (primary daily action) ─────────────────────────────────

function TheOneThing({ roadmapSlug, userId }: { roadmapSlug: string; userId?: string }) {
  const router = useRouter()
  const [done, setDone] = useState(false)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [showCelebration, setShowCelebration] = useState(false)

  const meta = ROADMAP_META[roadmapSlug] ?? ROADMAP_META[DEFAULT_ROADMAP]

  useEffect(() => {
    if (!userId) return
    // Check if already marked done today
    const doneKey = `${userId}_one_thing_${todayKey()}`
    if (localStorage.getItem(doneKey)) setDone(true)

    try {
      const raw = localStorage.getItem(`${userId}_roadmap_${roadmapSlug}_v1`)
      if (raw) setCompletedIds(new Set(JSON.parse(raw).completed ?? []))
    } catch { /* ignore */ }
  }, [userId, roadmapSlug])

  const nextStep = meta.steps.find(s => !completedIds.has(s.id))
  const allDone = !nextStep
  const stepTitle = nextStep?.title ?? meta.firstStep
  const isFirstStep = nextStep?.id === meta.steps[0].id

  function markDone() {
    if (!userId || done) return
    setDone(true)
    setShowCelebration(true)
    localStorage.setItem(`${userId}_one_thing_${todayKey()}`, '1')

    // Persist step completion
    try {
      const storageKey = `${userId}_roadmap_${roadmapSlug}_v1`
      const raw = localStorage.getItem(storageKey)
      const saved = raw ? JSON.parse(raw) : { completed: [] }
      if (nextStep && !saved.completed.includes(nextStep.id)) {
        saved.completed.push(nextStep.id)
        localStorage.setItem(storageKey, JSON.stringify(saved))
      }
    } catch { /* ignore */ }
  }

  return (
    <>
      <AnimatePresence>
        {showCelebration && (
          <CelebrationOverlay
            type="habit_done"
            onDone={() => setShowCelebration(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'rounded-2xl p-5 relative overflow-hidden transition-all',
          done ? 'bg-[#F0FDF4] border border-[#BBF7D0]' : 'bg-[#18181B]'
        )}
      >
        {!done && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/15 to-transparent pointer-events-none" />
        )}
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <span className={cn(
              'text-[10px] font-bold uppercase tracking-widest',
              done ? 'text-[#16A34A]' : 'text-[#7C3AED]'
            )}>
              {done ? '✓ Today\'s focus — done' : '★ Your ONE thing today'}
            </span>
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full',
              done ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#7C3AED]/20 text-[#A78BFA]'
            )}>
              +{meta.xp} XP
            </span>
          </div>

          <h2 className={cn(
            'text-lg font-bold leading-snug mb-2',
            done ? 'text-[#166534] line-through opacity-60' : 'text-white'
          )}>
            {allDone ? 'All roadmap steps complete 🏆' : stepTitle}
          </h2>

          {!done && !allDone && (
            <p className="text-sm text-[#A1A1AA] leading-relaxed mb-4">
              {isFirstStep ? meta.firstStepDesc : `Continue with this step on your ${meta.label} roadmap.`}
            </p>
          )}

          {done ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#16A34A] flex items-center justify-center">
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
              <p className="text-sm font-semibold text-[#15803D]">Completed today. Legend.</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              {!allDone && (
                <button
                  onClick={markDone}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#7C3AED] text-white text-sm font-bold rounded-xl hover:bg-[#6D28D9] active:scale-95 transition-all"
                >
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  Mark it done
                </button>
              )}
              <button
                onClick={() => router.push(`/roadmaps/${roadmapSlug}`)}
                className="flex items-center gap-1.5 text-sm text-[#71717A] hover:text-[#A78BFA] transition-colors"
              >
                Open roadmap <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}

// ─── INLINE HABIT CHECK-INS (1-tap from dashboard) ────────────────────────

interface HabitItem { id: string; name: string; completedToday: boolean }

function InlineHabits({ userId, onAllDone }: { userId?: string; onAllDone: () => void }) {
  const [habits, setHabits] = useState<HabitItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [justCompleted, setJustCompleted] = useState<string | null>(null)
  const allDoneRef = { current: false }

  useEffect(() => {
    if (!userId) return
    try {
      const raw = localStorage.getItem(`${userId}_habits_v1`)
      if (raw) {
        const all = JSON.parse(raw) as HabitItem[]
        setHabits(all.slice(0, 4))
      }
    } catch { /* ignore */ }
    setHydrated(true)
  }, [userId])

  function toggle(id: string) {
    const today = new Date().toISOString().split('T')[0]
    setHabits(prev => {
      const next = prev.map(h => {
        if (h.id !== id) return h
        return { ...h, completedToday: !h.completedToday }
      })

      // Persist
      try {
        const raw = localStorage.getItem(`${userId}_habits_v1`)
        if (raw) {
          const all = JSON.parse(raw)
          const updated = all.map((h: HabitItem & { lastCompletedDate?: string; streak?: number; weekHistory?: boolean[] }) => {
            if (h.id !== id) return h
            const completing = !h.completedToday
            const todayIdx = (new Date().getDay() + 6) % 7
            const history = [...(h.weekHistory ?? Array(7).fill(false))]
            history[todayIdx] = completing
            return {
              ...h,
              completedToday: completing,
              lastCompletedDate: completing ? today : h.lastCompletedDate,
              streak: completing && h.lastCompletedDate !== today
                ? (h.streak ?? 0) + 1
                : h.streak ?? 0,
              weekHistory: history,
            }
          })
          localStorage.setItem(`${userId}_habits_v1`, JSON.stringify(updated))
        }
      } catch { /* ignore */ }

      const allNowDone = next.every(h => h.completedToday)
      if (allNowDone && !allDoneRef.current) {
        allDoneRef.current = true
        setTimeout(onAllDone, 400)
      }

      return next
    })

    setJustCompleted(id)
    setTimeout(() => setJustCompleted(null), 800)
  }

  if (!hydrated) return null

  if (habits.length === 0) {
    return (
      <Link href="/habits">
        <div className="border border-dashed border-[#D4D4D8] rounded-2xl p-4 text-center hover:border-[#7C3AED] transition-colors">
          <p className="text-sm text-[#A1A1AA]">No habits yet</p>
          <p className="text-xs text-[#7C3AED] font-semibold mt-1">+ Add your first daily habit →</p>
        </div>
      </Link>
    )
  }

  const doneCount = habits.filter(h => h.completedToday).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="bg-white rounded-2xl border border-[#E4E4E7] p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA]">Daily habits</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#A1A1AA]">{doneCount}/{habits.length} done</span>
          <Link href="/habits" className="text-[10px] text-[#7C3AED] font-semibold hover:underline">
            See all
          </Link>
        </div>
      </div>

      <div className="space-y-1.5">
        {habits.map(habit => (
          <motion.button
            key={habit.id}
            onClick={() => toggle(habit.id)}
            whileTap={{ scale: 0.97 }}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left',
              habit.completedToday ? 'bg-[#F0FDF4]' : 'bg-[#FAFAFA] hover:bg-[#F4F4F5]'
            )}
          >
            <motion.div
              animate={justCompleted === habit.id ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
              className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                habit.completedToday ? 'bg-[#16A34A] border-[#16A34A]' : 'border-[#D4D4D8]'
              )}
            >
              {habit.completedToday && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
            </motion.div>
            <span className={cn(
              'text-sm flex-1 font-medium',
              habit.completedToday ? 'text-[#16A34A] line-through opacity-70' : 'text-[#3F3F46]'
            )}>
              {habit.name}
            </span>
            {habit.completedToday && <span className="text-xs text-[#16A34A]">✓</span>}
          </motion.button>
        ))}
      </div>

      {doneCount === habits.length && habits.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center justify-center gap-1.5 py-2 bg-[#F0FDF4] rounded-xl"
        >
          <Crown className="w-3.5 h-3.5 text-[#16A34A]" />
          <p className="text-xs font-bold text-[#16A34A]">CEO ritual complete. 👑</p>
        </motion.div>
      )}
    </motion.div>
  )
}

// ─── XP / LEVEL PROGRESS BAR ──────────────────────────────────────────────

function XPBar({ xp }: { xp: number }) {
  const levels = [
    { label: 'Intern', min: 0, max: 499 },
    { label: 'Founder', min: 500, max: 1999 },
    { label: 'CEO', min: 2000, max: 4999 },
    { label: 'Empire', min: 5000, max: 5000 },
  ]
  const current = levels.find(l => xp >= l.min && xp <= l.max) ?? levels[0]
  const next = levels[levels.indexOf(current) + 1]
  const pct = next ? Math.round(((xp - current.min) / (next.min - current.min)) * 100) : 100
  const toNext = next ? next.min - xp : 0

  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl border border-[#E4E4E7] px-4 py-3">
      <div className="w-8 h-8 rounded-xl bg-[#EDE9FE] flex items-center justify-center flex-shrink-0">
        <Zap className="w-4 h-4 text-[#7C3AED]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-[#18181B]">{current.label} · {xp.toLocaleString()} XP</span>
          {next && <span className="text-[10px] text-[#A1A1AA]">{toNext} to {next.label}</span>}
        </div>
        <div className="w-full h-1.5 bg-[#F4F4F5] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── STAT ROW ─────────────────────────────────────────────────────────────

function StatRow({ streak, revenue, days }: { streak: number; revenue: number; days: number }) {
  const tier = streak === 0 ? 'cold' : streak < 7 ? 'warm' : streak < 30 ? 'hot' : 'blazing'
  const streakColor = { cold: '#A1A1AA', warm: '#F97316', hot: '#EA580C', blazing: '#7C3AED' }[tier]
  const streakBg = { cold: '#F4F4F5', warm: '#FEF3C7', hot: '#FFEDD5', blazing: '#EDE9FE' }[tier]
  const streakIcon = tier === 'cold' ? '○' : '🔥'

  return (
    <div className="grid grid-cols-3 gap-2">
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-3 text-center"
        style={{ backgroundColor: streakBg }}
      >
        <p className="text-lg leading-none mb-0.5">{streakIcon}</p>
        <p className="text-base font-bold" style={{ color: streakColor }}>{streak}</p>
        <p className="text-[10px] font-medium" style={{ color: streakColor }}>day streak</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-[#DCFCE7] rounded-xl p-3 text-center"
      >
        <p className="text-lg leading-none mb-0.5">💰</p>
        <p className="text-base font-bold text-[#16A34A]">{formatCurrency(revenue)}</p>
        <p className="text-[10px] font-medium text-[#16A34A]">this month</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-[#F4F4F5] rounded-xl p-3 text-center"
      >
        <p className="text-lg leading-none mb-0.5">📅</p>
        <p className="text-base font-bold text-[#18181B]">{days}</p>
        <p className="text-[10px] font-medium text-[#71717A]">days in</p>
      </motion.div>
    </div>
  )
}

// ─── MOTIVATION ROTATOR ───────────────────────────────────────────────────

const DAILY_TRUTHS = [
  'The version of you who built a business started on a random Tuesday, just like today.',
  'Your competition is not other businesses. It\'s your own resistance.',
  'Revenue is a lagging indicator. Consistency is the leading one.',
  'Done beats perfect. Shipped beats polished. Now beats later.',
  'Every CEO you admire was once exactly where you are right now.',
  'You don\'t need more information. You need more action on what you already know.',
  'The hardest day to show up is the day that matters most.',
  'Your streak is proof of character. Numbers come after.',
  'The business you\'re building today is the asset that buys back your time tomorrow.',
  'Clarity comes from action, not more thinking. Move first.',
  'You\'re not behind. You\'re exactly where you need to be to learn what you\'re learning.',
  'The women who made it didn\'t have a better plan. They just didn\'t stop.',
]

function DailyTruth() {
  // Deterministic per calendar day so it doesn't jump on re-render
  const idx = useMemo(() => {
    const day = new Date().getDate() + new Date().getMonth() * 31
    return day % DAILY_TRUTHS.length
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-[#18181B] rounded-2xl px-5 py-4"
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#52525B] mb-2">Today's truth</p>
      <p className="text-sm text-[#E4E4E7] leading-relaxed italic">
        &ldquo;{DAILY_TRUTHS[idx]}&rdquo;
      </p>
    </motion.div>
  )
}

// ─── QUICK ACTIONS ─────────────────────────────────────────────────────────

function QuickActions() {
  const items = [
    { label: 'Log income', href: '/revenue', emoji: '💰', color: '#DCFCE7', textColor: '#15803D' },
    { label: 'AI advisor', href: '/ai-assistant', emoji: '🤖', color: '#EDE9FE', textColor: '#5B21B6' },
    { label: 'Roadmaps', href: '/roadmaps', emoji: '🗺️', color: '#FEF3C7', textColor: '#92400E' },
    { label: 'Community', href: '/community', emoji: '👭', color: '#F4F4F5', textColor: '#3F3F46' },
  ]
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-4 gap-2"
    >
      {items.map(item => (
        <Link key={item.href} href={item.href}>
          <div
            className="rounded-2xl p-3 text-center hover:opacity-80 active:scale-95 transition-all cursor-pointer"
            style={{ backgroundColor: item.color }}
          >
            <p className="text-xl mb-1">{item.emoji}</p>
            <p className="text-[10px] font-semibold leading-tight" style={{ color: item.textColor }}>{item.label}</p>
          </div>
        </Link>
      ))}
    </motion.div>
  )
}

// ─── PAGE ──────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { profile, user, signOut, loading } = useUser()
  const firstName = profile?.full_name?.split(' ')[0]
  const streak = profile?.streak_current ?? 0
  const xp = profile?.xp_points ?? 0
  const roadmapSlug = (profile?.selected_roadmap ?? DEFAULT_ROADMAP) as string
  const days = daysInApp(profile?.created_at ?? null)
  const hour = new Date().getHours()

  // Revenue from localStorage
  const [localRevenue, setLocalRevenue] = useState(0)
  useEffect(() => {
    if (!user?.id) return
    try {
      const raw = localStorage.getItem(`${user.id}_revenue_v1`)
      if (raw) {
        const data = JSON.parse(raw)
        const entries: { amount: number }[] = data.month?.entries ?? []
        setLocalRevenue(entries.reduce((s, e) => s + (e.amount ?? 0), 0))
      }
    } catch { /* ignore */ }
  }, [user?.id])

  // Habit state for streak defense
  const [habitsAllDone, setHabitsAllDone] = useState(false)
  useEffect(() => {
    if (!user?.id) return
    try {
      const raw = localStorage.getItem(`${user.id}_habits_v1`)
      if (raw) {
        const habits: { completedToday: boolean }[] = JSON.parse(raw)
        if (habits.length > 0) setHabitsAllDone(habits.every(h => h.completedToday))
      }
    } catch { /* ignore */ }
  }, [user?.id])

  const [celebration, setCelebration] = useState<'habit_done' | 'all_habits' | 'streak_milestone' | null>(null)

  const brief = getDailyBrief(firstName, streak, days, profile?.business_type ?? null, hour)

  const handleAllHabitsDone = useCallback(() => {
    setHabitsAllDone(true)
    setCelebration('all_habits')
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="flex flex-col items-center gap-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#7C3AED] flex items-center justify-center shadow-[0_0_32px_rgba(124,58,237,0.35)]">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-[#A1A1AA] font-medium">Preparing your brief…</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar profile={profile} onSignOut={signOut} />

      {/* Celebration overlay */}
      <AnimatePresence>
        {celebration && (
          <CelebrationOverlay
            type={celebration}
            streak={streak}
            onDone={() => setCelebration(null)}
          />
        )}
      </AnimatePresence>

      <div className="lg:pl-64 pb-24 lg:pb-8">

        {/* ── Daily CEO Brief Header ── */}
        <div className="bg-white border-b border-[#F4F4F5] px-6 py-5">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED] px-2 py-0.5 bg-[#EDE9FE] rounded-full">
                    {brief.tag}
                  </span>
                  <span className="text-[10px] text-[#A1A1AA]">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-[#18181B] leading-snug">{brief.headline}</h1>
                <p className="text-sm text-[#71717A] mt-1 leading-relaxed max-w-md">{brief.subtext}</p>
              </div>
              <Link href="/profile">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center text-sm font-bold text-white shadow-[0_0_16px_rgba(124,58,237,0.3)] flex-shrink-0 hover:scale-105 transition-transform">
                  {firstName?.[0]?.toUpperCase() ?? '✦'}
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 md:px-6 py-5 space-y-3">

          {/* ── Streak defense banner ── */}
          <AnimatePresence>
            <StreakDefenseBanner streak={streak} habitsAllDone={habitsAllDone} />
          </AnimatePresence>

          {/* ── Comeback banner ── */}
          <AnimatePresence>
            <ComebackBanner streak={streak} daysInApp={days} firstName={firstName} />
          </AnimatePresence>

          {/* ── THE ONE THING ── */}
          <TheOneThing roadmapSlug={roadmapSlug} userId={user?.id} />

          {/* ── Inline habits ── */}
          <InlineHabits userId={user?.id} onAllDone={handleAllHabitsDone} />

          {/* ── Stats row ── */}
          <StatRow streak={streak} revenue={localRevenue} days={days} />

          {/* ── XP progress ── */}
          <XPBar xp={xp} />

          {/* ── Quick action grid ── */}
          <QuickActions />

          {/* ── Community pulse ── */}
          <CommunityPulse />

          {/* ── Daily truth (rotates daily) ── */}
          <DailyTruth />

        </div>
      </div>

      <MobileNav />
    </div>
  )
}
