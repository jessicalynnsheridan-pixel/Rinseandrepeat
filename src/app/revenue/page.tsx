'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, Target, Plus, ArrowUpRight } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { Sidebar } from '@/components/navigation/Sidebar'
import { MobileNav } from '@/components/navigation/MobileNav'
import { useUser } from '@/components/providers/UserProvider'

type Period = 'week' | 'month' | 'year'

const MOCK_REVENUE = {
  week: { total: 1240, goal: 2000, change: 18, entries: [
    { id: '1', source: 'Shopify Sales', amount: 640, date: 'Mon', category: 'product' },
    { id: '2', source: 'Digital Download', amount: 300, date: 'Wed', category: 'digital' },
    { id: '3', source: 'Coaching Call', amount: 300, date: 'Thu', category: 'service' },
  ]},
  month: { total: 5800, goal: 8000, change: 32, entries: [
    { id: '1', source: 'Shopify Sales', amount: 2800, date: 'Week 1-2', category: 'product' },
    { id: '2', source: 'Digital Products', amount: 1400, date: 'Week 2-3', category: 'digital' },
    { id: '3', source: 'Coaching', amount: 900, date: 'Week 3', category: 'service' },
    { id: '4', source: 'Affiliate Income', amount: 700, date: 'Week 4', category: 'affiliate' },
  ]},
  year: { total: 48200, goal: 100000, change: 67, entries: [
    { id: '1', source: 'Shopify Sales', amount: 22000, date: 'Jan–May', category: 'product' },
    { id: '2', source: 'Digital Products', amount: 13800, date: 'Jan–May', category: 'digital' },
    { id: '3', source: 'Coaching', amount: 8400, date: 'Jan–May', category: 'service' },
    { id: '4', source: 'Affiliate', amount: 4000, date: 'Jan–May', category: 'affiliate' },
  ]},
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
  service: 'Service/Coaching',
  affiliate: 'Affiliate',
}

export default function RevenuePage() {
  const { profile, signOut } = useUser()
  const [period, setPeriod] = useState<Period>('month')
  const [showAdd, setShowAdd] = useState(false)
  const [newEntry, setNewEntry] = useState({ source: '', amount: '', category: 'product' })
  const [revenueData, setRevenueData] = useState(MOCK_REVENUE)

  const data = revenueData[period]
  const progressPct = Math.min(100, Math.round((data.total / data.goal) * 100))

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
              <p className="text-2xl font-display font-semibold text-[#18181B]">{formatCurrency(data.total)}</p>
              <p className={cn('text-xs mt-1 flex items-center gap-0.5', data.change >= 0 ? 'text-[#16A34A]' : 'text-[#D95B5B]')}>
                {data.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {data.change >= 0 ? '+' : ''}{data.change}% vs last {period}
              </p>
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
                    onClick={() => {
                      if (!newEntry.source || !newEntry.amount) return
                      const entry = {
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
                          total: prev[period].total + entry.amount,
                          entries: [entry, ...prev[period].entries],
                        },
                      }))
                      setNewEntry({ source: '', amount: '', category: 'product' })
                      setShowAdd(false)
                    }}
                    disabled={!newEntry.source || !newEntry.amount}
                    className="btn-primary flex-1 text-sm py-2"
                  >
                    Save Entry
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Entries */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#A1A1AA] mb-4">Income Breakdown</p>
            <div className="space-y-3">
              {data.entries.map((entry, i) => {
                const pct = Math.round((entry.amount / data.total) * 100)
                return (
                  <div key={entry.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[entry.category] }} />
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
                        style={{ backgroundColor: CATEGORY_COLORS[entry.category] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

        </div>
      </main>

      <MobileNav />
    </div>
  )
}
