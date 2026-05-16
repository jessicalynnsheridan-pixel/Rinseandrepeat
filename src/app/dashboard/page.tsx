'use client'
// Note: force-dynamic has no effect on 'use client' pages in Next.js 14 App Router.
// Dynamic rendering is handled by the UserProvider context (auth state).

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Flame, Zap, Check, Plus, TrendingUp,
  Bot, ChevronRight, ArrowRight,
  Lock, Award, Activity, BookOpen,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn, getGreeting, getDailyQuote, formatCurrency } from '@/lib/utils'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Sidebar } from '@/components/navigation/Sidebar'
import { MobileNav } from '@/components/navigation/MobileNav'
import type { Profile } from '@/types'
import { LEVEL_METADATA } from '@/types'
import { useUser } from '@/components/providers/UserProvider'

const MOCK_WEEKLY_GOALS = [
  { id: '1', title: 'Set up Shopify store', is_completed: true },
  { id: '2', title: 'Design 3 product mockups', is_completed: true },
  { id: '3', title: 'Write 5 product descriptions', is_completed: false },
  { id: '4', title: 'Connect payment gateway', is_completed: false },
  { id: '5', title: 'Launch Instagram account', is_completed: true },
  { id: '6', title: 'Find 2 UGC creators', is_completed: false },
  { id: '7', title: 'Write first email sequence', is_completed: false },
]

const MOCK_HABITS = [
  { id: '1', title: 'Post on Instagram', completed: true, streak: 7 },
  { id: '2', title: 'Learn for 30 min', completed: true, streak: 5 },
  { id: '3', title: 'Do outreach (5 people)', completed: false, streak: 3 },
  { id: '4', title: 'Morning workout', completed: true, streak: 4 },
  { id: '5', title: 'Gratitude journal', completed: false, streak: 2 },
]

const MOCK_ROADMAP = {
  title: 'Shopify Brand',
  current_milestone: 5,
  total_milestones: 48,
  current_phase: 'Foundation',
  next_steps: [
    { id: '1', title: 'Register your LLC', completed: true },
    { id: '2', title: 'Set up Shopify store', completed: true },
    { id: '3', title: 'Choose your niche & products', completed: false, unlocked: true },
    { id: '4', title: 'Design brand identity', completed: false, unlocked: false },
  ],
}

const MOCK_ACHIEVEMENTS = [
  { id: '1', title: '7-Day Streak', earned: true },
  { id: '2', title: 'First Step Done', earned: true },
  { id: '3', title: 'Goal Setter', earned: true },
  { id: '4', title: 'First Sale', earned: false },
  { id: '5', title: 'Store Launched', earned: false },
  { id: '6', title: 'CEO Level', earned: false },
]

// ──────────────────────────────────────────
// Stats Row
// ──────────────────────────────────────────
function StatsRow({ profile }: { profile: Profile | null }) {
  const completedToday = MOCK_HABITS.filter(h => h.completed).length
  const safeLevel = (profile?.level && LEVEL_METADATA[profile.level]) ? profile.level : 'intern'
  const levelMeta = LEVEL_METADATA[safeLevel]

  const stats = [
    {
      icon: Flame,
      label: 'Day streak',
      value: (profile?.streak_current ?? 0).toString(),
      sub: `Best ${profile?.streak_best ?? 0}`,
    },
    {
      icon: Zap,
      label: 'XP earned',
      value: '+75',
      sub: `${(profile?.xp_points ?? 0).toLocaleString()} total`,
    },
    {
      icon: Activity,
      label: 'Habits',
      value: `${completedToday}/${MOCK_HABITS.length}`,
      sub: 'Done today',
    },
    {
      icon: Award,
      label: 'Level',
      value: levelMeta.label,
      sub: `${profile?.xp_points ?? 0} XP`,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="bg-white rounded-2xl border border-[#F4F4F5] p-4"
        >
          <stat.icon className="w-4 h-4 text-[#A1A1AA] mb-3" strokeWidth={1.5} />
          <p className="font-display text-xl font-semibold text-[#18181B] leading-none">{stat.value}</p>
          <p className="text-xs font-medium text-[#3F3F46] mt-1">{stat.label}</p>
          <p className="text-xs text-[#A1A1AA] mt-0.5">{stat.sub}</p>
        </motion.div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────
// Today's Focus
// ──────────────────────────────────────────
function TodayTask() {
  const [done, setDone] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white rounded-2xl border border-[#F4F4F5] p-6 relative overflow-hidden"
    >
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#7C3AED] rounded-l-2xl" />

      <div className="pl-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A1A1AA] mb-2">
          Today's focus
        </p>
        <h3 className="font-display font-semibold text-lg text-[#18181B] leading-snug mb-1.5">
          Post your brand intro on Instagram
        </h3>
        <p className="text-sm text-[#71717A] leading-relaxed mb-5">
          Share your brand story and mission. Use the template from the Vault to get started fast.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDone(!done)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
              done
                ? 'bg-[#DCFCE7] text-[#15803D] border border-[#16A34A]/30'
                : 'bg-[#18181B] text-white hover:bg-[#3F3F46]'
            )}
          >
            <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
            {done ? 'Completed' : 'Mark done'}
          </button>
          <Link href="/vault" className="flex items-center gap-1.5 text-sm text-[#A1A1AA] hover:text-[#3F3F46] transition-colors">
            <BookOpen className="w-3.5 h-3.5" />
            View template
          </Link>
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#FAFAFA]">
          <span className="text-xs text-[#A1A1AA]">+25 XP</span>
          <span className="text-[#E4E4E7] text-xs">·</span>
          <span className="text-xs text-[#A1A1AA]">Shopify Roadmap · Step 3</span>
        </div>
      </div>
    </motion.div>
  )
}

// ──────────────────────────────────────────
// Revenue
// ──────────────────────────────────────────
function RevenueCard({ profile }: { profile: Profile | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 }}
      className="bg-white rounded-2xl border border-[#F4F4F5] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-[#A1A1AA]" strokeWidth={1.5} />
          <span className="text-xs font-semibold text-[#18181B] uppercase tracking-widest">Revenue</span>
        </div>
        <Link href="/revenue" className="text-xs text-[#A1A1AA] hover:text-[#3F3F46] transition-colors flex items-center gap-1">
          <Plus className="w-3 h-3" /> Log
        </Link>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-display text-2xl font-semibold text-[#18181B]">
          {formatCurrency(profile?.current_revenue ?? 0)}
        </span>
        <span className="text-sm text-[#A1A1AA]">
          / {formatCurrency(profile?.revenue_goal ?? 5000)}
        </span>
      </div>
      <p className="text-xs text-[#A1A1AA] mb-3">This month</p>

      <ProgressBar
        value={profile?.current_revenue ?? 0}
        max={profile?.revenue_goal ?? 5000}
        showPercent
        color="success"
        size="md"
      />

      <p className="text-xs text-[#A1A1AA] mt-3">
        {formatCurrency((profile?.revenue_goal ?? 5000) - (profile?.current_revenue ?? 0))} remaining to goal
      </p>
    </motion.div>
  )
}

// ──────────────────────────────────────────
// Weekly Goals
// ──────────────────────────────────────────
function WeeklyGoalsCard() {
  const [goals, setGoals] = useState(MOCK_WEEKLY_GOALS)
  const completed = goals.filter(g => g.is_completed).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22 }}
      className="bg-white rounded-2xl border border-[#F4F4F5] p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A1A1AA] mb-1">Weekly goals</p>
          <p className="font-display text-2xl font-semibold text-[#18181B]">
            {completed}
            <span className="text-base font-normal text-[#A1A1AA]">/{goals.length}</span>
          </p>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: `conic-gradient(#7C3AED ${(completed / goals.length) * 360}deg, #F4F4F5 0deg)` }}
        >
          <div className="w-7 h-7 rounded-full bg-white" />
        </div>
      </div>

      <div className="space-y-1">
        {goals.map(goal => (
          <button
            key={goal.id}
            onClick={() => setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, is_completed: !g.is_completed } : g))}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all',
              goal.is_completed ? 'bg-[#FAFAFA]' : 'hover:bg-[#FAFAFA]'
            )}
          >
            <div className={cn(
              'w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all',
              goal.is_completed ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-[#D1D0CC]'
            )}>
              {goal.is_completed && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
            </div>
            <span className={cn(
              'text-sm flex-1',
              goal.is_completed ? 'text-[#A1A1AA] line-through' : 'text-[#3F3F46] font-medium'
            )}>
              {goal.title}
            </span>
          </button>
        ))}
      </div>

      <button className="w-full mt-3 py-2 text-xs text-[#A1A1AA] hover:text-[#3F3F46] transition-colors flex items-center justify-center gap-1.5">
        <Plus className="w-3 h-3" /> Add goal
      </button>
    </motion.div>
  )
}

// ──────────────────────────────────────────
// Habits
// ──────────────────────────────────────────
function HabitsCard() {
  const [habits, setHabits] = useState(MOCK_HABITS)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.26 }}
      className="bg-white rounded-2xl border border-[#F4F4F5] p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A1A1AA] mb-1">Habits</p>
          <p className="text-sm font-medium text-[#18181B]">
            {habits.filter(h => h.completed).length} of {habits.length} done today
          </p>
        </div>
        <Flame className="w-4 h-4 text-[#A1A1AA]" strokeWidth={1.5} />
      </div>

      <div className="space-y-1">
        {habits.map(habit => (
          <button
            key={habit.id}
            onClick={() => setHabits(prev => prev.map(h => h.id === habit.id ? { ...h, completed: !h.completed } : h))}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group',
              habit.completed ? 'bg-[#FAFAFA]' : 'hover:bg-[#FAFAFA]'
            )}
          >
            <div className={cn(
              'w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all',
              habit.completed ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-[#D1D0CC] group-hover:border-[#A1A1AA]'
            )}>
              {habit.completed && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
            </div>
            <span className={cn(
              'text-sm flex-1',
              habit.completed ? 'text-[#A1A1AA] line-through' : 'text-[#3F3F46] font-medium'
            )}>
              {habit.title}
            </span>
            {habit.streak > 1 && (
              <span className="text-[10px] font-medium text-[#A1A1AA]">{habit.streak}d</span>
            )}
          </button>
        ))}
      </div>
    </motion.div>
  )
}

// ──────────────────────────────────────────
// Roadmap Progress
// ──────────────────────────────────────────
function RoadmapProgress() {
  const pct = Math.round((MOCK_ROADMAP.current_milestone / MOCK_ROADMAP.total_milestones) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl border border-[#F4F4F5] p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A1A1AA] mb-1">Active roadmap</p>
          <p className="font-medium text-sm text-[#18181B]">{MOCK_ROADMAP.title}</p>
          <p className="text-xs text-[#A1A1AA]">{MOCK_ROADMAP.current_phase} phase</p>
        </div>
        <span className="text-xs font-medium text-[#A1A1AA]">{pct}%</span>
      </div>

      <div className="w-full h-px bg-[#F4F4F5] rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-[#7C3AED] rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="space-y-1 mb-4">
        {MOCK_ROADMAP.next_steps.map(step => (
          <div key={step.id} className={cn('flex items-center gap-3 py-1.5', !step.unlocked && !step.completed && 'opacity-35')}>
            <div className={cn(
              'w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0',
              step.completed ? 'bg-[#7C3AED] border-[#7C3AED]' : step.unlocked ? 'border-[#A1A1AA]' : 'border-[#D1D0CC]'
            )}>
              {step.completed && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
              {!step.completed && !step.unlocked && <Lock className="w-2 h-2 text-[#A1A1AA]" />}
            </div>
            <span className={cn(
              'text-xs flex-1',
              step.completed ? 'text-[#A1A1AA] line-through' : 'text-[#3F3F46]',
              step.unlocked && !step.completed && 'font-medium'
            )}>
              {step.title}
            </span>
            {step.unlocked && !step.completed && (
              <ChevronRight className="w-3 h-3 text-[#A1A1AA]" />
            )}
          </div>
        ))}
      </div>

      <button className="w-full py-2 text-xs font-medium text-[#7C3AED] border border-[#E4E4E7] rounded-xl hover:bg-[#EDE9FE] transition-colors flex items-center justify-center gap-1.5">
        Continue <ArrowRight className="w-3 h-3" />
      </button>
    </motion.div>
  )
}

// ──────────────────────────────────────────
// Achievements
// ──────────────────────────────────────────
function AchievementsCard() {
  const earned = MOCK_ACHIEVEMENTS.filter(a => a.earned).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.34 }}
      className="bg-white rounded-2xl border border-[#F4F4F5] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A1A1AA]">Achievements</p>
        <span className="text-xs text-[#A1A1AA]">{earned}/{MOCK_ACHIEVEMENTS.length}</span>
      </div>

      <div className="space-y-2">
        {MOCK_ACHIEVEMENTS.map(a => (
          <div key={a.id} className="flex items-center gap-3">
            <div className={cn(
              'w-1.5 h-1.5 rounded-full flex-shrink-0',
              a.earned ? 'bg-[#7C3AED]' : 'bg-[#E4E4E7]'
            )} />
            <span className={cn(
              'text-xs',
              a.earned ? 'text-[#3F3F46] font-medium' : 'text-[#A1A1AA]'
            )}>
              {a.title}
            </span>
            {a.earned && (
              <Check className="w-3 h-3 text-[#A1A1AA] ml-auto flex-shrink-0" strokeWidth={2} />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ──────────────────────────────────────────
// Quote
// ──────────────────────────────────────────
function QuoteBanner() {
  const quote = getDailyQuote()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="rounded-2xl bg-[#18181B] px-6 py-5"
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#71717A] mb-2">Today</p>
      <p className="text-sm text-[#E4E4E7] leading-relaxed">"{quote}"</p>
    </motion.div>
  )
}

// ──────────────────────────────────────────
// AI Quick Access
// ──────────────────────────────────────────
function AIQuickAccess() {
  const router = useRouter()
  const [input, setInput] = useState('')

  const suggestions = [
    'Write my Instagram bio',
    'Give me 10 content ideas',
    'Help me price my service',
    'Write a cold DM script',
  ]

  function goToAI() {
    router.push('/ai-assistant')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.38 }}
      className="bg-white rounded-2xl border border-[#F4F4F5] p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-3.5 h-3.5 text-[#A1A1AA]" strokeWidth={1.5} />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#A1A1AA]">AI Assistant</span>
      </div>

      <div className="relative mb-3">
        <input
          className="input-field pr-10 text-sm"
          placeholder="Ask anything about your business..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && goToAI()}
        />
        <button
          onClick={goToAI}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#18181B] rounded-lg flex items-center justify-center hover:bg-[#3F3F46] transition-colors"
        >
          <ArrowRight className="w-3 h-3 text-white" />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {suggestions.map(s => (
          <button
            key={s}
            onClick={() => router.push('/ai-assistant')}
            className="text-[11px] px-2.5 py-1 bg-[#FAFAFA] text-[#71717A] rounded-lg hover:bg-[#EDE9FE] hover:text-[#3F3F46] transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </motion.div>
  )
}

// ──────────────────────────────────────────
// Page
// ──────────────────────────────────────────
export default function DashboardPage() {
  const { profile, signOut, loading } = useUser()
  const greeting = getGreeting()
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7C3AED] flex items-center justify-center animate-pulse">
            <span className="text-white text-lg">👑</span>
          </div>
          <p className="text-sm text-[#A1A1AA] font-medium">Loading your dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar profile={profile} onSignOut={signOut} />

      <div className="lg:pl-64 pb-20 lg:pb-8">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-[#FAFAFA]/90 backdrop-blur-md border-b border-[#F4F4F5] px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-xs text-[#A1A1AA]">{today}</p>
              <h1 className="font-display text-lg font-semibold text-[#18181B] mt-0.5">
                {greeting}{profile?.full_name ? `, ${profile.full_name}` : ''}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-[#71717A] bg-white border border-[#E4E4E7] px-3 py-1.5 rounded-full">
                <Flame className="w-3 h-3 text-[#A1A1AA]" strokeWidth={1.5} />
                {profile?.streak_current ?? 0}-day streak
              </div>
              <div className="w-8 h-8 rounded-full bg-[#3F3F46] flex items-center justify-center text-xs font-semibold text-[#EDE9FE]">
                {profile?.full_name?.[0] ?? 'C'}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">
          <QuoteBanner />
          <StatsRow profile={profile} />

          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <TodayTask />
              <WeeklyGoalsCard />
              <HabitsCard />
              <AIQuickAccess />
            </div>
            <div className="space-y-5">
              <RevenueCard profile={profile} />
              <RoadmapProgress />
              <AchievementsCard />
            </div>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  )
}
