'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, Plus, ReceiptText } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { Sidebar } from '@/components/navigation/Sidebar'
import { MobileNav } from '@/components/navigation/MobileNav'
import { useUser } from '@/components/providers/UserProvider'

type Period = 'week' | 'month' | 'year'

interface Entry {
  id: string
  source: string
  amount: number
  date: string
  category: string
}

interface PeriodData {
  entries: Entry[]
  goal: number
}

const CATEGORY_COLORS: Record<string, string> = {
  product: '#7C3AED',
  digital: '#16A34A',
  service: '#E5974A',
  affiliate: '#C89070',
}

const CATEGORY_LABELS: Record<string, string> = {
  product: 'Physical Product',
  digital: 'Digital Product',
  service: 'Service / Coaching',
  affiliate: 'Affiliate',
}

// Storage key is scoped per user so no two accounts share revenue data
const revenueKey = (userId: string) => `${userId}_revenue_v1`

const EMPTY_PERIOD = (): PeriodData => ({ entries: [], goal: 5000 })

function loadRevenue(userId: string): Record<Period, PeriodData> {
  try {
    const raw = localStorage.getItem(revenueKey(userId))
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { week: EMPTY_PERIOD(), month: EMPTY_PERIOD(), year: { ...EMPTY_PERIOD(), goal: 50000 } }
}

export default function RevenuePage() {
  const { profile, signOut, user } = useUser()
  const [period, setPeriod] = useState<Period>('month')
  const [showAdd, setShowAdd] = useState(false)
  const [newEntry, setNewEntry] = useState({ source: '', amount: '', category: 'service' })
  const [revenueData, setRevenueData] = useState<Record<Period, PeriodData>>({
    week: EMPTY_PERIOD(),
    month: EMPTY_PERIOD(),
    year: { ...EMPTY_PERIOD(), goal: 50000 },
  })
  const [hydrated, setHydrated] = useState(false)

  // Load user's real revenue data from localStorage
  useEffect(() => {
    if (!user?.id) return
    setRevenueData(loadRevenue(user.id))
    setHydrated(true)
  }, [user?.id])

  // Persist on every change
  useEffect(() => {
    if (!user?.id || !hydrated) return
    try {
      localStorage.setItem(revenueKey(user.id), JSON.stringify(revenueData))
    } catch { /* ignore */ }
  }, [revenueData, user?.id, hydrated])

  const data = revenueData[period]
  const total = data.entries.reduce((sum, e) => sum + e.amount, 0)
  const progressPct = data.goal > 0 ? Math.min(100, Math.round((total / data.goal) * 100)) : 0

  // Simple period-over-period change placeholder (requires history we don't store yet)
  const hasEntries = data.entries.length > 0

  function addEntry() {
    if (!newEntry.source || !newEntry.amount) return
    const entry: Entry = {
      id: Date.now().toString(),
      source: newEntry.source,
      amount: parseFloat(newEntry.amount),
      date: 'Today',
      category: newEntry.category,
    }
    setRevenueData(prev => ({
      ...prev,
      [period]: {
        ...prev[period],
        entries: [entry, ...prev[period].entries],
      },
    }))
    setNewEntry({ source: '', amount: '', category: 'service' })
    setShowAdd(false)
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar profile={profile} onSignOut={signOut} />

      <main className="flex-1 lg:pl-64 pb-20 lg:pb-0">
        <div className="max-w-3xl mx-auto px-4 py-8 md:px-8">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-display font-semibold text-[#18181B] tracking-tight">Revenue</h1>
              <p className="text-sm text-[#71717A] mt-1">Track every dollar you earn.</p>
            </div>
            <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-sm gap-1.5">
              <Plus className="w-4 h-4" />
              Log Income
            </button>
          </motion.div>

          {/* Period Toggle */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
            className="flex gap-1 p-1 bg-white rounded-xl border border-[#F4F4F5] mb-6 w-fit"
          >
            {(['week', 'month', 'year'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize',
                  period === p ? 'bg-[#7C3AED] text-white' : 'text-[#71717A] hover:bg-[#EDE9FE]'
                )}
              >
                {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'This Year'}
              </button>
            ))}
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
              className="card p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-[#A1A1AA] mb-1">Total Earned</p>
              <p className="text-2xl font-display font-semibold text-[#18181B]">{formatCurrency(total)}</p>
              {!hasEntries && (
                <p className="text-xs text-[#A1A1AA] mt-1">No income logged yet</p>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="card p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-[#A1A1AA] mb-1">Goal</p>
              <p className="text-2xl font-display font-semibold text-[#18181B]">{formatCurrency(data.goal)}</p>
              <div className="mt-2">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-[#A1A1AA]">{progressPct}% reached</span>
                </div>
                <div className="w-full h-1.5 bg-[#F4F4F5] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: progressPct >= 80 ? '#16A34A' : progressPct >= 50 ? '#E5974A' : '#7C3AED' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Add Entry Form */}
          {showAdd && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-5 mb-6">
              <h3 className="text-sm font-semibold text-[#18181B] mb-4">Log Income</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[#71717A] block mb-1">Source / Description</label>
                  <input
                    type="text"
                    value={newEntry.source}
                    onChange={e => setNewEntry(p => ({ ...p, source: e.target.value }))}
                    placeholder="e.g. Shopify sale, coaching call..."
                    className="input-field text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#71717A] block mb-1">Amount ($)</label>
                    <input
                      type="number"
                      value={newEntry.amount}
                      onChange={e => setNewEntry(p => ({ ...p, amount: e.target.value }))}
                      placeholder="0"
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#71717A] block mb-1">Category</label>
                    <select
                      value={newEntry.category}
                      onChange={e => setNewEntry(p => ({ ...p, category: e.target.value }))}
                      className="input-field text-sm"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setShowAdd(false)} className="btn-outline flex-1 text-sm py-2">Cancel</button>
                  <button
                    onClick={addEntry}
                    disabled={!newEntry.source || !newEntry.amount}
                    className="btn-primary flex-1 text-sm py-2"
                  >
                    Save Entry
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Entries / Empty state */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#A1A1AA] mb-4">Income Breakdown</p>

            {!hasEntries ? (
              /* Empty state — new users always start here */
              <div className="py-8 text-center">
                <div className="w-10 h-10 rounded-2xl bg-[#F4F4F5] flex items-center justify-center mx-auto mb-3">
                  <ReceiptText className="w-5 h-5 text-[#A1A1AA]" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium text-[#3F3F46] mb-1">No income logged yet.</p>
                <p className="text-xs text-[#A1A1AA]">
                  Hit "Log Income" above every time you earn.<br />Watch your progress build from zero.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.entries.map((entry, i) => {
                  const pct = total > 0 ? Math.round((entry.amount / total) * 100) : 0
                  return (
                    <div key={entry.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[entry.category] ?? '#A1A1AA' }} />
                          <span className="text-sm font-medium text-[#18181B]">{entry.source}</span>
                          <span className="text-xs text-[#A1A1AA]">{entry.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#A1A1AA]">{pct}%</span>
                          <span className="text-sm font-semibold text-[#18181B]">{formatCurrency(entry.amount)}</span>
                        </div>
                      </div>
                      <div className="w-full h-1 bg-[#F4F4F5] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[entry.category] ?? '#A1A1AA' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>

        </div>
      </main>

      <MobileNav />
    </div>
  )
}
