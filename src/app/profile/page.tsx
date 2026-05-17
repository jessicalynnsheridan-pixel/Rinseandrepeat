'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Crown, Flame, Zap, TrendingUp, Target, BookOpen,
  Edit2, Check, ChevronRight, Star, Trophy, Rocket,
  Shield, Heart, Users,
} from 'lucide-react'
import Link from 'next/link'
import { cn, formatCurrency } from '@/lib/utils'
import { Sidebar } from '@/components/navigation/Sidebar'
import { MobileNav } from '@/components/navigation/MobileNav'
import { useUser } from '@/components/providers/UserProvider'
import { LEVEL_METADATA, LEVEL_THRESHOLDS, BUSINESS_TYPES } from '@/types'
import type { UserLevel } from '@/types'
import { ProgressBar } from '@/components/ui/ProgressBar'

// ── Achievement definitions ────────────────────────────────────────────────

interface BadgeDef {
  id: string
  icon: React.ElementType
  emoji: string
  title: string
  description: string
  color: string
  bg: string
  check: (data: ProfileStats) => boolean
}

interface ProfileStats {
  streak: number
  habits: number
  totalRevenue: number
  milestonesCompleted: number
  xpPoints: number
  daysInApp: number
}

const BADGES: BadgeDef[] = [
  {
    id: 'first-day',
    icon: Rocket,
    emoji: '🚀',
    title: 'Day One',
    description: 'Started your CEO journey',
    color: '#7C3AED',
    bg: '#EDE9FE',
    check: () => true, // everyone who's here has started
  },
  {
    id: 'streak-7',
    icon: Flame,
    emoji: '🔥',
    title: 'On Fire',
    description: '7-day streak achieved',
    color: '#EA580C',
    bg: '#FFEDD5',
    check: ({ streak }) => streak >= 7,
  },
  {
    id: 'streak-30',
    icon: Crown,
    emoji: '👑',
    title: 'Unstoppable',
    description: '30-day streak achieved',
    color: '#D97706',
    bg: '#FEF3C7',
    check: ({ streak }) => streak >= 30,
  },
  {
    id: 'first-habit',
    icon: Target,
    emoji: '🎯',
    title: 'Habit Formed',
    description: 'Added your first daily habit',
    color: '#16A34A',
    bg: '#DCFCE7',
    check: ({ habits }) => habits >= 1,
  },
  {
    id: 'habit-five',
    icon: Shield,
    emoji: '🛡️',
    title: 'Habit Stack',
    description: 'Building 5+ daily habits',
    color: '#0891B2',
    bg: '#E0F2FE',
    check: ({ habits }) => habits >= 5,
  },
  {
    id: 'first-revenue',
    icon: TrendingUp,
    emoji: '💰',
    title: 'First Dollar',
    description: 'Logged your first income',
    color: '#16A34A',
    bg: '#DCFCE7',
    check: ({ totalRevenue }) => totalRevenue > 0,
  },
  {
    id: 'revenue-1k',
    icon: Star,
    emoji: '⭐',
    title: '$1K Club',
    description: 'Logged over $1,000 in revenue',
    color: '#D97706',
    bg: '#FEF3C7',
    check: ({ totalRevenue }) => totalRevenue >= 1000,
  },
  {
    id: 'revenue-5k',
    icon: Trophy,
    emoji: '🏆',
    title: 'CEO Revenue',
    description: 'Logged over $5,000 in revenue',
    color: '#7C3AED',
    bg: '#EDE9FE',
    check: ({ totalRevenue }) => totalRevenue >= 5000,
  },
  {
    id: 'first-milestone',
    icon: BookOpen,
    emoji: '📖',
    title: 'First Step',
    description: 'Completed your first roadmap milestone',
    color: '#7C3AED',
    bg: '#EDE9FE',
    check: ({ milestonesCompleted }) => milestonesCompleted >= 1,
  },
  {
    id: 'xp-500',
    icon: Zap,
    emoji: '⚡',
    title: 'Founder Level',
    description: 'Reached Founder XP tier',
    color: '#7C3AED',
    bg: '#EDE9FE',
    check: ({ xpPoints }) => xpPoints >= 500,
  },
  {
    id: 'xp-2000',
    icon: Crown,
    emoji: '💎',
    title: 'CEO Level',
    description: 'Reached CEO XP tier',
    color: '#6D28D9',
    bg: '#DDD6FE',
    check: ({ xpPoints }) => xpPoints >= 2000,
  },
  {
    id: 'week-one',
    icon: Heart,
    emoji: '❤️',
    title: 'Week One Done',
    description: 'One week in the app',
    color: '#E11D48',
    bg: '#FFE4E6',
    check: ({ daysInApp }) => daysInApp >= 7,
  },
]

// ── Stat card ─────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  value,
  label,
  sub,
  color,
  delay,
}: {
  icon: React.ElementType
  value: string
  label: string
  sub?: string
  color: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl border border-[#F4F4F5] p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA]">{label}</span>
      </div>
      <p className="text-2xl font-bold text-[#18181B] leading-none">{value}</p>
      {sub && <p className="text-xs text-[#A1A1AA] mt-1">{sub}</p>}
    </motion.div>
  )
}

// ── Badge card ──────────────────────────────────────────────────────────────

function BadgeCard({ badge, earned }: { badge: BadgeDef; earned: boolean }) {
  return (
    <div className={cn(
      'flex flex-col items-center gap-2 p-3 rounded-2xl border text-center transition-all',
      earned
        ? 'bg-white border-[#F4F4F5]'
        : 'bg-[#FAFAFA] border-[#F4F4F5] opacity-40 grayscale'
    )}>
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
        style={{ backgroundColor: earned ? badge.bg : '#F4F4F5' }}
      >
        {badge.emoji}
      </div>
      <div>
        <p className={cn('text-xs font-semibold leading-tight', earned ? 'text-[#18181B]' : 'text-[#A1A1AA]')}>
          {badge.title}
        </p>
        <p className="text-[9px] text-[#A1A1AA] leading-tight mt-0.5 hidden sm:block">{badge.description}</p>
      </div>
      {earned && (
        <div className="w-4 h-4 rounded-full bg-[#DCFCE7] flex items-center justify-center flex-shrink-0">
          <Check className="w-2.5 h-2.5 text-[#16A34A]" strokeWidth={3} />
        </div>
      )}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { profile, user, signOut } = useUser()

  const safeLevel = (profile?.level && LEVEL_METADATA[profile.level])
    ? profile.level
    : 'intern'
  const levelMeta = LEVEL_METADATA[safeLevel]
  const nextLevelKey = levelMeta.nextLevel as UserLevel | null
  const xpForCurrentLevel = LEVEL_THRESHOLDS[safeLevel]
  const xpForNextLevel = nextLevelKey ? LEVEL_THRESHOLDS[nextLevelKey] : null
  const xpProgress = xpForNextLevel !== null && xpForNextLevel > xpForCurrentLevel
    ? Math.min(100, Math.round(((( profile?.xp_points ?? 0) - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100))
    : 100
  const xpToNext = xpForNextLevel !== null ? xpForNextLevel - (profile?.xp_points ?? 0) : null

  // Load stats from localStorage
  const [stats, setStats] = useState<ProfileStats>({
    streak: 0,
    habits: 0,
    totalRevenue: 0,
    milestonesCompleted: 0,
    xpPoints: 0,
    daysInApp: 0,
  })

  useEffect(() => {
    if (!user?.id || !profile) return

    const streak = profile.streak_current ?? 0
    const xpPoints = profile.xp_points ?? 0
    const daysInApp = profile.created_at
      ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0

    // Count habits from localStorage
    let habits = 0
    try {
      const raw = localStorage.getItem(`${user.id}_habits_v1`)
      if (raw) habits = JSON.parse(raw).length
    } catch {}

    // Sum revenue from localStorage
    let totalRevenue = 0
    try {
      const raw = localStorage.getItem(`${user.id}_revenue_v1`)
      if (raw) {
        const data = JSON.parse(raw)
        const monthEntries = data.month?.entries ?? []
        totalRevenue = monthEntries.reduce((s: number, e: { amount: number }) => s + e.amount, 0)
      }
    } catch {}

    // Count completed roadmap milestones
    let milestonesCompleted = 0
    try {
      const slug = profile.selected_roadmap ?? 'shopify'
      const raw = localStorage.getItem(`${user.id}_roadmap_${slug}_v1`)
      if (raw) {
        const data = JSON.parse(raw)
        milestonesCompleted = (data.completed ?? []).length
      }
    } catch {}

    setStats({ streak, habits, totalRevenue, milestonesCompleted, xpPoints, daysInApp })
  }, [user?.id, profile])

  const earnedBadges = useMemo(
    () => BADGES.filter(b => b.check(stats)),
    [stats]
  )

  const firstName = profile?.full_name?.split(' ')[0] ?? 'CEO'
  const businessMeta = profile?.business_type ? BUSINESS_TYPES[profile.business_type] : null

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar profile={profile} onSignOut={signOut} />

      <div className="lg:pl-64 pb-24 lg:pb-8">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-6">

          {/* ── CEO Identity Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#18181B] rounded-3xl p-6 relative overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#7C3AED]/20 blur-3xl translate-x-16 -translate-y-16" />

            <div className="relative flex items-start gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center text-2xl font-bold text-white shadow-[0_0_32px_rgba(124,58,237,0.4)] flex-shrink-0">
                {firstName[0]?.toUpperCase() ?? '✦'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <h1 className="text-xl font-bold text-white leading-none">{profile?.full_name ?? 'Your Name'}</h1>
                    {businessMeta && (
                      <p className="text-sm text-[#A1A1AA] mt-1">
                        {businessMeta.icon} {businessMeta.label}
                        {profile?.business_stage && (
                          <span className="ml-1 text-[#71717A]">· {profile.business_stage}</span>
                        )}
                      </p>
                    )}
                  </div>
                  <Link
                    href="/settings"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors flex-shrink-0"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit profile
                  </Link>
                </div>

                {/* Level badge */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7C3AED]/30 border border-[#7C3AED]/40">
                    <span className="text-sm">{levelMeta.icon}</span>
                    <span className="text-xs font-bold text-[#C4B5FD]">{levelMeta.label}</span>
                  </div>
                  {profile?.streak_current ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EA580C]/20 border border-[#EA580C]/30">
                      <Flame className="w-3.5 h-3.5 text-[#FB923C]" />
                      <span className="text-xs font-bold text-[#FB923C]">{profile.streak_current} day streak</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* XP Progress */}
            <div className="relative mt-5 pt-5 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#A1A1AA]">{(profile?.xp_points ?? 0).toLocaleString()} XP</span>
                <span className="text-xs text-[#52525B]">
                  {xpToNext !== null
                    ? `${xpToNext.toLocaleString()} XP to ${LEVEL_METADATA[nextLevelKey!].label}`
                    : 'Max level 👑'}
                </span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                />
              </div>
            </div>
          </motion.div>

          {/* ── Stats Grid ── */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-3">Your stats</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                icon={Flame}
                value={stats.streak.toString()}
                label="Day Streak"
                sub={stats.streak >= 7 ? 'On fire 🔥' : 'Keep going'}
                color="#EA580C"
                delay={0.05}
              />
              <StatCard
                icon={Zap}
                value={(profile?.xp_points ?? 0).toLocaleString()}
                label="XP Points"
                sub={levelMeta.label}
                color="#7C3AED"
                delay={0.1}
              />
              <StatCard
                icon={TrendingUp}
                value={formatCurrency(stats.totalRevenue)}
                label="Revenue"
                sub="This month"
                color="#16A34A"
                delay={0.15}
              />
              <StatCard
                icon={Target}
                value={stats.habits.toString()}
                label="Habits"
                sub="Daily habits"
                color="#0891B2"
                delay={0.2}
              />
            </div>
          </div>

          {/* ── Achievement Badges ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA]">
                Achievements
              </p>
              <span className="text-xs text-[#A1A1AA]">
                {earnedBadges.length}/{BADGES.length} earned
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {BADGES.map(badge => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  earned={badge.check(stats)}
                />
              ))}
            </div>
          </motion.div>

          {/* ── Roadmap Progress ── */}
          {profile?.selected_roadmap && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-[#F4F4F5] p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-0.5">Active Roadmap</p>
                  <p className="text-sm font-semibold text-[#18181B] capitalize">
                    {businessMeta?.icon} {profile.selected_roadmap.replace('-', ' ')} Roadmap
                  </p>
                </div>
                <Link
                  href={`/roadmaps/${profile.selected_roadmap}`}
                  className="flex items-center gap-1 text-xs text-[#7C3AED] font-semibold hover:underline"
                >
                  Continue <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <ProgressBar
                    value={stats.milestonesCompleted > 0 ? Math.min(100, stats.milestonesCompleted * 25) : 0}
                    size="sm"
                    color="violet"
                    animated={false}
                  />
                </div>
                <span className="text-xs font-semibold text-[#A1A1AA] flex-shrink-0">
                  {stats.milestonesCompleted} steps done
                </span>
              </div>
            </motion.div>
          )}

          {/* ── Goals ── */}
          {profile?.goals && profile.goals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white rounded-2xl border border-[#F4F4F5] p-5"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-3">Your Goals</p>
              <div className="flex flex-wrap gap-2">
                {profile.goals.map(goal => (
                  <span
                    key={goal}
                    className="px-3 py-1.5 text-xs font-semibold rounded-full bg-[#EDE9FE] text-[#5B21B6]"
                  >
                    {goal.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Revenue Goal ── */}
          {profile?.revenue_goal && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl border border-[#F4F4F5] p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA]">Revenue Goal</p>
                <span className="text-xs font-semibold text-[#A1A1AA]">
                  {stats.totalRevenue > 0
                    ? `${Math.round((stats.totalRevenue / profile.revenue_goal) * 100)}% there`
                    : 'Not started'}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-bold text-[#18181B]">{formatCurrency(stats.totalRevenue)}</span>
                <span className="text-sm text-[#A1A1AA]">/ {formatCurrency(profile.revenue_goal)} goal</span>
              </div>
              <ProgressBar
                value={Math.min(100, Math.round((stats.totalRevenue / profile.revenue_goal) * 100))}
                size="sm"
                color="success"
                animated={false}
              />
            </motion.div>
          )}

        </div>
      </div>

      <MobileNav />
    </div>
  )
}
