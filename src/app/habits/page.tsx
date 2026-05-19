'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Flame, Check, X, Trash2, Target, ShieldCheck, Sparkles } from 'lucide-react'
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

// ── Habit interface ─────────────────────────────────────────────────────────

interface Habit {
  id: string
  name: string
  streak: number
  completedToday: boolean
  lastCompletedDate: string | null  // 'YYYY-MM-DD' - used to detect new day & streak
  weekHistory: boolean[]  // 7 booleans, Mon–Sun for current week
  graceUsed?: boolean     // true if grace day was used today
}

// Storage key is scoped to the user  -  different users never share habit data
const habitsKey = (userId: string) => `${userId}_habits_v1`

function todayDateStr(): string {
  return new Date().toISOString().split('T')[0]
}

// Called on load: reset completedToday for any habit whose lastCompletedDate
// is not today, and fix streaks for habits where a day was missed.
function resetHabitsForNewDay(habits: Habit[]): Habit[] {
  const today = todayDateStr()
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  return habits.map(h => {
    // Already up to date
    if (h.lastCompletedDate === today) return h

    // If never completed or completed more than 1 day ago — streak broken
    const streakBroken = h.lastCompletedDate !== yesterday

    const todayIndex = (new Date().getDay() + 6) % 7
    const newWeekHistory = [...h.weekHistory]

    // If it's a new week (Mon), reset the full week history
    if (todayIndex === 0) {
      newWeekHistory.fill(false)
    }

    return {
      ...h,
      completedToday: false,
      graceUsed: false,
      weekHistory: newWeekHistory,
      streak: streakBroken && h.lastCompletedDate !== null ? 0 : h.streak,
    }
  })
}

function getWeekDates(): string[] {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  return WEEK_LABELS.map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.getDate().toString()
  })
}

export default function HabitsPage() {
  const { profile, signOut, user } = useUser()
  const supabase = createClientComponentClient()
  const TODAY_INDEX = useMemo(() => (new Date().getDay() + 6) % 7, [])

  // Start with empty  -  loaded from user-specific localStorage once userId is known
  const [habits, setHabits] = useState<Habit[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [xpBurst, setXpBurst] = useState<{ id: string; amount: number } | null>(null)
  const [allDoneCelebrated, setAllDoneCelebrated] = useState(false)
  const allDoneRef = useRef(false)

  const weekDates = getWeekDates()
  const isSaving = useRef(false)

  // Load saved habits once we have the user ID, then reset for new day
  useEffect(() => {
    if (!user?.id) return
    try {
      const raw = localStorage.getItem(habitsKey(user.id))
      if (raw) {
        const loaded = JSON.parse(raw) as Habit[]
        // Reset completedToday / streaks for habits not touched today
        setHabits(resetHabitsForNewDay(loaded))
      }
    } catch {
      // Private mode or storage blocked  -  start fresh, that's fine
    }
    setHydrated(true)
  }, [user?.id])

  // Persist any habit change back to user-specific localStorage
  useEffect(() => {
    if (!user?.id || !hydrated) return
    try {
      localStorage.setItem(habitsKey(user.id), JSON.stringify(habits))
    } catch {
      // ignore
    }
  }, [habits, user?.id, hydrated])

  const completedToday = habits.filter(h => h.completedToday).length
  const total = habits.length
  const pct = total > 0 ? Math.round((completedToday / total) * 100) : 0

  function toggleHabit(id: string) {
    const today = todayDateStr()
    setHabits(prev => {
      const updated = prev.map(h => {
        if (h.id !== id) return h
        const next = !h.completedToday
        const history = [...h.weekHistory]
        history[TODAY_INDEX] = next

        let newStreak = h.streak
        if (next) {
          if (h.lastCompletedDate !== today) newStreak = h.streak + 1
        } else {
          if (h.lastCompletedDate === today) newStreak = Math.max(0, h.streak - 1)
        }

        // Award XP for completing (not unchecking)
        if (next && user?.id) {
          const xp = newStreak >= 7 ? 20 : 10 // bonus XP for 7+ day streaks
          void supabase.rpc('award_xp', { p_user_id: user.id, p_xp: xp })
          setXpBurst({ id, amount: xp })
          setTimeout(() => setXpBurst(null), 1800)
        }

        return {
          ...h,
          completedToday: next,
          lastCompletedDate: next ? today : h.lastCompletedDate,
          streak: newStreak,
          weekHistory: history,
        }
      })

      // Check if all habits are now done → set grow ring + celebrate
      const allDone = updated.length > 0 && updated.every(h => h.completedToday)
      if (allDone && !allDoneRef.current && user?.id) {
        allDoneRef.current = true
        setAllDoneCelebrated(true)
        setRing(user.id, 'grow')
        setTimeout(() => setAllDoneCelebrated(false), 3000)
      } else if (!allDone) {
        allDoneRef.current = false
      }

      return updated
    })
  }

  function addHabit(name?: string) {
    const habitName = (name ?? newHabitName).trim()
    if (!habitName) return
    setHabits(prev => [...prev, {
      id: Date.now().toString(),
      name: habitName,
      streak: 0,
      completedToday: false,
      lastCompletedDate: null,
      weekHistory: Array(7).fill(false),
    }])
    setNewHabitName('')
    setShowAdd(false)
  }

  function useGraceDay(id: string) {
    const today = todayDateStr()
    setHabits(prev => prev.map(h => {
      if (h.id !== id || h.completedToday || !h.streak) return h
      const history = [...h.weekHistory]
      history[TODAY_INDEX] = true
      return { ...h, completedToday: true, graceUsed: true, lastCompletedDate: today, weekHistory: history }
    }))
  }

  // Suggestions for this user's business type (falls back to default)
  const businessType = profile?.business_type ?? 'default'
  const suggestions = (HABIT_SUGGESTIONS[businessType] ?? HABIT_SUGGESTIONS.default).filter(
    s => !habits.some(h => h.name.toLowerCase() === s.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar profile={profile} onSignOut={signOut} />

      <main className="flex-1 lg:pl-64 pb-20 lg:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-8 md:px-8">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-xl font-display font-semibold text-[#18181B] tracking-tight">Daily Habits</h1>
            <p className="text-sm text-[#A1A1AA] mt-1">Small actions, compounded daily.</p>
          </motion.div>

          {/* Progress ring  -  only shown once the user has habits */}
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
                  Here are habits that work for {profile?.business_type ? profile.business_type.charAt(0).toUpperCase() + profile.business_type.slice(1) : 'your'} businesses.
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
                    className="flex items-center gap-3"
                  >
                    <button
                      onClick={() => addHabit(s)}
                      className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-[#FAFAFA] hover:bg-[#EDE9FE] text-left transition-all group"
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

                    {/* Grace day button  -  shown when streak at risk */}
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

                    {/* Streak  -  only show once they've built one */}
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
                        const done = idx === TODAY_INDEX ? habit.completedToday : habit.weekHistory[idx]
                        const future = idx > TODAY_INDEX
                        return (
                          <div
                            key={idx}
                            title={`${WEEK_LABELS[idx]} ${weekDates[idx]}`}
                            className={cn(
                              'w-2 h-2 rounded-full transition-all',
                              future ? 'bg-[#FAFAFA]' :
                              done ? 'bg-[#7C3AED]' :
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
                            onClick={() => {
                              setHabits(p => p.filter(h => h.id !== habit.id))
                              setDeletingId(null)
                            }}
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

          {/* Add habit */}
          <AnimatePresence>
            {showAdd ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="bg-white rounded-2xl border border-[#F4F4F5] p-4 mb-4"
              >
                {/* Input row */}
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

                {/* Quick suggestions */}
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
              <button
                onClick={() => setShowAdd(true)}
                className="w-full py-3 rounded-2xl border border-dashed border-[#D1D0CC] text-[#A1A1AA] text-sm flex items-center justify-center gap-2 hover:border-[#A1A1AA] hover:text-[#71717A] hover:bg-white transition-all"
              >
                <Plus className="w-4 h-4" />
                Add habit
              </button>
            )}
          </AnimatePresence>

          {/* Weekly summary  -  only shown once habits exist */}
          {habits.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-[#F4F4F5] p-5 mt-5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A1A1AA] mb-4">This week</p>
              <div className="grid grid-cols-7 gap-1">
                {WEEK_LABELS.map((day, i) => {
                  const count = habits.filter(h => i === TODAY_INDEX ? h.completedToday : h.weekHistory[i]).length
                  const isFuture = i > TODAY_INDEX
                  return (
                    <div key={i} className="text-center">
                      <p className={cn('text-[10px] font-medium mb-1.5', i === TODAY_INDEX ? 'text-[#7C3AED]' : 'text-[#A1A1AA]')}>
                        {day.slice(0, 1)}
                      </p>
                      <p className={cn('text-xs font-semibold', isFuture ? 'text-[#E4E4E7]' : 'text-[#18181B]')}>
                        {isFuture ? ' - ' : count}
                      </p>
                    </div>
                  )
                })}
              </div>
            </motion.div>
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
