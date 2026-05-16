'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Flame, Zap, TrendingUp, Check, ChevronRight,
  Lock, ArrowRight, BookOpen, Plus, Sparkles, MapPin,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn, getGreeting, formatCurrency } from '@/lib/utils'
import { Sidebar } from '@/components/navigation/Sidebar'
import { MobileNav } from '@/components/navigation/MobileNav'
import { useUser } from '@/components/providers/UserProvider'

// ─── Roadmap metadata ──────────────────────────────────────────────────────
// Minimal descriptor for each roadmap — used only for display
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
    firstStepDesc: 'Pick the topic you can create content about consistently. Narrow beats broad every time — "skincare for Black women" beats "beauty tips".',
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

// ─── Sub-components ────────────────────────────────────────────────────────

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

function TodayFocus({ roadmapSlug }: { roadmapSlug: string }) {
  const router = useRouter()
  const [done, setDone] = useState(false)
  const meta = ROADMAP_META[roadmapSlug] ?? ROADMAP_META[DEFAULT_ROADMAP]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl border border-[#E4E4E7] p-6 relative overflow-hidden"
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#7C3AED] rounded-l-2xl" />

      <div className="pl-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED]">Today's focus</span>
          <span className="text-[10px] text-[#A1A1AA]">· {meta.label} · Step 1</span>
        </div>

        <h2 className="text-lg font-semibold text-[#18181B] leading-snug mb-2">
          {meta.firstStep}
        </h2>
        <p className="text-sm text-[#71717A] leading-relaxed mb-5">
          {meta.firstStepDesc}
        </p>

        <div className="flex items-center gap-3 flex-wrap">
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
            {done ? 'Done! +' + meta.xp + ' XP' : 'Mark as done'}
          </button>

          <button
            onClick={() => router.push(`/roadmaps/${roadmapSlug}`)}
            className="flex items-center gap-1.5 text-sm text-[#71717A] hover:text-[#18181B] transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Open roadmap
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function RoadmapProgress({ roadmapSlug, userId }: { roadmapSlug: string; userId?: string }) {
  const router = useRouter()
  const meta = ROADMAP_META[roadmapSlug] ?? ROADMAP_META[DEFAULT_ROADMAP]
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  // Read from the same user-scoped key that the roadmap detail page writes to
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

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-[#F4F4F5] rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-[#7C3AED] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* Steps */}
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

      {/* CTA changes based on progress */}
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

function QuickHabits({ userId }: { userId?: string }) {
  const [habits, setHabits] = useState<{ id: string; title: string; completed: boolean }[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Read the first 3 habits from the same user-scoped key that habits page writes to
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

      {/* Empty state for users who haven't added habits yet */}
      {hydrated && habits.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-xs text-[#A1A1AA] mb-3">No habits yet — small daily actions compound into big results.</p>
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

function RevenueSnapshot({ profile }: { profile: { current_revenue?: number; revenue_goal?: number } | null }) {
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
        <p className="text-xs text-[#A1A1AA] mt-2 mb-3">
          No income logged yet. Every empire starts at $0.
        </p>
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

// ─── Page ──────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { profile, user, signOut, loading } = useUser()
  const greeting = getGreeting()
  const firstName = profile?.full_name?.split(' ')[0]

  // The roadmap the user chose during onboarding, or fall back to shopify
  const roadmapSlug = (profile?.selected_roadmap ?? DEFAULT_ROADMAP) as string

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
              <h1 className="text-lg font-semibold text-[#18181B] mt-0.5">
                {greeting}{firstName ? `, ${firstName}` : ''} 👋
              </h1>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#EDE9FE] flex items-center justify-center text-sm font-semibold text-[#7C3AED]">
              {firstName?.[0]?.toUpperCase() ?? '✦'}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-4">

          {/* ── Stats strip — reads from real profile (never fake) ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2"
          >
            <StatChip icon={Flame} value={`${profile?.streak_current ?? 0}`} label="day streak" color="#F97316" />
            <StatChip icon={Zap} value={`${(profile?.xp_points ?? 0).toLocaleString()}`} label="XP" color="#7C3AED" />
            <StatChip icon={TrendingUp} value={formatCurrency(profile?.current_revenue ?? 0)} label="this month" color="#16A34A" />
          </motion.div>

          {/* ── Main 2-col grid ── */}
          <div className="grid lg:grid-cols-5 gap-4">

            {/* Left col — primary focus */}
            <div className="lg:col-span-3 space-y-4">
              <TodayFocus roadmapSlug={roadmapSlug} />
              <RoadmapProgress roadmapSlug={roadmapSlug} userId={user?.id} />
              <QuickHabits userId={user?.id} />
            </div>

            {/* Right col — supporting info */}
            <div className="lg:col-span-2 space-y-4">
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
                  "Every action you take today is a vote for the business owner you're becoming."
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
