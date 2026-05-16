'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Map,
  BookOpen,
  Bot,
  Flame,
  Users,
  Crown,
  Settings,
  LogOut,
  Sparkles,
  TrendingUp,
  Calculator,
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
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/roadmaps', label: 'Roadmaps', icon: Map },
  { href: '/vault', label: 'Resource Vault', icon: BookOpen },
  { href: '/ai-assistant', label: 'AI Assistant', icon: Bot, badge: 'NEW' },
  { href: '/habits', label: 'Habits', icon: Flame },
  { href: '/revenue', label: 'Revenue', icon: TrendingUp },
  { href: '/calculators', label: 'Calculators', icon: Calculator },
  { href: '/community', label: 'Community', icon: Users },
]

export function Sidebar({ profile, onSignOut }: SidebarProps) {
  const pathname = usePathname()
  const levelMeta = profile ? LEVEL_METADATA[profile.level] : LEVEL_METADATA.intern

  const xpToNextLevel = profile
    ? { current: profile.xp_points, percentage: Math.min(Math.round((profile.xp_points % 500) / 5), 100) }
    : { current: 0, percentage: 0 }

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-ink-100 flex flex-col z-40 hidden lg:flex">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-ink-50">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
            <Crown className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-sm text-ink-900 leading-none">Rinse & Repeat</span>
            <span className="block text-[10px] font-semibold text-gold-500 uppercase tracking-widest leading-none mt-0.5">CEO</span>
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
                    ? 'bg-gold-100 text-gold-700'
                    : 'text-ink-500 hover:bg-ink-50 hover:text-ink-900'
                )}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.1 }}
              >
                <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-gold-600' : '')} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 bg-gold-500 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-500"
                    layoutId="nav-dot"
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Level / XP Section */}
      {profile && (
        <div className="px-4 py-3 mx-3 mb-3 rounded-2xl bg-gradient-to-br from-cream-50 to-gold-100 border border-gold-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{levelMeta.icon}</span>
            <div>
              <p className="text-xs font-semibold text-ink-700">{levelMeta.label}</p>
              <p className="text-[10px] text-ink-400">{profile.xp_points.toLocaleString()} XP</p>
            </div>
            <div className="ml-auto">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            </div>
          </div>
          <ProgressBar
            value={xpToNextLevel.percentage}
            size="xs"
            color="gold"
            animated={false}
          />
          <p className="text-[10px] text-ink-400 mt-1">{xpToNextLevel.percentage}% to next level</p>
        </div>
      )}

      {/* Upgrade CTA for free users */}
      {profile?.subscription_tier === 'free' && (
        <div className="px-3 pb-3">
          <Link href="/pricing">
            <div className="px-4 py-3 rounded-2xl bg-ink-900 text-white cursor-pointer hover:bg-ink-800 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-3.5 h-3.5 text-gold-400" />
                <span className="text-xs font-semibold">Upgrade to Founder</span>
              </div>
              <p className="text-[10px] text-ink-300 leading-relaxed">
                Unlock all roadmaps, AI assistant, and 200+ resources.
              </p>
              <div className="mt-2 text-xs font-bold text-gold-400">From $19/mo →</div>
            </div>
          </Link>
        </div>
      )}

      {/* User + Settings */}
      <div className="px-3 pb-4 border-t border-ink-50 pt-3 space-y-0.5">
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
