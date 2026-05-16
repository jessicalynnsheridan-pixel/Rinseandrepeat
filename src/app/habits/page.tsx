'use client'


import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Flame, Check, X, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sidebar } from '@/components/navigation/Sidebar'
import { MobileNav } from '@/components/navigation/MobileNav'
import { useUser } from '@/components/providers/UserProvider'

const TODAY_INDEX = (new Date().getDay() + 6) % 7

interface Habit {
  id: string
  name: string
  streak: number
  completedToday: boolean
  weekHistory: boolean[]
}

const INITIAL_HABITS: Habit[] = [
  { id: '1', name: 'Post on Instagram', streak: 7, completedToday: false, weekHistory: [true, true, true, true, true, false, false] },
  { id: '2', name: 'Learn for 30 min', streak: 12, completedToday: false, weekHistory: [true, true, false, true, true, false, false] },
  { id: '3', name: 'Client outreach', streak: 5, completedToday: false, weekHistory: [true, false, true, true, true, false, false] },
  { id: '4', name: 'Workout', streak: 3, completedToday: false, weekHistory: [false, true, true, false, true, false, false] },
  { id: '5', name: 'Journal', streak: 9, completedToday: false, weekHistory: [true, true, true, true, false, false, false] },
]

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

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
  const { profile, signOut } = useUser()
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS)
  const [showAdd, setShowAdd] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const weekDates = getWeekDates()
  const completedToday = habits.filter(h => h.completedToday).length
  const total = habits.length
  const pct = total > 0 ? Math.round((completedToday / total) * 100) : 0

  function toggleHabit(id: string) {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h
      const next = !h.completedToday
      const history = [...h.weekHistory]
      history[TODAY_INDEX] = next
      return { ...h, completedToday: next, streak: next ? h.streak + 1 : Math.max(0, h.streak - 1), weekHistory: history }
    }))
  }

  function addHabit() {
    if (!newHabitName.trim()) return
    setHabits(prev => [...prev, {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      streak: 0,
      completedToday: false,
      weekHistory: Array(7).fill(false),
    }])
    setNewHabitName('')
    setShowAdd(false)
  }

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

          {/* Progress ring card */}
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

                    {/* Streak */}
                    {habit.streak > 1 && (
                      <div className="flex items-center gap-1 text-[#A1A1AA]">
                        <Flame className="w-3 h-3" strokeWidth={1.5} />
                        <span className="text-[10px] font-medium">{habit.streak}</span>
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
                            onClick={() => { setHabits(p => p.filter(h => h.id !== habit.id)); setDeletingId(null) }}
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
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newHabitName}
                    onChange={e => setNewHabitName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addHabit()}
                    placeholder="New habit name..."
                    className="flex-1 text-sm text-[#18181B] placeholder:text-[#A1A1AA] bg-transparent outline-none"
                    autoFocus
                  />
                  <button
                    onClick={addHabit}
                    disabled={!newHabitName.trim()}
                    className="px-3 py-1.5 bg-[#18181B] text-white text-xs font-medium rounded-lg disabled:opacity-30 hover:bg-[#3F3F46] transition-all"
                  >
                    Add
                  </button>
                  <button onClick={() => setShowAdd(false)} className="p-1.5 text-[#A1A1AA] hover:text-[#71717A]">
                    <X className="w-4 h-4" />
                  </button>
                </div>
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

          {/* Weekly summary */}
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
                        {isFuture ? '—' : count}
                      </p>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
