'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useUser } from '@/components/providers/UserProvider'
import { Sidebar } from '@/components/navigation/Sidebar'
import { MobileNav } from '@/components/navigation/MobileNav'
import { LEVEL_METADATA } from '@/types'

// ── Constants ─────────────────────────────────────────────────────────────────

const ROADMAP_NAMES: Record<string, string> = {
  shopify:   'Shopify Brand',
  digital:   'Digital Products',
  creator:   'Content Creator',
  service:   'Service Business',
  affiliate: 'Affiliate Marketing',
  medspa:    'Med Spa / Wellness',
}

const QUOTES = [
  'You don\'t have to be great to start, but you have to start to be great.',
  'Every expert was once a beginner. Show up today.',
  'Your future self is watching. Make her proud.',
  'Progress, not perfection. One step today.',
  'The business you want exists on the other side of the habits you\'re building.',
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting(name: string | null): string {
  const hour = new Date().getHours()
  const first = name ? name.split(' ')[0] : 'there'
  if (hour < 12) return `Good morning ${first} ☀️`
  if (hour < 17) return `Good afternoon ${first} 🌤`
  return `Good evening ${first} 🌙`
}

function getDayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  return Math.floor(diff / 86_400_000)
}

function todayISODate(): string {
  return new Date().toISOString().split('T')[0]
}

interface RoadmapProgress {
  completedIds: string[]
  activeStepIndex: number
}

interface CommunityWin {
  id: string
  content: string
  author_name: string | null
  author_level: string | null
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#F4F4F5] p-5 animate-pulse">
      <div className="h-3 w-24 bg-[#F4F4F5] rounded mb-3" />
      <div className="h-5 w-3/4 bg-[#F4F4F5] rounded mb-2" />
      <div className="h-4 w-1/2 bg-[#F4F4F5] rounded" />
    </div>
  )
}

// ── Mini progress ring ────────────────────────────────────────────────────────

function ProgressRing({ pct }: { pct: number }) {
  const r = 16
  const circ = 2 * Math.PI * r
  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r={r} fill="none" stroke="#F4F4F5" strokeWidth="3" />
        <circle
          cx="20" cy="20" r={r} fill="none"
          stroke="#7C3AED" strokeWidth="3"
          strokeDasharray={`${circ}`}
          strokeDashoffset={`${circ * (1 - pct / 100)}`}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#7C3AED]">
        {pct}%
      </span>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DailyBriefPage() {
  const { user, profile, signOut } = useUser()
  const supabase = createClientComponentClient()

  // Roadmap state
  const [roadmapProgress, setRoadmapProgress] = useState<RoadmapProgress | null>(null)
  const [roadmapLoaded, setRoadmapLoaded] = useState(false)

  // Habits state
  const [habitTotal, setHabitTotal]         = useState(0)
  const [habitDone, setHabitDone]           = useState(0)
  const [habitsLoaded, setHabitsLoaded]     = useState(false)

  // Community win state
  const [communityWin, setCommunityWin]     = useState<CommunityWin | null>(null)
  const [communityLoaded, setCommunityLoaded] = useState(false)

  const quote = QUOTES[getDayOfYear() % 5]

  // ── Load roadmap progress from Supabase (fallback to localStorage) ──────────
  useEffect(() => {
    if (!user?.id || !profile) return
    const slug = profile.selected_roadmap
    if (!slug) { setRoadmapLoaded(true); return }

    async function loadRoadmap() {
      try {
        const { data } = await supabase
          .from('roadmap_progress')
          .select('completed_ids, checklists')
          .eq('user_id', user!.id)
          .eq('slug', slug!)
          .maybeSingle()

        if (data) {
          setRoadmapProgress({
            completedIds: (data.completed_ids as string[]) ?? [],
            activeStepIndex: 0,
          })
          setRoadmapLoaded(true)
          return
        }
      } catch { /* fall through */ }

      // Fallback: localStorage
      try {
        const raw = localStorage.getItem(`${user!.id}_roadmap_${slug}_v1`)
        if (raw) {
          const parsed = JSON.parse(raw) as RoadmapProgress
          setRoadmapProgress(parsed)
        } else {
          setRoadmapProgress({ completedIds: [], activeStepIndex: 0 })
        }
      } catch {
        setRoadmapProgress({ completedIds: [], activeStepIndex: 0 })
      }
      setRoadmapLoaded(true)
    }

    void loadRoadmap()
  }, [user?.id, profile?.selected_roadmap]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch habits ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return
    async function loadHabits() {
      const today = todayISODate()
      const [{ data: habitsData }, { data: logsData }] = await Promise.all([
        supabase
          .from('habits')
          .select('id')
          .eq('user_id', user!.id)
          .eq('is_active', true),
        supabase
          .from('habit_logs')
          .select('id')
          .eq('user_id', user!.id)
          .eq('logged_date', today),
      ])
      setHabitTotal(habitsData?.length ?? 0)
      setHabitDone(logsData?.length ?? 0)
      setHabitsLoaded(true)
    }
    loadHabits()
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch community win ─────────────────────────────────────────────────────
  useEffect(() => {
    async function loadWin() {
      const { data } = await supabase
        .from('community_posts')
        .select('id, content, profiles!community_posts_user_id_fkey (full_name, level)')
        .eq('post_type', 'win')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        const rawProfiles = data.profiles as unknown
        const profileData = Array.isArray(rawProfiles)
          ? (rawProfiles[0] as { full_name: string | null; level: string | null } | undefined) ?? null
          : (rawProfiles as { full_name: string | null; level: string | null } | null)
        setCommunityWin({
          id: data.id,
          content: data.content,
          author_name: profileData?.full_name ?? null,
          author_level: profileData?.level ?? null,
        })
      }
      setCommunityLoaded(true)
    }
    loadWin()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived values ──────────────────────────────────────────────────────────
  const slug          = profile?.selected_roadmap ?? null
  const roadmapName   = slug ? (ROADMAP_NAMES[slug] ?? slug) : null
  const stepNumber    = roadmapProgress ? roadmapProgress.completedIds.length + 1 : 1
  const habitPct      = habitTotal > 0 ? Math.round((habitDone / habitTotal) * 100) : 0
  const allHabitsDone = habitTotal > 0 && habitDone >= habitTotal

  const safeLevel    = (profile?.level && LEVEL_METADATA[profile.level]) ? profile.level : 'intern'
  const levelMeta    = LEVEL_METADATA[safeLevel]
  const streak       = profile?.streak_current ?? 0

  const allLoaded = roadmapLoaded && habitsLoaded && communityLoaded

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar profile={profile} onSignOut={signOut} />

      <main className="flex-1 lg:pl-64 pb-20 lg:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-0 md:py-8 md:px-8">

          {/* Dark greeting header */}
          <div
            className="rounded-none md:rounded-2xl px-6 py-8 mb-6 md:mb-6"
            style={{ background: '#18181B' }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-white mb-3 leading-snug"
            >
              {getGreeting(profile?.full_name ?? null)}
            </motion.h1>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Level badge */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
                <span>{levelMeta.icon}</span>
                <span>{levelMeta.label}</span>
              </span>
              {/* Streak pill */}
              {streak > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFEDD5] text-[#EA580C] text-xs font-bold">
                  🔥 {streak}d
                </span>
              )}
            </div>
          </div>

          <div className="px-0 space-y-4 md:space-y-4 px-4 md:px-0">
            {!allLoaded ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                {/* THE ONE THING card */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 * 0.08 }}
                  className="bg-white rounded-2xl border border-[#F4F4F5] p-5"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-3">
                    The One Thing
                  </p>
                  {slug && roadmapName ? (
                    <>
                      <p className="text-sm font-semibold text-[#3F3F46] mb-1">
                        Your {roadmapName} roadmap
                      </p>
                      <p className="text-xl font-bold text-[#18181B] mb-4">
                        Step {stepNumber} is waiting
                      </p>
                      <Link href={`/roadmaps/${slug}`}>
                        <button className="px-4 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-semibold hover:bg-[#6D28D9] transition-colors">
                          Continue →
                        </button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="text-xl font-bold text-[#18181B] mb-4">
                        Pick your roadmap to get started
                      </p>
                      <Link href="/roadmaps">
                        <button className="px-4 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-semibold hover:bg-[#6D28D9] transition-colors">
                          Pick your roadmap →
                        </button>
                      </Link>
                    </>
                  )}
                </motion.div>

                {/* TODAY'S HABITS card */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 * 0.08 }}
                  className="bg-white rounded-2xl border border-[#F4F4F5] p-5"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-3">
                    Today&apos;s Habits
                  </p>
                  {habitTotal === 0 ? (
                    <p className="text-sm text-[#71717A] mb-4">No habits set up yet.</p>
                  ) : allHabitsDone ? (
                    <p className="text-xl font-bold text-[#16A34A] mb-4">All done today! 👑</p>
                  ) : (
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-1">
                        <p className="text-xl font-bold text-[#18181B]">
                          {habitDone} of {habitTotal} habits done today
                        </p>
                      </div>
                      <ProgressRing pct={habitPct} />
                    </div>
                  )}
                  <Link href="/habits">
                    <button className="text-sm font-semibold text-[#7C3AED] hover:underline">
                      Check habits →
                    </button>
                  </Link>
                </motion.div>

                {/* COMMUNITY WIN card */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2 * 0.08 }}
                  className="bg-white rounded-2xl border border-[#F4F4F5] p-5"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-3">
                    Community Win
                  </p>
                  {communityWin ? (
                    <>
                      <p className="text-sm text-[#3F3F46] leading-relaxed mb-3 italic">
                        &ldquo;{communityWin.content.length > 120
                          ? communityWin.content.slice(0, 120) + '…'
                          : communityWin.content}&rdquo;
                      </p>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs font-semibold text-[#18181B]">
                          {communityWin.author_name ?? 'A member'}
                        </span>
                        {communityWin.author_level && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#EDE9FE] text-[#6D28D9] font-semibold">
                            {communityWin.author_level}
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-[#71717A] mb-4">No wins shared yet. Be the first!</p>
                  )}
                  <Link href="/community">
                    <button className="text-sm font-semibold text-[#7C3AED] hover:underline">
                      See all wins →
                    </button>
                  </Link>
                </motion.div>
              </>
            )}

            {/* Motivational quote */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 * 0.08 }}
              className="py-6 text-center"
            >
              <p className="text-sm text-[#71717A] italic leading-relaxed max-w-sm mx-auto">
                &ldquo;{quote}&rdquo;
              </p>
            </motion.div>
          </div>

        </div>
      </main>

      <MobileNav />
    </div>
  )
}
