'use client'


import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion } from 'framer-motion'
import {
  Lock, ChevronRight, Check, ArrowRight, Clock, Layers,
  ShoppingBag, Monitor, Video, Briefcase, Link2, Leaf,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sidebar } from '@/components/navigation/Sidebar'
import { MobileNav } from '@/components/navigation/MobileNav'
import { useUser } from '@/components/providers/UserProvider'
import type { LucideIcon } from 'lucide-react'

interface Roadmap {
  id: string
  icon: LucideIcon
  title: string
  description: string
  category: string
  tier: 'free' | 'pro'
  weeks: number
  milestones: number
  difficulty: string
  enrolled: boolean
  progress: number
  current_phase: string | null
  phases: { name: string; milestones: number; completed: number }[]
  outcomes: string[]
  tag: string | null
}

const ROADMAPS: Roadmap[] = [
  {
    id: 'shopify',
    icon: ShoppingBag,
    title: 'Start a Shopify Brand',
    description: 'Build a profitable e-commerce brand from product research to 6-figure revenue.',
    category: 'E-commerce',
    tier: 'free',
    weeks: 12,
    milestones: 48,
    difficulty: 'Beginner',
    enrolled: false,
    progress: 0,
    current_phase: null,
    phases: [
      { name: 'Foundation', milestones: 12, completed: 0 },
      { name: 'Launch', milestones: 14, completed: 0 },
      { name: 'Growth', milestones: 12, completed: 0 },
      { name: 'Scale', milestones: 10, completed: 0 },
    ],
    outcomes: ['First product live', 'First $1K month', 'First $5K month', '6-figure run rate'],
    tag: 'Most Popular',
  },
  {
    id: 'digital',
    icon: Monitor,
    title: 'Digital Product Business',
    description: 'Create and sell courses, ebooks, templates, and tools with near-zero overhead.',
    category: 'Digital Products',
    tier: 'pro',
    weeks: 8,
    milestones: 36,
    difficulty: 'Beginner',
    enrolled: false,
    progress: 0,
    current_phase: null,
    phases: [
      { name: 'Foundation', milestones: 8, completed: 0 },
      { name: 'Launch', milestones: 10, completed: 0 },
      { name: 'Growth', milestones: 10, completed: 0 },
      { name: 'Scale', milestones: 8, completed: 0 },
    ],
    outcomes: ['First digital product', 'First sale', '$1K passive month', '$5K/mo automated'],
    tag: 'High ROI',
  },
  {
    id: 'creator',
    icon: Video,
    title: 'Content Creator Business',
    description: 'Build an engaged audience and monetize through brand deals, products, and memberships.',
    category: 'Creator',
    tier: 'pro',
    weeks: 10,
    milestones: 40,
    difficulty: 'Beginner',
    enrolled: false,
    progress: 0,
    current_phase: null,
    phases: [],
    outcomes: ['1K followers', 'First brand deal', '10K following', 'Full-time creator income'],
    tag: null,
  },
  {
    id: 'service',
    icon: Briefcase,
    title: 'Service Business',
    description: 'Launch a consulting, freelance, or agency business. Fastest path to replacing your income.',
    category: 'Services',
    tier: 'free',
    weeks: 6,
    milestones: 32,
    difficulty: 'Beginner',
    enrolled: false,
    progress: 0,
    current_phase: null,
    phases: [],
    outcomes: ['First client', 'First $2K month', '$5K retainer clients', '$10K/mo agency'],
    tag: 'Fastest Start',
  },
  {
    id: 'affiliate',
    icon: Link2,
    title: 'Affiliate Marketing',
    description: 'Build passive income streams by recommending products you love.',
    category: 'Affiliate',
    tier: 'pro',
    weeks: 6,
    milestones: 28,
    difficulty: 'Beginner',
    enrolled: false,
    progress: 0,
    current_phase: null,
    phases: [],
    outcomes: ['First affiliate link live', 'First commission', '$500/mo passive', '$2K+/mo passive'],
    tag: null,
  },
  {
    id: 'medspa',
    icon: Leaf,
    title: 'Med Spa / Wellness Business',
    description: 'Open and scale a beauty or wellness business  -  from licensing to a full client roster.',
    category: 'Wellness',
    tier: 'pro',
    weeks: 16,
    milestones: 52,
    difficulty: 'Intermediate',
    enrolled: false,
    progress: 0,
    current_phase: null,
    phases: [],
    outcomes: ['Licensed & legal', 'First clients', 'Fully booked', 'Multi-location revenue'],
    tag: null,
  },
]

export default function RoadmapsPage() {
  const { profile, user, signOut } = useUser()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [selected, setSelected] = useState<string>('shopify')
  const [progressMap, setProgressMap] = useState<Record<string, { progress: number; enrolled: boolean }>>({})

  // Load progress from Supabase (source of truth), fall back to localStorage
  const loadProgress = useCallback(async () => {
    if (!user?.id) return
    try {
      const { data } = await supabase
        .from('roadmap_progress')
        .select('slug, completed_ids')
        .eq('user_id', user.id)

      if (data && data.length > 0) {
        const map: Record<string, { progress: number; enrolled: boolean }> = {}
        for (const row of data) {
          const roadmapDef = ROADMAPS.find(r => r.id === row.slug)
          const completedCount = (row.completed_ids as string[]).length
          map[row.slug] = {
            enrolled: completedCount > 0,
            progress: (roadmapDef?.milestones ?? 0) > 0
              ? Math.round((completedCount / roadmapDef!.milestones) * 100)
              : 0,
          }
        }
        setProgressMap(map)
        return
      }
    } catch { /* fall through to localStorage */ }

    // Fallback: localStorage (covers users not yet migrated)
    const map: Record<string, { progress: number; enrolled: boolean }> = {}
    for (const roadmap of ROADMAPS) {
      try {
        const raw = localStorage.getItem(`${user.id}_roadmap_${roadmap.id}_v1`)
        if (raw) {
          const saved = JSON.parse(raw) as { completed?: string[] }
          const completedCount = (saved.completed ?? []).length
          map[roadmap.id] = {
            enrolled: completedCount > 0,
            progress: roadmap.milestones > 0
              ? Math.round((completedCount / roadmap.milestones) * 100)
              : 0,
          }
        }
      } catch { /* ignore */ }
    }
    setProgressMap(map)
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { void loadProgress() }, [loadProgress])
  const selectedRoadmap = ROADMAPS.find(r => r.id === selected)!

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar profile={profile} onSignOut={signOut} />

      <div className="lg:pl-64 pb-20 lg:pb-8">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-[#F4F4F5] px-6 py-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="font-display text-lg font-semibold text-[#18181B]">Startup Roadmaps</h1>
            <p className="text-xs text-[#A1A1AA] mt-0.5">Step-by-step paths to your dream business</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="grid lg:grid-cols-5 gap-6">

            {/* Left  -  roadmap list */}
            <div className="lg:col-span-2 space-y-2">
              {ROADMAPS.map((roadmap, i) => {
                const locked = roadmap.tier === 'pro' && profile?.subscription_tier === 'free'
                const isSelected = selected === roadmap.id
                const Icon = roadmap.icon
                const liveProgress = progressMap[roadmap.id]
                const enrolled = liveProgress?.enrolled ?? roadmap.enrolled
                const progress = liveProgress?.progress ?? roadmap.progress

                return (
                  <motion.button
                    key={roadmap.id}
                    onClick={() => setSelected(roadmap.id)}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all',
                      isSelected
                        ? 'border-[#A1A1AA] bg-white shadow-card'
                        : 'border-transparent bg-white/60 hover:bg-white hover:border-[#F4F4F5]',
                      locked && 'opacity-50'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
                      isSelected ? 'bg-[#EDE9FE]' : 'bg-[#FAFAFA]'
                    )}>
                      <Icon className={cn('w-4 h-4', isSelected ? 'text-[#7C3AED]' : 'text-[#A1A1AA]')} strokeWidth={1.5} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          'text-sm font-medium truncate',
                          isSelected ? 'text-[#18181B]' : 'text-[#52525B]'
                        )}>
                          {roadmap.title}
                        </p>
                        {locked && <Lock className="w-3 h-3 text-[#A1A1AA] flex-shrink-0" />}
                      </div>
                      {enrolled && progress > 0 ? (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 max-w-[80px] h-0.5 bg-[#F4F4F5] rounded-full overflow-hidden">
                            <div className="h-full bg-[#7C3AED] rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-[10px] text-[#A1A1AA]">{progress}%</span>
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#A1A1AA] mt-0.5">{roadmap.weeks}w · {roadmap.milestones} steps</p>
                      )}
                    </div>

                    {roadmap.tag && (
                      <span className="text-[10px] font-medium text-[#A1A1AA] border border-[#E4E4E7] px-1.5 py-0.5 rounded-full flex-shrink-0 hidden sm:block">
                        {roadmap.tag}
                      </span>
                    )}

                    <ChevronRight className={cn(
                      'w-3.5 h-3.5 flex-shrink-0',
                      isSelected ? 'text-[#7C3AED]' : 'text-[#A1A1AA]'
                    )} />
                  </motion.button>
                )
              })}
            </div>

            {/* Right  -  detail panel */}
            <motion.div
              key={selectedRoadmap.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="lg:col-span-3 space-y-4"
            >
              {/* Hero */}
              <div className="bg-white rounded-2xl border border-[#F4F4F5] p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] flex items-center justify-center flex-shrink-0">
                    <selectedRoadmap.icon className="w-5 h-5 text-[#7C3AED]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-display text-xl font-semibold text-[#18181B] leading-snug">
                        {selectedRoadmap.title}
                      </h2>
                      {selectedRoadmap.tag && (
                        <span className="text-[10px] font-medium text-[#A1A1AA] border border-[#E4E4E7] px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">
                          {selectedRoadmap.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#71717A] mt-1 leading-relaxed">{selectedRoadmap.description}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="flex items-center gap-1 text-xs text-[#A1A1AA]">
                        <Clock className="w-3 h-3" strokeWidth={1.5} />
                        {selectedRoadmap.weeks} weeks
                      </span>
                      <span className="text-[#E4E4E7]">·</span>
                      <span className="flex items-center gap-1 text-xs text-[#A1A1AA]">
                        <Layers className="w-3 h-3" strokeWidth={1.5} />
                        {selectedRoadmap.milestones} steps
                      </span>
                      <span className="text-[#E4E4E7]">·</span>
                      <span className="text-xs text-[#A1A1AA]">{selectedRoadmap.difficulty}</span>
                    </div>
                  </div>
                </div>

                {(progressMap[selectedRoadmap.id]?.enrolled ?? selectedRoadmap.enrolled) ? (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-[#A1A1AA] mb-1.5">
                        <span>{selectedRoadmap.current_phase ?? 'In progress'}</span>
                        <span>{progressMap[selectedRoadmap.id]?.progress ?? selectedRoadmap.progress}%</span>
                      </div>
                      <div className="w-full h-1 bg-[#F4F4F5] rounded-full overflow-hidden">
                        <div className="h-full bg-[#7C3AED] rounded-full transition-all" style={{ width: `${progressMap[selectedRoadmap.id]?.progress ?? selectedRoadmap.progress}%` }} />
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/roadmaps/${selectedRoadmap.id}`)}
                      className="w-full py-2.5 bg-[#18181B] text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-[#3F3F46] transition-colors"
                    >
                      Continue roadmap <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => router.push(`/roadmaps/${selectedRoadmap.id}`)}
                    className="w-full py-2.5 bg-[#7C3AED] text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-[#5B21B6] transition-colors"
                  >
                    Start this roadmap <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Outcomes */}
              <div className="bg-white rounded-2xl border border-[#F4F4F5] p-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A1A1AA] mb-3">What you'll achieve</p>
                <div className="grid grid-cols-2 gap-2">
                  {selectedRoadmap.outcomes.map((outcome, i) => (
                    <div key={outcome} className="flex items-center gap-2.5 py-2 px-3 rounded-xl bg-[#FAFAFA]">
                      <span className="text-[10px] font-bold text-[#A1A1AA] w-3 flex-shrink-0">{i + 1}</span>
                      <span className="text-xs text-[#3F3F46] font-medium">{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phases */}
              {selectedRoadmap.phases.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#F4F4F5] p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A1A1AA] mb-4">Phases</p>
                  <div className="space-y-3">
                    {selectedRoadmap.phases.map((phase, i) => {
                      const phasePct = Math.round((phase.completed / phase.milestones) * 100)
                      return (
                        <div key={phase.name} className="flex items-center gap-4">
                          <span className="text-[10px] font-bold text-[#A1A1AA] w-3 flex-shrink-0">{i + 1}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-[#3F3F46]">{phase.name}</span>
                              <span className="text-[10px] text-[#A1A1AA]">
                                {phase.completed}/{phase.milestones}
                              </span>
                            </div>
                            <div className="h-0.5 bg-[#F4F4F5] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#7C3AED] rounded-full transition-all duration-700"
                                style={{ width: `${phasePct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  )
}
