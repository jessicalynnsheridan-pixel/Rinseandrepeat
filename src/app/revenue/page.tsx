'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ReceiptText, Loader2, TrendingUp, ArrowRight } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { Sidebar } from '@/components/navigation/Sidebar'
import { MobileNav } from '@/components/navigation/MobileNav'
import { useUser } from '@/components/providers/UserProvider'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { setRing } from '@/lib/rings'
import { useRouter } from 'next/navigation'

type Period = 'week' | 'month' | 'year'

interface Entry {
  id: string
  source: string
  amount: number
  logged_date: string   // 'YYYY-MM-DD'
  category: string      // stored in notes field in DB
}

// ── Revenue Celebration Modal ────────────────────────────────────────────────

function RevenueCelebration({ amount, onDone }: { amount: number; onDone: () => void }) {
  const particles = [
    { x: 10, color: '#7C3AED', delay: 0 },
    { x: 25, color: '#16A34A', delay: 0.08 },
    { x: 40, color: '#F97316', delay: 0.04 },
    { x: 55, color: '#FFD700', delay: 0.12 },
    { x: 70, color: '#E8B4B8', delay: 0.06 },
    { x: 85, color: '#7C3AED', delay: 0.15 },
    { x: 18, color: '#F97316', delay: 0.2 },
    { x: 48, color: '#16A34A', delay: 0.1 },
    { x: 75, color: '#FFD700', delay: 0.18 },
    { x: 92, color: '#7C3AED', delay: 0.22 },
  ]

  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onDone}
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            initial={{ y: '-5vh', x: `${p.x}vw`, opacity: 1 }}
            animate={{ y: '110vh', opacity: 0 }}
            transition={{ duration: 2.5, delay: p.delay, ease: [0.2, 0.8, 0.9, 1] }}
            className="absolute w-2 h-1 rounded-sm"
            style={{ backgroundColor: p.color }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 20 }}
        className="relative bg-white rounded-3xl shadow-2xl p-8 text-center max-w-xs w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{ delay: 0.1, duration: 0.5, times: [0, 0.6, 1] }}
          className="w-16 h-16 rounded-2xl bg-[#DCFCE7] flex items-center justify-center mx-auto mb-4"
        >
          <span className="text-3xl">💰</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[#16A34A] mb-1">Money In 🎉</p>
          <p className="text-4xl font-bold text-[#18181B] mb-2">
            +{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)}
          </p>
          <p className="text-sm text-[#71717A]">Every dollar counts. Keep stacking.</p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onDone}
          className="mt-5 text-xs text-[#A1A1AA] hover:text-[#71717A] transition-colors"
        >
          Tap to dismiss
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// ── Milestone System ─────────────────────────────────────────────────────────

const MILESTONES = [1, 100, 500, 1000, 5000, 10000, 50000, 100000]

const MILESTONE_LABELS: Record<number, string> = {
  1:      'First Dollar 🎉',
  100:    'First $100 💪',
  500:    '$500 Club 🔥',
  1000:   'Four Figures 💎',
  5000:   '$5K Milestone 👑',
  10000:  'Five Figures 🏆',
  50000:  '$50K Club 🌟',
  100000: 'Six Figures Legend 💫',
}

const MILESTONE_XP: Record<number, number> = {
  1:      50,
  100:    100,
  500:    150,
  1000:   200,
  5000:   300,
  10000:  500,
  50000:  500,
  100000: 500,
}

function getMilestoneCrossed(userId: string): number[] {
  try {
    const raw = localStorage.getItem(`${userId}_rev_milestones_v1`)
    return raw ? (JSON.parse(raw) as number[]) : []
  } catch { return [] }
}

function saveMilestoneCrossed(userId: string, crossed: number[]) {
  try {
    localStorage.setItem(`${userId}_rev_milestones_v1`, JSON.stringify(crossed))
  } catch {}
}

function MilestoneCelebration({ milestone, onShare, onDone }: {
  milestone: number
  onShare: () => void
  onDone: () => void
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 8000)
    return () => clearTimeout(t)
  }, [onDone])

  const xp = MILESTONE_XP[milestone] ?? 50
  const label = MILESTONE_LABELS[milestone] ?? `$${milestone.toLocaleString()}`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onDone}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 20 }}
        className="relative bg-white rounded-3xl shadow-2xl p-8 text-center max-w-xs w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{ delay: 0.1, duration: 0.5, times: [0, 0.6, 1] }}
          className="text-5xl mb-4"
        >
          👑
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[#7C3AED] mb-2">Milestone Unlocked</p>
          <p className="text-2xl font-bold text-[#18181B] mb-2">{label}</p>
          <p className="text-sm text-[#71717A] mb-1">You&apos;ve earned</p>
          <p className="text-lg font-bold text-[#16A34A] mb-5">+{xp} XP bonus</p>
        </motion.div>
        <div className="flex flex-col gap-2">
          <button
            onClick={onShare}
            className="w-full px-4 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-semibold hover:bg-[#6D28D9] transition-colors"
          >
            Share with community 🎉
          </button>
          <button
            onClick={onDone}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E4E4E7] text-[#71717A] text-sm font-medium hover:bg-[#F4F4F5] transition-colors"
          >
            Keep going →
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  product:   '#7C3AED',
  digital:   '#16A34A',
  service:   '#E5974A',
  affiliate: '#C89070',
}

const CATEGORY_LABELS: Record<string, string> = {
  product:   'Physical Product',
  digital:   'Digital Product',
  service:   'Service / Coaching',
  affiliate: 'Affiliate',
}

// ── Period helpers ───────────────────────────────────────────────────────────

function periodStart(period: Period): string {
  const today = new Date()
  if (period === 'week') {
    const d = new Date(today)
    d.setDate(today.getDate() - ((today.getDay() + 6) % 7)) // Monday
    return d.toISOString().split('T')[0]
  }
  if (period === 'month') {
    return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  }
  return new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0]
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Goal defaults per period — stored in localStorage (display preference only)
const GOAL_DEFAULTS: Record<Period, number> = { week: 1000, month: 5000, year: 50000 }
const goalsKey = (uid: string) => `${uid}_revenue_goals_v2`

// ── Page ─────────────────────────────────────────────────────────────────────

export default function RevenuePage() {
  const { profile, signOut, user } = useUser()
  const supabase = createClientComponentClient()
  const router = useRouter()

  const [period, setPeriod]   = useState<Period>('month')
  const [entries, setEntries] = useState<Entry[]>([])
  const [goals, setGoals]     = useState<Record<Period, number>>(GOAL_DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newEntry, setNewEntry] = useState({ source: '', amount: '', category: 'service' })
  const [saving, setSaving]   = useState(false)
  const [celebrationAmount, setCelebrationAmount] = useState<number | null>(null)
  const [allTimeTotal, setAllTimeTotal] = useState(0)
  const [celebrationMilestone, setCelebrationMilestone] = useState<number | null>(null)

  // ── Load goals from localStorage (just a display preference) ──────────────
  useEffect(() => {
    if (!user?.id) return
    try {
      const raw = localStorage.getItem(goalsKey(user.id))
      if (raw) setGoals(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [user?.id])

  // ── Fetch all revenue logs from Supabase ──────────────────────────────────
  const fetchRevenue = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      // Fetch the whole current year so period filters work client-side instantly
      const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
      const [yearResult, allTimeResult] = await Promise.all([
        supabase
          .from('revenue_logs')
          .select('id, source, amount, notes, logged_date')
          .eq('user_id', user.id)
          .gte('logged_date', yearStart)
          .order('logged_date', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase
          .from('revenue_logs')
          .select('amount')
          .eq('user_id', user.id),
      ])

      if (yearResult.error) throw yearResult.error

      setEntries(
        (yearResult.data ?? []).map(row => ({
          id:          row.id,
          source:      row.source ?? '',
          amount:      parseFloat(row.amount),
          logged_date: row.logged_date,
          category:    row.notes ?? 'service',
        }))
      )

      const allTime = (allTimeResult.data ?? []).reduce((sum, r) => sum + parseFloat(r.amount), 0)
      setAllTimeTotal(allTime)
    } catch (err) {
      console.error('Failed to load revenue:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchRevenue() }, [fetchRevenue])

  // ── Derived: entries filtered to selected period ──────────────────────────
  const start   = periodStart(period)
  const visible = entries.filter(e => e.logged_date >= start)
  const total   = visible.reduce((s, e) => s + e.amount, 0)
  const goal    = goals[period]
  const pct     = goal > 0 ? Math.min(100, Math.round((total / goal) * 100)) : 0

  // ── Add entry ─────────────────────────────────────────────────────────────
  async function addEntry() {
    if (!newEntry.source.trim() || !newEntry.amount || !user?.id || saving) return
    setSaving(true)

    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('revenue_logs')
        .insert({
          user_id:     user.id,
          source:      newEntry.source.trim(),
          amount:      parseFloat(newEntry.amount),
          notes:       newEntry.category,  // repurpose notes to store category
          logged_date: today,
        })
        .select('id, source, amount, notes, logged_date')
        .single()

      if (error) throw error

      const entry: Entry = {
        id:          data.id,
        source:      data.source ?? '',
        amount:      parseFloat(data.amount),
        logged_date: data.logged_date,
        category:    data.notes ?? 'service',
      }

      setEntries(prev => [entry, ...prev])
      const amount = parseFloat(newEntry.amount)
      setNewEntry({ source: '', amount: '', category: 'service' })
      setShowAdd(false)

      setTimeout(() => setCelebrationAmount(amount), 200)

      // Award XP + earn ring
      const xp = amount >= 1000 ? 50 : amount >= 100 ? 25 : 15
      void supabase.rpc('award_xp', { p_user_id: user.id, p_xp: xp })
      setRing(user.id, 'earn')

      // Check milestones
      const newAllTimeTotal = allTimeTotal + amount
      setAllTimeTotal(newAllTimeTotal)

      const crossedSet = new Set(getMilestoneCrossed(user.id))
      const newlyCrossed = MILESTONES.filter(m => m <= newAllTimeTotal && !crossedSet.has(m))
      if (newlyCrossed.length > 0) {
        const highest = newlyCrossed[newlyCrossed.length - 1]
        setCelebrationMilestone(highest)
        const updatedCrossed = [...Array.from(crossedSet), ...newlyCrossed]
        saveMilestoneCrossed(user.id, updatedCrossed)
        const milestoneXp = MILESTONE_XP[highest] ?? 50
        void supabase.rpc('award_xp', { p_user_id: user.id, p_xp: milestoneXp })
      }
    } catch (err) {
      console.error('Failed to save revenue entry:', err)
    } finally {
      setSaving(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  // Free-tier gate
  if (profile && profile.subscription_tier === 'free') {
    return (
      <div className="flex min-h-screen bg-[#FAFAFA]">
        <Sidebar profile={profile} onSignOut={signOut} />
        <main className="flex-1 lg:pl-64 flex items-center justify-center p-8">
          <div className="max-w-sm w-full text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EDE9FE] flex items-center justify-center mx-auto">
              <TrendingUp className="w-7 h-7 text-[#7C3AED]" />
            </div>
            <h2 className="text-xl font-bold text-[#18181B]">Revenue Tracker</h2>
            <p className="text-sm text-[#71717A] leading-relaxed">
              Track your income, log wins, and watch your CEO era unfold. Upgrade to unlock.
            </p>
            <button
              onClick={() => router.push('/pricing')}
              className="btn-primary w-full py-3"
            >
              Upgrade to unlock <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>
        <MobileNav />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <AnimatePresence>
        {celebrationAmount !== null && (
          <RevenueCelebration
            amount={celebrationAmount}
            onDone={() => setCelebrationAmount(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {celebrationMilestone !== null && (
          <MilestoneCelebration
            milestone={celebrationMilestone}
            onShare={() => {
              if (celebrationMilestone !== null) {
                const msg = `Just hit my ${MILESTONE_LABELS[celebrationMilestone]} milestone inside Rinse & Repeat CEO! 🏆 #CEOera`
                try { sessionStorage.setItem('community_prefill', msg) } catch {}
              }
              setCelebrationMilestone(null)
              router.push('/community')
            }}
            onDone={() => setCelebrationMilestone(null)}
          />
        )}
      </AnimatePresence>

      <Sidebar profile={profile} onSignOut={signOut} />

      <main className="flex-1 lg:pl-64 pb-20 lg:pb-0">
        <div className="max-w-3xl mx-auto px-4 py-8 md:px-8">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between mb-8"
          >
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
              {loading ? (
                <div className="h-8 w-24 bg-[#F4F4F5] rounded-lg animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-display font-semibold text-[#18181B]">{formatCurrency(total)}</p>
              )}
              {!loading && visible.length === 0 && (
                <p className="text-xs text-[#A1A1AA] mt-1">No income logged yet</p>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="card p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-[#A1A1AA] mb-1">Goal</p>
              <p className="text-2xl font-display font-semibold text-[#18181B]">{formatCurrency(goal)}</p>
              <div className="mt-2">
                <span className="text-xs text-[#A1A1AA]">{pct}% reached</span>
                <div className="w-full h-1.5 bg-[#F4F4F5] rounded-full overflow-hidden mt-1">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: pct >= 80 ? '#16A34A' : pct >= 50 ? '#E5974A' : '#7C3AED' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Add Entry Form */}
          <AnimatePresence>
            {showAdd && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="card p-5 mb-6"
              >
                <h3 className="text-sm font-semibold text-[#18181B] mb-4">Log Income</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-[#71717A] block mb-1">Source / Description</label>
                    <input
                      type="text"
                      value={newEntry.source}
                      onChange={e => setNewEntry(p => ({ ...p, source: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addEntry()}
                      placeholder="e.g. Shopify sale, coaching call..."
                      className="input-field"
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
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#71717A] block mb-1">Category</label>
                      <select
                        value={newEntry.category}
                        onChange={e => setNewEntry(p => ({ ...p, category: e.target.value }))}
                        className="input-field"
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
                      disabled={!newEntry.source.trim() || !newEntry.amount || saving}
                      className="btn-primary flex-1 text-sm py-2 gap-2"
                    >
                      {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                      Save Entry
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Entries / Empty / Loading */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="card p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-[#A1A1AA] mb-4">Income Breakdown</p>

            {loading ? (
              <div className="space-y-3 py-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-[#F4F4F5]" />
                    <div className="flex-1 h-4 bg-[#F4F4F5] rounded" />
                    <div className="w-16 h-4 bg-[#F4F4F5] rounded" />
                  </div>
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="py-8 text-center">
                <div className="w-10 h-10 rounded-2xl bg-[#F4F4F5] flex items-center justify-center mx-auto mb-3">
                  <ReceiptText className="w-5 h-5 text-[#A1A1AA]" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium text-[#3F3F46] mb-1">No income logged yet.</p>
                <p className="text-xs text-[#A1A1AA]">
                  Hit &ldquo;Log Income&rdquo; above every time you earn.<br />Watch your progress build from zero.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {visible.map((entry, i) => {
                  const pctBar = total > 0 ? Math.round((entry.amount / total) * 100) : 0
                  return (
                    <div key={entry.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: CATEGORY_COLORS[entry.category] ?? '#A1A1AA' }} />
                          <span className="text-sm font-medium text-[#18181B] truncate">{entry.source}</span>
                          <span className="text-xs text-[#A1A1AA] flex-shrink-0">{formatDate(entry.logged_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className="text-xs text-[#A1A1AA]">{pctBar}%</span>
                          <span className="text-sm font-semibold text-[#18181B]">{formatCurrency(entry.amount)}</span>
                        </div>
                      </div>
                      <div className="w-full h-1 bg-[#F4F4F5] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[entry.category] ?? '#A1A1AA' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pctBar}%` }}
                          transition={{ duration: 0.6, delay: i * 0.06, ease: 'easeOut' }}
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
