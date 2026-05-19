'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Flame, Check, X, Trash2, ShieldCheck, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sidebar } from '@/components/navigation/Sidebar'
import { MobileNav } from '@/components/navigation/MobileNav'
import { useUser } from '@/components/providers/UserProvider'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { setRing } from '@/lib/rings'

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ── Business-type habit suggestions ────────────────────────────────────────

const HABIT_SUGGESTIONS: Record<string, string[]> = {
  shopify: [
    'Post one product photo to Instagram',
    'Check store analytics for 10 minutes',
    'Research one competitor product',
    'Reply to all customer DMs/emails',
    'List or update one product',
    'Write one product description',
  ],
  digital: [
    'Write 500 words of course content',
    'Post one piece of value content',
    'Engage with 10 target followers',
    'Review email list metrics',
    'Record one short video lesson',
    'Respond to one comment or DM',
  ],
  creator: [
    'Film one short-form video',
    'Write 3 content ideas',
    'Engage for 20 minutes on platform',
    'Post one piece of content',
    'Respond to all comments',
    'Research trending sounds or formats',
  ],
  service: [
    'Reach out to one potential client',
    'Update portfolio with recent work',
    'Write one case study paragraph',
    'Post one testimonial or result',
    'Follow up with past clients',
    'Send one cold DM or email',
  ],
  affiliate: [
    'Write one product review paragraph',
    'Post one affiliate recommendation',
    'Check commission dashboard',
    'Find one new product to promote',
    'Engage with niche community',
    'Update one old post with affiliate link',
  ],
  medspa: [
    'Post a before/after or treatment photo',
    'Respond to all booking inquiries',
    'Research one new treatment trend',
    'Follow up with past clients',
    'Update Google Business profile',
    'Post one educational health tip',
  ],
  default: [
    'Review daily goals for 5 minutes',
    'Read business content for 15 minutes',
    'Send one outreach message',
    'Review and update task list',
    'Post one piece of content',
    'Learn one new skill for 30 minutes',
  ],
}

// ── Types ───────────────────────────────────────────────────────────────────

interface Habit {
  id: string
  name: string
  streak: number
  completedToday: boolean
  weekHistory: boolean[]   // Mon(0)…Sun(6) for current week
  graceUsed: boolean       // ephemeral UI state, resets on reload (fine)
}

// ── Date helpers ────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

/** Returns YYYY-MM-DD strings for Mon–Sun of the current week */
function currentWeekDates(): string[] {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

function getWeekDayNumbers(): string[] {
  return currentWeekDates().map(d => {
    const [, , day] = d.split('-')
    return String(parseInt(day, 10))
  })
}

/** Compute streak by walking backwards from a reference date through a Set of completed dates */
function computeStreak(logDates: Set<string>, completedToday: boolean): number {
  const today = new Date()
  let streak = 0
  const start = new Date(today)

  // If not done today, start counting from yesterday
  if (!completedToday) start.setDate(start.getDate() - 1)

  for (let i = 0; i < 365; i++) {
    const dateStr = start.toISOString().split('T')[0]
    if (logDates.has(dateStr)) {
      streak++
      start.setDate(start.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

// ── Page ─────────────────────────────────────────────────────────────────────

// ── Shield helpers ────────────────────────────────────────────────────────────

function getShields(userId: string): number {
  try { return parseInt(localStorage.getItem(`${userId}_shields_v1`) ?? '0', 10) || 0 } catch { return 0 }
}
function setShields(userId: string, count: number) {
  try { localStorage.setItem(`${userId}_shields_v1`, String(Math.max(0, count))) } catch {}
}

export default function HabitsPage() {
  const { profile, signOut, user } = useUser()
  const supabase = createClientComponentClient()
  const TODAY_INDEX = useMemo(() => (new Date().getDay() + 6) % 7, [])

  const [habits, setHabits]         = useState<Habit[]>([])
  const [hydrated, setHydrated]     = useState(false)
  const [loading, setLoading]       = useState(true)
  const [showAdd, setShowAdd]       = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [xpBurst, setXpBurst]       = useState<{ id: string; amount: number } | null>(null)
  const [allDoneCelebrated, setAllDoneCelebrated] = useState(false)
  const [shields, setShieldsState]  = useState(0)
  const [shieldToast, setShieldToast] = useState<string | null>(null)
  const allDoneRef = useRef(false)
  const weekDayNumbers = getWeekDayNumbers()

  // Load shields from localStorage once user is known
  useEffect(() => {
    if (!user?.id) return
    setShieldsState(getShields(user.id))
  }, [user?.id])

  // ── Fetch habits + logs from Supabase ─────────────────────────────────────

  const fetchHabits = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      // 1. Fetch active habits for this user
      const { data: habitsData, error: habitsErr } = await supabase
        .from('habits')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (habitsErr) throw habitsErr

      if (!habitsData || habitsData.length === 0) {
        setHabits([])
        setHydrated(true)
        setLoading(false)
        return
      }

      // 2. Fetch last 60 days of logs (enough for streak computation + this week)
      const sixtyDaysAgo = new Date(Date.now() - 60 * 86_400_000).toISOString().split('T')[0]
      const { data: logsData } = await supabase
        .from('habit_logs')
        .select('habit_id, logged_date')
        .eq('user_id', user.id)
        .gte('logged_date', sixtyDaysAgo)

      // 3. Build a map: habitId → Set<dateStr>
      const logsByHabit = new Map<string, Set<string>>()
      for (const log of (logsData ?? [])) {
        if (!logsByHabit.has(log.habit_id)) logsByHabit.set(log.habit_id, new Set())
        logsByHabit.get(log.habit_id)!.add(log.logged_date)
      }

      const weekDates = currentWeekDates()
      const today = todayStr()

      // 4. Derive computed habit state
      const computed: Habit[] = habitsData.map(h => {
        const dates = logsByHabit.get(h.id) ?? new Set<string>()
        const completedToday = dates.has(today)
        const weekHistory = weekDates.map(d => dates.has(d))
        const streak = computeStreak(dates, completedToday)
        return { id: h.id, name: h.title, streak, completedToday, weekHistory, graceUsed: false }
      })

      setHabits(computed)
    } catch (err) {
      console.error('Failed to load habits:', err)
    } finally {
      setHydrated(true)
      setLoading(false)
    }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchHabits() }, [fetchHabits])

  // ── Toggle habit ──────────────────────────────────────────────────────────

  async function toggleHabit(id: string) {
    if (!user?.id) return
    const today = todayStr()
    const habit = habits.find(h => h.id === id)
    if (!habit) return
    const next = !habit.completedToday

    // Optimistic update
    setHabits(prev => {
      const updated = prev.map(h => {
        if (h.id !== id) return h
        const weekHistory = [...h.weekHistory]
        weekHistory[TODAY_INDEX] = next
        const newStreak = next ? h.streak + 1 : Math.max(0, h.streak - 1)
        return { ...h, completedToday: next, streak: newStreak, weekHistory }
      })

      // Award XP for completing
      if (next) {
        const newStreak = (habit.streak + 1)
        const xp = newStreak >= 7 ? 20 : 10
        void supabase.rpc('award_xp', { p_user_id: user.id, p_xp: xp })
        setXpBurst({ id, amount: xp })
        setTimeout(() => setXpBurst(null), 1800)
      }

      // Check all done → grow ring + celebrate + award shield
      const allDone = updated.length > 0 && updated.every(h => h.completedToday)
      if (allDone && !allDoneRef.current) {
        allDoneRef.current = true
        setAllDoneCelebrated(true)
        setRing(user.id, 'grow')
        setTimeout(() => setAllDoneCelebrated(false), 3000)

        // Award shield (once per day)
        try {
          const shieldEarnedKey = `${user.id}_shield_earned_${todayStr()}`
          if (!localStorage.getItem(shieldEarnedKey)) {
            localStorage.setItem(shieldEarnedKey, '1')
            const current = getShields(user.id)
            const next = current + 1
            setShields(user.id, next)
            setShieldsState(next)
            setShieldToast('+1 🛡️ Shield earned!')
            setTimeout(() => setShieldToast(null), 3000)
          }
        } catch { /* ignore */ }
      } else if (!allDone) {
        allDoneRef.current = false
      }

      return updated
    })

    // Persist to Supabase
    if (next) {
      await supabase.from('habit_logs').upsert(
        { user_id: user.id, habit_id: id, logged_date: today, count: 1 },
        { onConflict: 'user_id,habit_id,logged_date' }
      )
    } else {
      await supabase
        .from('habit_logs')
        .delete()
        .eq('user_id', user.id)
        .eq('habit_id', id)
        .eq('logged_date', today)
    }
  }

  // ── Add habit ─────────────────────────────────────────────────────────────

  async function addHabit(name?: string) {
    const habitName = (name ?? newHabitName).trim()
    if (!habitName || !user?.id) return

    // Optimistic placeholder
    const tempId = `temp_${Date.now()}`
    setHabits(prev => [...prev, {
      id: tempId,
      name: habitName,
      streak: 0,
      completedToday: false,
      weekHistory: Array(7).fill(false),
      graceUsed: false,
    }])
    setNewHabitName('')
    setShowAdd(false)

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert({ user_id: user.id, title: habitName, category: 'business', is_active: true })
        .select('id')
        .single()

      if (error) throw error

      // Replace temp ID with real UUID from DB
      setHabits(prev => prev.map(h => h.id === tempId ? { ...h, id: data.id } : h))
    } catch (err) {
      console.error('Failed to save habit:', err)
      // Rollback optimistic add
      setHabits(prev => prev.filter(h => h.id !== tempId))
    }
  }

  // ── Delete habit ──────────────────────────────────────────────────────────

  async function deleteHabit(id: string) {
    // Optimistic
    setHabits(prev => prev.filter(h => h.id !== id))
    setDeletingId(null)

    try {
      await supabase
        .from('habits')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', user!.id)
    } catch (err) {
      console.error('Failed to delete habit:', err)
      // Refetch on failure
      fetchHabits()
    }
  }

  // ── Grace day ─────────────────────────────────────────────────────────────

  async function useGraceDay(id: string) {
    if (!user?.id) return
    const today = todayStr()
    const habit = habits.find(h => h.id === id)
    if (!habit || habit.completedToday || !habit.streak) return

    // Optimistic
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h
      const weekHistory = [...h.weekHistory]
      weekHistory[TODAY_INDEX] = true
      return { ...h, completedToday: true, graceUsed: true, weekHistory }
    }))

    // Log as completed (grace day is indistinguishable in DB — streak preserved)
    await supabase.from('habit_logs').upsert(
      { user_id: user.id, habit_id: id, logged_date: today, count: 1 },
      { onConflict: 'user_id,habit_id,logged_date' }
    )
  }

  // ── Derived values ────────────────────────────────────────────────────────

  const completedToday = habits.filter(h => h.completedToday).length
  const total          = habits.length
  const pct            = total > 0 ? Math.round((completedToday / total) * 100) : 0
  const businessType   = profile?.business_type ?? 'default'
  const suggestions    = (HABIT_SUGGESTIONS[businessType] ?? HABIT_SUGGESTIONS.default).filter(
    s => !habits.some(h => h.name.toLowerCase() === s.toLowerCase())
  )

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar profile={profile} onSignOut={signOut} />

      <main className="flex-1 lg:pl-64 pb-20 lg:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-8 md:px-8">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-display font-semibold text-[#18181B] tracking-tight">Daily Habits</h1>
              {shields > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] text-[11px] font-bold">
                  <ShieldCheck className="w-3 h-3" strokeWidth={2.5} />
                  {shields}
                </span>
              )}
            </div>
            <p className="text-sm text-[#A1A1AA] mt-1">Small actions, compounded daily.</p>
          </motion.div>

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-[#F4F4F5] px-4 py-4 flex items-center gap-3 animate-pulse">
                  <div className="w-6 h-6 rounded-full bg-[#F4F4F5]" />
                  <div className="flex-1 h-4 bg-[#F4F4F5] rounded" />
                </div>
              ))}
            </div>
          )}

          {!loading && (
            <>
              {/* Progress ring — only once habits exist */}
              {habits.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                  className="bg-white rounded-2xl border border-[#F4F4F5] p-5 mb-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A1A1AA] mb-1">Today</p>
                      <p className="font-display text-2xl font-semibold text-[#18181B]">
                        {completedToday}
                        <span className="text-base font-normal text-[#A1A1AA]">/{total}</span>
                      </p>
                      <p className="text-xs text-[#A1A1AA] mt-0.5">habits completed</p>
                    </div>
                    <div className="relative w-12 h-12">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="16" fill="none" stroke="#F4F4F5" strokeWidth="3" />
                        <circle
                          cx="20" cy="20" r="16" fill="none"
                          stroke="#7C3AED" strokeWidth="3"
                          strokeDasharray={`${2 * Math.PI * 16}`}
                          strokeDashoffset={`${2 * Math.PI * 16 * (1 - pct / 100)}`}
                          strokeLinecap="round"
                          className="transition-all duration-700"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#7C3AED]">
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 w-full h-px bg-[#F4F4F5] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#7C3AED] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                    />
                  </div>

                  {/* Streak Shield strip */}
                  {completedToday === 0 && shields > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#FEF3C7] flex items-center justify-between gap-3">
                      <p className="text-xs text-[#D97706] font-medium flex-1">
                        Streak at risk today · Use a shield to protect it
                      </p>
                      <button
                        onClick={() => {
                          if (!user?.id) return
                          const newShields = shields - 1
                          setShields(user.id, newShields)
                          setShieldsState(newShields)
                          try {
                            localStorage.setItem(`${user.id}_shield_used_${todayStr()}`, '1')
                          } catch { /* ignore */ }
                          allDoneRef.current = true
                          if (user?.id) setRing(user.id, 'grow')
                          setShieldToast('Shield used! Streak protected for today 🛡️')
                          setTimeout(() => setShieldToast(null), 3000)
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FEF3C7] text-[#D97706] text-xs font-bold hover:bg-[#FDE68A] transition-colors flex-shrink-0"
                      >
                        Use Shield 🛡️
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* First-time setup: opt-out suggestion flow */}
              {habits.length === 0 && hydrated && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                  className="bg-white rounded-2xl border border-[#F4F4F5] overflow-hidden mb-5"
                >
                  <div className="px-5 pt-5 pb-4" style={{ background: 'linear-gradient(135deg, #18181B 0%, #27272A 100%)' }}>
                    <p className="text-[#A78BFA] text-[10px] font-bold uppercase tracking-widest mb-1.5">Suggested for you</p>
                    <h3 className="text-white text-base font-bold leading-snug">
                      Here are habits that work for {profile?.business_type
                        ? profile.business_type.charAt(0).toUpperCase() + profile.business_type.slice(1)
                        : 'your'} businesses.
                    </h3>
                    <p className="text-[#71717A] text-xs mt-1">Tap to add. Skip the ones that don&apos;t fit.</p>
                  </div>
                  <div className="p-4 space-y-2">
                    {suggestions.slice(0, 5).map((s, i) => (
                      <motion.div
                        key={s}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <button
                          onClick={() => addHabit(s)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#FAFAFA] hover:bg-[#EDE9FE] text-left transition-all group"
                        >
                          <div className="w-5 h-5 rounded-full border-2 border-[#D4D4D8] group-hover:border-[#7C3AED] flex items-center justify-center flex-shrink-0 transition-colors">
                            <Plus className="w-2.5 h-2.5 text-[#A1A1AA] group-hover:text-[#7C3AED] transition-colors" />
                          </div>
                          <span className="text-sm font-medium text-[#3F3F46] group-hover:text-[#18181B] transition-colors">{s}</span>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => setShowAdd(true)}
                      className="text-xs text-[#A1A1AA] hover:text-[#7C3AED] transition-colors"
                    >
                      + Add a custom habit instead
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Habit list */}
              <div className="space-y-2 mb-4">
                <AnimatePresence initial={false}>
                  {habits.map((habit, i) => (
                    <motion.div
                      key={habit.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-white rounded-2xl border border-[#F4F4F5] px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        {/* Check */}
                        <button
                          onClick={() => toggleHabit(habit.id)}
                          className={cn(
                            'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                            habit.completedToday
                              ? 'bg-[#7C3AED] border-[#7C3AED]'
                              : 'border-[#D1D0CC] hover:border-[#A1A1AA]'
                          )}
                        >
                          {habit.completedToday && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </button>

                        {/* Name */}
                        <span className={cn(
                          'text-sm flex-1',
                          habit.completedToday ? 'text-[#A1A1AA] line-through' : 'text-[#18181B] font-medium'
                        )}>
                          {habit.name}
                        </span>

                        {/* Grace day button */}
                        {!habit.completedToday && habit.streak >= 3 && !habit.graceUsed && (
                          <button
                            onClick={() => useGraceDay(habit.id)}
                            title="Use a grace day to protect your streak"
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FEF3C7] text-[#D97706] text-[10px] font-bold hover:bg-[#FDE68A] transition-colors flex-shrink-0"
                          >
                            <ShieldCheck className="w-2.5 h-2.5" strokeWidth={2.5} />
                            Grace
                          </button>
                        )}

                        {/* Streak */}
                        {habit.streak > 1 && (
                          <div className={cn(
                            'flex items-center gap-1',
                            habit.graceUsed ? 'text-[#D97706]' : 'text-[#E5974A]'
                          )}>
                            <Flame className="w-3 h-3" strokeWidth={1.5} />
                            <span className="text-[10px] font-semibold">{habit.streak}</span>
                            {habit.graceUsed && <span className="text-[8px] opacity-60">🛡️</span>}
                          </div>
                        )}

                        {/* Week dots */}
                        <div className="hidden sm:flex items-center gap-0.5 ml-1">
                          {WEEK_LABELS.map((_, idx) => {
                            const done   = idx === TODAY_INDEX ? habit.completedToday : habit.weekHistory[idx]
                            const future = idx > TODAY_INDEX
                            return (
                              <div
                                key={idx}
                                title={`${WEEK_LABELS[idx]} ${weekDayNumbers[idx]}`}
                                className={cn(
                                  'w-2 h-2 rounded-full transition-all',
                                  future        ? 'bg-[#FAFAFA]' :
                                  done          ? 'bg-[#7C3AED]' :
                                  idx === TODAY_INDEX ? 'bg-[#F4F4F5] ring-1 ring-[#A1A1AA] ring-offset-1' :
                                  'bg-[#F4F4F5]'
                                )}
                              />
                            )
                          })}
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => setDeletingId(deletingId === habit.id ? null : habit.id)}
                          className="p-1 text-[#E4E4E7] hover:text-[#A1A1AA] transition-colors ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Delete confirm */}
                      <AnimatePresence>
                        {deletingId === habit.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-[#FAFAFA] flex items-center justify-between"
                          >
                            <p className="text-xs text-[#A1A1AA]">Remove this habit?</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setDeletingId(null)}
                                className="text-xs px-3 py-1 rounded-lg border border-[#E4E4E7] text-[#71717A] hover:bg-[#EDE9FE] transition-all"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => deleteHabit(habit.id)}
                                className="text-xs px-3 py-1 rounded-lg bg-[#18181B] text-white hover:bg-[#3F3F46] transition-all"
                              >
                                Remove
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Add habit input */}
              <AnimatePresence>
                {showAdd ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="bg-white rounded-2xl border border-[#F4F4F5] p-4 mb-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="text"
                        value={newHabitName}
                        onChange={e => setNewHabitName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addHabit()}
                        placeholder="Name your habit..."
                        className="flex-1 text-sm text-[#18181B] placeholder:text-[#A1A1AA] bg-transparent outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => addHabit()}
                        disabled={!newHabitName.trim()}
                        className="px-3 py-1.5 bg-[#18181B] text-white text-xs font-medium rounded-lg disabled:opacity-30 hover:bg-[#3F3F46] transition-all"
                      >
                        Add
                      </button>
                      <button onClick={() => setShowAdd(false)} className="p-1.5 text-[#A1A1AA] hover:text-[#71717A]">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {suggestions.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A1A1AA] mb-2">
                          Suggested for you
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {suggestions.slice(0, 5).map(s => (
                            <button
                              key={s}
                              onClick={() => addHabit(s)}
                              className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#EDE9FE] text-[#5B21B6] hover:bg-[#DDD6FE] transition-colors"
                            >
                              + {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.button
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    onClick={() => setShowAdd(true)}
                    className="w-full py-3 rounded-2xl border border-dashed border-[#D1D0CC] text-[#A1A1AA] text-sm flex items-center justify-center gap-2 hover:border-[#A1A1AA] hover:text-[#71717A] hover:bg-white transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add habit
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Weekly summary */}
              {habits.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl border border-[#F4F4F5] p-5 mt-5"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A1A1AA] mb-4">This week</p>
                  <div className="grid grid-cols-7 gap-1">
                    {WEEK_LABELS.map((day, i) => {
                      const count  = habits.filter(h => i === TODAY_INDEX ? h.completedToday : h.weekHistory[i]).length
                      const future = i > TODAY_INDEX
                      return (
                        <div key={i} className="text-center">
                          <p className={cn('text-[10px] font-medium mb-1.5', i === TODAY_INDEX ? 'text-[#7C3AED]' : 'text-[#A1A1AA]')}>
                            {day.slice(0, 1)}
                          </p>
                          <p className={cn('text-xs font-semibold', future ? 'text-[#E4E4E7]' : 'text-[#18181B]')}>
                            {future ? '–' : count}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </>
          )}

        </div>
      </main>

      {/* +XP burst toast */}
      <AnimatePresence>
        {xpBurst && (
          <motion.div
            key={xpBurst.id}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed bottom-24 lg:bottom-8 right-6 z-50 pointer-events-none"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#7C3AED] text-white shadow-lg text-sm font-bold">
              <Sparkles className="w-4 h-4" />
              +{xpBurst.amount} XP
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shield toast */}
      <AnimatePresence>
        {shieldToast && (
          <motion.div
            key="shield-toast"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed bottom-36 lg:bottom-16 right-6 z-50 pointer-events-none"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#D97706] text-white shadow-lg text-sm font-bold">
              <ShieldCheck className="w-4 h-4" />
              {shieldToast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All done celebration banner */}
      <AnimatePresence>
        {allDoneCelebrated && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[#18181B] text-white shadow-2xl whitespace-nowrap">
              <span className="text-xl">👑</span>
              <div>
                <p className="text-sm font-bold">All habits done!</p>
                <p className="text-xs text-[#A1A1AA]">Grow ring earned · You showed up today</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileNav />
    </div>
  )
}
