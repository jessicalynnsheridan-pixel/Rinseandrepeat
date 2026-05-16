'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Map, BookOpen, Bot, Flame, Users,
  Crown, Settings, LogOut, Sparkles, TrendingUp, Calculator,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types'
import { LEVEL_METADATA } from '@/types'
import { ProgressBar } from '@/components/ui/ProgressBar'

interface SidebarProps {
  profile: Profile | null
  onSignOut: () => void
}

const navItems = [
  { href: '/dashboard',    label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/roadmaps',     label: 'Roadmaps',         icon: Map },
  { href: '/vault',        label: 'Resource Vault',   icon: BookOpen },
  { href: '/ai-assistant', label: 'AI Assistant',     icon: Bot, badge: 'NEW' },
  { href: '/habits',       label: 'Habits',           icon: Flame },
  { href: '/revenue',      label: 'Revenue',          icon: TrendingUp },
  { href: '/calculators',  label: 'Calculators',      icon: Calculator },
  { href: '/community',    label: 'Community',        icon: Users },
]

export function Sidebar({ profile, onSignOut }: SidebarProps) {
  const pathname = usePathname()

  // Defensive: fall back to 'intern' if level is missing or unrecognised
  const safeLevel = (profile?.level && LEVEL_METADATA[profile.level])
    ? profile.level
    : 'intern'
  const levelMeta = LEVEL_METADATA[safeLevel]

  const xpPoints = profile?.xp_points ?? 0
  const xpPct = Math.min(Math.round((xpPoints % 500) / 5), 100)

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
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 bg-[#7C3AED] text-white rounded-full">
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

      {/* Level / XP */}
      {profile && (
        <div className="px-4 py-3 mx-3 mb-3 rounded-2xl bg-[#EDE9FE] border border-[#DDD6FE]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{levelMeta.icon}</span>
            <div>
              <p className="text-xs font-semibold text-[#3F3F46]">{levelMeta.label}</p>
              <p className="text-[10px] text-[#A1A1AA]">{xpPoints.toLocaleString()} XP</p>
            </div>
            <div className="ml-auto">
              <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
            </div>
          </div>
          <ProgressBar value={xpPct} size="xs" color="violet" animated={false} />
          <p className="text-[10px] text-[#A1A1AA] mt-1">{xpPct}% to next level</p>
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
