'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Map, BookOpen, Bot, Flame, Users,
  Crown, Settings, LogOut, Sparkles, TrendingUp, Calculator, User, Sun,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Profile, UserLevel } from '@/types'
import { LEVEL_METADATA, LEVEL_THRESHOLDS } from '@/types'
import { ProgressBar } from '@/components/ui/ProgressBar'

function todayKey() {
  return new Date().toISOString().split('T')[0]
}

type StreakTier = 'cold' | 'warm' | 'hot' | 'blazing' | 'legendary'
function getStreakTier(streak: number): StreakTier {
  if (streak === 0) return 'cold'
  if (streak < 7) return 'warm'
  if (streak < 30) return 'hot'
  if (streak < 100) return 'blazing'
  return 'legendary'
}

interface SidebarProps {
  profile: Profile | null
  onSignOut: () => void
}

const navItems = [
  { href: '/dashboard',    label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/daily',        label: 'Daily Brief',     icon: Sun, badge: 'TODAY' },
  { href: '/roadmaps',     label: 'Roadmaps',         icon: Map },
  { href: '/vault',        label: 'Resource Vault',   icon: BookOpen },
  { href: '/ai-assistant', label: 'AI Assistant',     icon: Bot, badge: 'NEW' },
  { href: '/guide',        label: 'Claude Guide',     icon: Sparkles, badge: 'NEW' },
  { href: '/habits',       label: 'Habits',           icon: Flame },
  { href: '/revenue',      label: 'Revenue',          icon: TrendingUp },
  { href: '/calculators',  label: 'Calculators',      icon: Calculator },
  { href: '/community',    label: 'Community',        icon: Users },
  { href: '/profile',      label: 'My Profile',       icon: User },
]

export function Sidebar({ profile, onSignOut }: SidebarProps) {
  const pathname = usePathname()

  // Defensive: fall back to 'intern' if level is missing or unrecognised
  const safeLevel = (profile?.level && LEVEL_METADATA[profile.level])
    ? profile.level
    : 'intern'
  const levelMeta = LEVEL_METADATA[safeLevel]

  const xpPoints = profile?.xp_points ?? 0
  const streak = profile?.streak_current ?? 0
  const streakTier = getStreakTier(streak)

  // Exact XP progress between current and next level
  const nextLevelKey = LEVEL_METADATA[safeLevel].nextLevel as UserLevel | null
  const xpForCurrentLevel = LEVEL_THRESHOLDS[safeLevel]
  const xpForNextLevel = nextLevelKey ? LEVEL_THRESHOLDS[nextLevelKey] : null
  const xpToNext = xpForNextLevel !== null ? xpForNextLevel - xpPoints : null
  const xpProgress = xpForNextLevel !== null && xpForNextLevel > xpForCurrentLevel
    ? Math.min(100, Math.round(((xpPoints - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100))
    : 100

  // Today's rings  -  loaded from localStorage
  const [rings, setRings] = useState({ build: false, earn: false, grow: false })
  useEffect(() => {
    if (!profile?.id) return
    try {
      const raw = localStorage.getItem(`${profile.id}_rings_${todayKey()}`)
      if (raw) setRings(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [profile?.id])
  const ringsTotal = [rings.build, rings.earn, rings.grow].filter(Boolean).length

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-[#F4F4F5] flex-col z-40 hidden lg:flex">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#F4F4F5]">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center shadow-[0_0_16px_rgba(124,58,237,0.25)] group-hover:scale-105 transition-transform">
            <Crown className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm text-[#18181B] leading-none">Rinse & Repeat</span>
            <span className="block text-[10px] font-semibold text-[#7C3AED] uppercase tracking-widest leading-none mt-0.5">CEO</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer',
                  isActive
                    ? 'bg-[#EDE9FE] text-[#6D28D9]'
                    : 'text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#18181B]'
                )}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.1 }}
              >
                <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-[#7C3AED]' : '')} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    item.badge === 'TODAY' ? 'bg-[#16A34A] text-white' : 'bg-[#7C3AED] text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-[#7C3AED]"
                    layoutId="nav-dot"
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Level / XP / Streak / Rings card */}
      {profile && (
        <div className="px-4 py-3 mx-3 mb-3 rounded-2xl bg-[#EDE9FE] border border-[#DDD6FE]">
          {/* Level + Streak row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">{levelMeta.icon}</span>
              <div>
                <p className="text-xs font-semibold text-[#3F3F46]">{levelMeta.label}</p>
                <p className="text-[10px] text-[#A1A1AA]">{xpPoints.toLocaleString()} XP</p>
              </div>
            </div>
            {/* Streak tier pill */}
            <div className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold leading-none',
              streakTier === 'cold' ? 'bg-white text-[#A1A1AA]' :
              streakTier === 'warm' ? 'bg-[#FEF3C7] text-[#D97706]' :
              streakTier === 'hot' ? 'bg-[#FFEDD5] text-[#EA580C]' :
              streakTier === 'blazing' ? 'bg-white text-[#7C3AED]' :
              'bg-[#18181B] text-white'
            )}>
              <span>{streakTier === 'cold' ? '○' : streakTier === 'legendary' ? '👑' : '🔥'}</span>
              <span>{streak > 0 ? `${streak}d` : 'Start'}</span>
            </div>
          </div>

          {/* XP progress bar */}
          <ProgressBar value={xpProgress} size="xs" color="violet" animated={false} />
          <p className="text-[10px] text-[#A1A1AA] mt-1">
            {xpToNext !== null
              ? `${xpToNext.toLocaleString()} XP to ${LEVEL_METADATA[nextLevelKey!].label}`
              : 'Max level reached 👑'}
          </p>

          {/* Today's rings mini strip */}
          <div className="flex items-center gap-2.5 mt-2.5 pt-2.5 border-t border-[#C4B5FD]/40">
            {[
              { key: 'build', color: '#7C3AED', label: 'B', done: rings.build },
              { key: 'earn', color: '#16A34A', label: 'E', done: rings.earn },
              { key: 'grow', color: '#F97316', label: 'G', done: rings.grow },
            ].map(ring => (
              <div key={ring.key} className="flex items-center gap-1">
                <div
                  className="w-2.5 h-2.5 rounded-full border-2 transition-all"
                  style={ring.done
                    ? { backgroundColor: ring.color, borderColor: ring.color }
                    : { backgroundColor: 'transparent', borderColor: '#C4B5FD' }}
                />
                <span className="text-[9px] font-bold" style={{ color: ring.done ? ring.color : '#A1A1AA' }}>
                  {ring.label}
                </span>
              </div>
            ))}
            <span className="text-[9px] text-[#A1A1AA] ml-auto">{ringsTotal}/3 today</span>
          </div>
        </div>
      )}

      {/* Upgrade CTA for free users */}
      {profile?.subscription_tier === 'free' && (
        <div className="px-3 pb-3">
          <Link href="/settings">
            <div className="px-4 py-3 rounded-2xl bg-[#18181B] text-white cursor-pointer hover:bg-[#3F3F46] transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span className="text-xs font-semibold">Upgrade to Founder</span>
              </div>
              <p className="text-[10px] text-[#A1A1AA] leading-relaxed">
                Unlock all roadmaps, AI assistant, and 200+ resources.
              </p>
              <div className="mt-2 text-xs font-bold text-[#A78BFA]">From $19/mo →</div>
            </div>
          </Link>
        </div>
      )}

      {/* User + Settings */}
      <div className="px-3 pb-4 border-t border-[#F4F4F5] pt-3 space-y-0.5">
        <Link href="/settings">
          <div className="nav-item text-sm">
            <Settings className="w-4 h-4" />
            Settings
          </div>
        </Link>
        <button onClick={onSignOut} className="nav-item w-full text-sm">
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
