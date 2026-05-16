'use client'


import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, Tag, Target, Eye, Link2, Clock,
  DollarSign, Percent, MousePointer2, Lightbulb,
  Bookmark, Check, X, BarChart3, ArrowUpRight,
  Trash2, Calculator,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sidebar } from '@/components/navigation/Sidebar'
import { MobileNav } from '@/components/navigation/MobileNav'
import { useUser } from '@/components/providers/UserProvider'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SavedCalc {
  id: string
  label: string
  summary: string
  savedAt: string
}

// ─── Formatters ──────────────────────────────────────────────────────────────

const fmt$ = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const fmtPct = (n: number) => `${n.toFixed(1)}%`
const fmtNum = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(Math.max(0, n)))

// ─── Slider ──────────────────────────────────────────────────────────────────

function Slider({
  label, value, min, max, step, onChange, format,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format: (v: number) => string;
}) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[#71717A]">{label}</span>
        <span className="text-xs font-bold text-[#18181B] tabular-nums">{format(value)}</span>
      </div>
      <div className="relative h-6 flex items-center">
        <div className="absolute inset-x-0 h-1 rounded-full bg-[#F4F4F5]" />
        <div
          className="absolute left-0 h-1 rounded-full bg-[#7C3AED] transition-all duration-75"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: 10 }}
        />
        <div
          className="absolute w-4 h-4 rounded-full bg-[#7C3AED] border-2 border-white shadow-sm pointer-events-none transition-all duration-75"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
    </div>
  )
}

// ─── Number Input ─────────────────────────────────────────────────────────────

function NumInput({
  label, value, onChange, prefix, suffix, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#71717A] mb-1.5">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#A1A1AA] pointer-events-none">{prefix}</span>
        )}
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? '0'}
          className={cn(
            'w-full rounded-xl border border-[#E4E4E7] bg-white py-2.5 text-sm text-[#18181B] placeholder:text-[#A1A1AA] outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 transition-all',
            prefix ? 'pl-7 pr-3' : suffix ? 'pl-3 pr-7' : 'px-3'
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#A1A1AA] pointer-events-none">{suffix}</span>
        )}
      </div>
    </div>
  )
}

// ─── Result Rows ──────────────────────────────────────────────────────────────

function Results({ rows }: {
  rows: { label: string; value: string; primary?: boolean; negative?: boolean }[]
}) {
  return (
    <div className="rounded-xl border border-[#F4F4F5] overflow-hidden">
      {rows.map((row, i) => (
        <div
          key={i}
          className={cn(
            'flex items-center justify-between px-4 py-2.5 text-sm',
            row.primary
              ? 'bg-[#FAFAFA] border-t border-[#F4F4F5]'
              : 'border-b border-[#FAFAFA] last:border-0',
          )}
        >
          <span className={cn('text-xs', row.primary ? 'font-semibold text-[#52525B]' : 'text-[#A1A1AA]')}>
            {row.label}
          </span>
          <span className={cn(
            'font-bold tabular-nums',
            row.primary ? 'text-sm text-[#7C3AED]' : 'text-[#18181B]',
            row.negative && 'text-[#C0392B]',
          )}>
            {row.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Founder Insight ──────────────────────────────────────────────────────────

function Insight({ text, type = 'neutral' }: {
  text: string; type?: 'positive' | 'warning' | 'neutral';
}) {
  if (!text) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      key={text}
      className={cn(
        'flex items-start gap-2.5 px-3.5 py-3 rounded-xl border text-xs leading-relaxed',
        type === 'positive' ? 'bg-[#F4FBF7] border-[#C8E6D5] text-[#2A5C3F]' :
        type === 'warning' ? 'bg-[#FEF9F0] border-[#E6C88A] text-[#6B4C1E]' :
        'bg-[#FAFAFA] border-[#E4E4E7] text-[#5C4030]'
      )}
    >
      <Lightbulb className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#A1A1AA]" />
      <span>{text}</span>
    </motion.div>
  )
}

// ─── Save Button ──────────────────────────────────────────────────────────────

function SaveButton({ onSave }: { onSave: (label: string) => void }) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (!label.trim()) return
    onSave(label.trim())
    setSaved(true)
    setLabel('')
    setOpen(false)
    setTimeout(() => setSaved(false), 3000)
  }

  if (saved) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-1.5 text-xs font-medium text-[#16A34A]"
      >
        <Check className="w-3.5 h-3.5" />
        Saved
      </motion.div>
    )
  }

  if (open) {
    return (
      <div className="flex items-center gap-2 w-full">
        <input
          autoFocus
          type="text"
          value={label}
          onChange={e => setLabel(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setOpen(false) }}
          placeholder="Label this calculation..."
          className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-[#E4E4E7] outline-none focus:border-[#7C3AED] bg-transparent placeholder:text-[#A1A1AA] min-w-0"
        />
        <button
          onClick={handleSave}
          disabled={!label.trim()}
          className="text-xs px-2.5 py-1.5 rounded-lg bg-[#7C3AED] text-white disabled:opacity-30 hover:bg-[#5B21B6] transition-colors flex-shrink-0"
        >
          Save
        </button>
        <button onClick={() => setOpen(false)} className="p-1 text-[#A1A1AA] hover:text-[#71717A] transition-colors flex-shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setOpen(true)}
      className="flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA] hover:text-[#7C3AED] transition-colors"
    >
      <Bookmark className="w-3.5 h-3.5" />
      Save
    </button>
  )
}

// ─── Calculator Card Wrapper ──────────────────────────────────────────────────

function CalcCard({
  icon: Icon, title, description, children, delay = 0,
}: {
  icon: React.ElementType; title: string; description: string;
  children: React.ReactNode; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-white rounded-2xl border border-[#F4F4F5] shadow-[0_2px_16px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col"
    >
      <div className="px-5 pt-5 pb-4 border-b border-[#FAFAFA] flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#FAFAFA] flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-[#7C3AED]" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#18181B] leading-snug">{title}</h3>
          <p className="text-[11px] text-[#A1A1AA] mt-0.5">{description}</p>
        </div>
      </div>
      <div className="p-5 flex flex-col gap-4 flex-1">
        {children}
      </div>
    </motion.div>
  )
}

// ─── 1. Profit Calculator ────────────────────────────────────────────────────

function ProfitCalc({ onSave }: { onSave: (label: string, summary: string) => void }) {
  const [revenue, setRevenue] = useState(5000)
  const [expenses, setExpenses] = useState(3000)

  const profit = revenue - expenses
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0
  const isLoss = profit < 0

  const insight = (() => {
    if (revenue === 0) return { text: '', type: 'neutral' as const }
    if (isLoss) return { text: 'You\'re operating at a loss. Identify your highest cost line and cut it before investing in growth.', type: 'warning' as const }
    if (margin < 15) return { text: 'Margins under 15% leave little room for error. Audit your expense categories or test a price increase.', type: 'warning' as const }
    if (margin < 35) return { text: 'Solid margins for early stage. Hold costs steady and focus on growing revenue — your leverage is good.', type: 'neutral' as const }
    return { text: 'Strong margins. You\'re positioned to reinvest in growth without sacrificing profitability.', type: 'positive' as const }
  })()

  return (
    <CalcCard icon={TrendingUp} title="Profit Calculator" description="Know your real take-home numbers" delay={0.05}>
      <div className="space-y-4">
        <Slider label="Monthly Revenue" value={revenue} min={0} max={50000} step={100} onChange={setRevenue} format={fmt$} />
        <Slider label="Monthly Expenses" value={expenses} min={0} max={50000} step={100} onChange={setExpenses} format={fmt$} />
      </div>
      <Results rows={[
        { label: 'Revenue', value: fmt$(revenue) },
        { label: 'Expenses', value: fmt$(expenses) },
        { label: 'Net Profit', value: fmt$(profit), primary: true, negative: isLoss },
        { label: 'Profit Margin', value: fmtPct(margin), primary: true, negative: isLoss },
      ]} />
      <Insight text={insight.text} type={insight.type} />
      <div className="flex justify-end pt-1 mt-auto">
        <SaveButton onSave={label => onSave(label, `Revenue ${fmt$(revenue)} → Profit ${fmt$(profit)} (${fmtPct(margin)} margin)`)} />
      </div>
    </CalcCard>
  )
}

// ─── 2. Product Pricing Calculator ───────────────────────────────────────────

function PricingCalc({ onSave }: { onSave: (label: string, summary: string) => void }) {
  const [cost, setCost] = useState('12')
  const [packaging, setPackaging] = useState('3')
  const [shipping, setShipping] = useState('5')
  const [margin, setMargin] = useState(50)

  const totalCost = (Number(cost) || 0) + (Number(packaging) || 0) + (Number(shipping) || 0)
  const suggestedPrice = margin < 100 ? totalCost / (1 - margin / 100) : 0
  const profitPerSale = suggestedPrice - totalCost
  const markup = totalCost > 0 ? ((suggestedPrice - totalCost) / totalCost) * 100 : 0

  const insight = (() => {
    if (totalCost === 0) return { text: '', type: 'neutral' as const }
    if (suggestedPrice < 15) return { text: 'Low-ticket products require high volume to scale. Consider bundling or increasing your cost basis with premium packaging.', type: 'warning' as const }
    if (margin < 30) return { text: 'Margins below 30% are risky once you factor in ads, returns, and fees. Consider pricing at a higher margin floor.', type: 'warning' as const }
    if (margin >= 60) return { text: 'Premium margin territory. Make sure your price point is validated by your target customer\'s willingness to pay.', type: 'neutral' as const }
    return { text: `At ${fmtPct(margin)} margin, you earn ${fmt$(profitPerSale)} per sale. You need ${fmtNum(1000 / (profitPerSale || 1))} units/mo to generate $1K profit.`, type: 'positive' as const }
  })()

  return (
    <CalcCard icon={Tag} title="Product Pricing" description="Find your profitable price point" delay={0.08}>
      <div className="grid grid-cols-3 gap-3">
        <NumInput label="Product Cost" value={cost} onChange={setCost} prefix="$" placeholder="12" />
        <NumInput label="Packaging" value={packaging} onChange={setPackaging} prefix="$" placeholder="3" />
        <NumInput label="Shipping" value={shipping} onChange={setShipping} prefix="$" placeholder="5" />
      </div>
      <Slider label="Desired Profit Margin" value={margin} min={10} max={85} step={1} onChange={setMargin} format={fmtPct} />
      <Results rows={[
        { label: 'Total Unit Cost', value: fmt$(totalCost) },
        { label: 'Markup', value: fmtPct(markup) },
        { label: 'Profit per Sale', value: fmt$(profitPerSale) },
        { label: 'Suggested Price', value: fmt$(suggestedPrice), primary: true },
      ]} />
      <Insight text={insight.text} type={insight.type} />
      <div className="flex justify-end mt-auto">
        <SaveButton onSave={label => onSave(label, `Cost ${fmt$(totalCost)} → Sell at ${fmt$(suggestedPrice)} (${fmtPct(margin)} margin)`)} />
      </div>
    </CalcCard>
  )
}

// ─── 3. Break Even Calculator ────────────────────────────────────────────────

function BreakEvenCalc({ onSave }: { onSave: (label: string, summary: string) => void }) {
  const [monthlyExpenses, setMonthlyExpenses] = useState(3000)
  const [price, setPrice] = useState(50)

  const salesNeeded = price > 0 ? Math.ceil(monthlyExpenses / price) : 0
  const weeklyNeeded = Math.ceil(salesNeeded / 4.33)
  const dailyNeeded = Math.ceil(salesNeeded / 30)

  const insight = (() => {
    if (salesNeeded === 0) return { text: '', type: 'neutral' as const }
    if (salesNeeded <= 10) return { text: 'Highly achievable. Even a modest audience can cover this. Focus on conversion rather than traffic.', type: 'positive' as const }
    if (salesNeeded <= 50) return { text: 'Realistic with consistent effort. Build a repeatable content or ad system that generates this volume monthly.', type: 'neutral' as const }
    if (salesNeeded <= 150) return { text: `${fmtNum(salesNeeded)} sales/month requires real traffic infrastructure. Prioritize building an audience before scaling ad spend.`, type: 'warning' as const }
    return { text: 'Consider raising your price point. High transaction volume at low prices is operationally costly — focus on increasing your average order value.', type: 'warning' as const }
  })()

  return (
    <CalcCard icon={Target} title="Break Even" description="How many sales until you're profitable" delay={0.11}>
      <Slider label="Monthly Fixed Expenses" value={monthlyExpenses} min={500} max={20000} step={100} onChange={setMonthlyExpenses} format={fmt$} />
      <Slider label="Price per Sale" value={price} min={5} max={2000} step={5} onChange={setPrice} format={fmt$} />
      <Results rows={[
        { label: 'Monthly expenses', value: fmt$(monthlyExpenses) },
        { label: 'Sales to break even', value: fmtNum(salesNeeded), primary: true },
        { label: 'Weekly target', value: `${fmtNum(weeklyNeeded)} sales/wk` },
        { label: 'Daily target', value: `${fmtNum(dailyNeeded)} sales/day` },
      ]} />
      <Insight text={insight.text} type={insight.type} />
      <div className="flex justify-end mt-auto">
        <SaveButton onSave={label => onSave(label, `${fmt$(monthlyExpenses)}/mo expenses → ${fmtNum(salesNeeded)} sales @ ${fmt$(price)}`)} />
      </div>
    </CalcCard>
  )
}

// ─── 4. Content ROI Calculator ───────────────────────────────────────────────

function ContentROICalc({ onSave }: { onSave: (label: string, summary: string) => void }) {
  const [views, setViews] = useState(10000)
  const [convRate, setConvRate] = useState(1.5)
  const [aov, setAov] = useState(65)

  const conversions = views * (convRate / 100)
  const monthlyRevenue = conversions * aov
  const annualRevenue = monthlyRevenue * 12
  const revenuePerView = views > 0 ? monthlyRevenue / views : 0

  const insight = (() => {
    if (views === 0) return { text: '', type: 'neutral' as const }
    if (convRate < 0.5) return { text: 'Sub-0.5% conversion suggests a funnel or trust issue. Prioritize social proof, clearer CTAs, and reducing friction to purchase.', type: 'warning' as const }
    if (convRate < 2) return { text: `At ${fmtPct(convRate)} conversion, you earn ${fmt$(revenuePerView)} per view. Doubling your conversion rate doubles revenue without needing more traffic.`, type: 'neutral' as const }
    if (convRate < 5) return { text: 'Strong conversion rate. Your content is working. Scale your reach — more eyes at this conversion rate means compounding returns.', type: 'positive' as const }
    return { text: 'Exceptional conversion rate. Validate this is sustainable and consider paid amplification to scale what\'s working.', type: 'positive' as const }
  })()

  return (
    <CalcCard icon={Eye} title="Content ROI" description="Turn views into revenue estimates" delay={0.14}>
      <Slider label="Monthly Views" value={views} min={1000} max={500000} step={1000} onChange={setViews} format={n => fmtNum(n)} />
      <Slider label="Conversion Rate" value={convRate} min={0.1} max={10} step={0.1} onChange={setConvRate} format={fmtPct} />
      <Slider label="Average Order Value" value={aov} min={10} max={500} step={5} onChange={setAov} format={fmt$} />
      <Results rows={[
        { label: 'Monthly conversions', value: fmtNum(conversions) },
        { label: 'Revenue per view', value: `$${revenuePerView.toFixed(3)}` },
        { label: 'Monthly revenue', value: fmt$(monthlyRevenue), primary: true },
        { label: 'Annual projection', value: fmt$(annualRevenue), primary: true },
      ]} />
      <Insight text={insight.text} type={insight.type} />
      <div className="flex justify-end mt-auto">
        <SaveButton onSave={label => onSave(label, `${fmtNum(views)} views @ ${fmtPct(convRate)} conv → ${fmt$(monthlyRevenue)}/mo`)} />
      </div>
    </CalcCard>
  )
}

// ─── 5. Affiliate Income Calculator ──────────────────────────────────────────

function AffiliateCalc({ onSave }: { onSave: (label: string, summary: string) => void }) {
  const [productPrice, setProductPrice] = useState('97')
  const [commission, setCommission] = useState(30)
  const [clicks, setClicks] = useState(2000)
  const [convRate, setConvRate] = useState(2)

  const commissionPerSale = (Number(productPrice) || 0) * (commission / 100)
  const monthlySales = clicks * (convRate / 100)
  const monthlyIncome = monthlySales * commissionPerSale
  const annualIncome = monthlyIncome * 12

  const insight = (() => {
    if (monthlyIncome === 0) return { text: '', type: 'neutral' as const }
    if (monthlyIncome < 100) return { text: 'Build your audience first — even tripling your clicks changes the math dramatically. Audience > offers.', type: 'warning' as const }
    if (monthlyIncome < 500) return { text: `${fmt$(monthlyIncome)}/mo is a solid start. Growing your click volume to ${fmtNum(clicks * 3)} would generate ${fmt$(monthlyIncome * 3)}/mo with the same conversion.`, type: 'neutral' as const }
    if (monthlyIncome < 2000) return { text: 'Meaningful affiliate income. Consider stacking 2–3 high-commission programs in the same niche to compound this.', type: 'positive' as const }
    return { text: `${fmt$(annualIncome)}/year in affiliate income. At this level, negotiate higher commission rates — most brands will accommodate proven affiliates.`, type: 'positive' as const }
  })()

  return (
    <CalcCard icon={Link2} title="Affiliate Income" description="Estimate your commission potential" delay={0.17}>
      <div className="grid grid-cols-2 gap-3">
        <NumInput label="Product Price" value={productPrice} onChange={setProductPrice} prefix="$" placeholder="97" />
        <div>
          <div className="text-xs font-medium text-[#71717A] mb-1.5">Commission Rate</div>
          <div className="px-3 py-2.5 rounded-xl border border-[#E4E4E7] bg-white text-sm font-bold text-[#7C3AED]">{fmtPct(commission)}</div>
        </div>
      </div>
      <Slider label="Commission Rate" value={commission} min={1} max={70} step={1} onChange={setCommission} format={fmtPct} />
      <Slider label="Monthly Clicks" value={clicks} min={100} max={100000} step={100} onChange={setClicks} format={fmtNum} />
      <Slider label="Conversion Rate" value={convRate} min={0.1} max={15} step={0.1} onChange={setConvRate} format={fmtPct} />
      <Results rows={[
        { label: 'Commission per sale', value: fmt$(commissionPerSale) },
        { label: 'Monthly sales', value: fmtNum(monthlySales) },
        { label: 'Monthly income', value: fmt$(monthlyIncome), primary: true },
        { label: 'Annual income', value: fmt$(annualIncome), primary: true },
      ]} />
      <Insight text={insight.text} type={insight.type} />
      <div className="flex justify-end mt-auto">
        <SaveButton onSave={label => onSave(label, `${fmtPct(commission)} commission → ${fmt$(monthlyIncome)}/mo (${fmtNum(clicks)} clicks)`)} />
      </div>
    </CalcCard>
  )
}

// ─── 6. Time Value Calculator ────────────────────────────────────────────────

function TimeValueCalc({ onSave }: { onSave: (label: string, summary: string) => void }) {
  const [hourlyRate, setHourlyRate] = useState(75)
  const [hoursWasted, setHoursWasted] = useState(10)

  const weeklyLoss = hourlyRate * hoursWasted
  const monthlyLoss = weeklyLoss * 4.33
  const annualLoss = monthlyLoss * 12
  const outsourceCost = hoursWasted * 25 * 4.33
  const netRecovery = monthlyLoss - outsourceCost

  const insight = (() => {
    if (monthlyLoss === 0) return { text: '', type: 'neutral' as const }
    if (monthlyLoss < 500) return { text: 'Even small efficiency gains add up. Identify the 2–3 recurring tasks eating your time and eliminate or delegate them.', type: 'neutral' as const }
    if (monthlyLoss < 2000) return { text: `You're losing ${fmt$(monthlyLoss)}/mo to low-leverage work. A VA at $15–25/hr could recover ${fmt$(netRecovery)}/mo net — making delegation an obvious ROI.`, type: 'warning' as const }
    return { text: `${fmt$(annualLoss)}/year in time value lost. This is the hidden cost of staying in execution mode. Systemize, delegate, or automate — then direct your hours to high-leverage CEO activities.`, type: 'warning' as const }
  })()

  return (
    <CalcCard icon={Clock} title="Time Value" description="The real cost of low-leverage work" delay={0.20}>
      <Slider label="Your Hourly Value" value={hourlyRate} min={25} max={1000} step={25} onChange={setHourlyRate} format={fmt$} />
      <Slider label="Hours/Week on Low-Value Tasks" value={hoursWasted} min={1} max={40} step={1} onChange={setHoursWasted} format={v => `${v}h`} />
      <Results rows={[
        { label: 'Weekly opportunity cost', value: fmt$(weeklyLoss) },
        { label: 'VA cost to offload (~$25/hr)', value: fmt$(outsourceCost) },
        { label: 'Monthly time lost', value: fmt$(monthlyLoss), primary: true },
        { label: 'Annual opportunity cost', value: fmt$(annualLoss), primary: true },
      ]} />
      <Insight text={insight.text} type={insight.type} />
      <div className="flex justify-end mt-auto">
        <SaveButton onSave={label => onSave(label, `${hoursWasted}h/wk @ ${fmt$(hourlyRate)}/hr → ${fmt$(monthlyLoss)}/mo lost`)} />
      </div>
    </CalcCard>
  )
}

// ─── CEO Metrics Snapshot ─────────────────────────────────────────────────────

const METRICS = [
  {
    label: 'Monthly Revenue',
    value: '$2,400',
    change: '+18%',
    positive: true,
    icon: DollarSign,
  },
  {
    label: 'Profit Margin',
    value: '38%',
    change: '+4pts',
    positive: true,
    icon: Percent,
  },
  {
    label: 'Conversion Rate',
    value: '3.2%',
    change: '+0.4%',
    positive: true,
    icon: MousePointer2,
  },
  {
    label: 'MoM Growth',
    value: '+18%',
    change: 'vs last mo',
    positive: true,
    icon: TrendingUp,
  },
  {
    label: 'Affiliate Income',
    value: '$340',
    change: '/month',
    positive: true,
    icon: Link2,
  },
]

function MetricsSnapshot() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {METRICS.map((m, i) => {
        const Icon = m.icon
        return (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white rounded-2xl border border-[#F4F4F5] p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className="w-3.5 h-3.5 text-[#A1A1AA]" strokeWidth={1.5} />
              <span className={cn(
                'text-[10px] font-semibold flex items-center gap-0.5',
                m.positive ? 'text-[#16A34A]' : 'text-[#A1A1AA]'
              )}>
                {m.positive && <ArrowUpRight className="w-3 h-3" />}
                {m.change}
              </span>
            </div>
            <p className="text-lg font-bold text-[#18181B] leading-none">{m.value}</p>
            <p className="text-[10px] text-[#A1A1AA] mt-1">{m.label}</p>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Saved Calculations Section ───────────────────────────────────────────────

function SavedSection({ saves, onDelete }: { saves: SavedCalc[]; onDelete: (id: string) => void }) {
  if (saves.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-[#D1D0CC] p-8 text-center mt-6">
        <Bookmark className="w-5 h-5 text-[#A1A1AA] mx-auto mb-2" strokeWidth={1.5} />
        <p className="text-sm font-medium text-[#A1A1AA]">No saved calculations yet</p>
        <p className="text-xs text-[#A1A1AA] mt-1">Hit "Save" on any calculator to store results here</p>
      </div>
    )
  }

  return (
    <div className="mt-6 bg-white rounded-2xl border border-[#F4F4F5]">
      <div className="px-5 py-4 border-b border-[#FAFAFA] flex items-center gap-2">
        <Bookmark className="w-4 h-4 text-[#A1A1AA]" strokeWidth={1.5} />
        <h3 className="text-sm font-semibold text-[#18181B]">Saved Calculations</h3>
        <span className="ml-auto text-[10px] font-medium text-[#A1A1AA] bg-[#FAFAFA] px-2 py-0.5 rounded-full">
          {saves.length}
        </span>
      </div>
      <div className="divide-y divide-[#FAFAFA]">
        <AnimatePresence initial={false}>
          {saves.map(s => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-5 py-3.5 flex items-start gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#18181B]">{s.label}</p>
                <p className="text-xs text-[#A1A1AA] mt-0.5 truncate">{s.summary}</p>
                <p className="text-[10px] text-[#A1A1AA] mt-1">{s.savedAt}</p>
              </div>
              <button
                onClick={() => onDelete(s.id)}
                className="p-1.5 text-[#E4E4E7] hover:text-[#A1A1AA] transition-colors flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CalculatorsPage() {
  const { profile, signOut } = useUser()
  const [saves, setSaves] = useState<SavedCalc[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ceo_saved_calcs')
      if (stored) setSaves(JSON.parse(stored))
    } catch {}
  }, [])

  const handleSave = (label: string, summary: string) => {
    const entry: SavedCalc = {
      id: Date.now().toString(),
      label,
      summary,
      savedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }
    setSaves(prev => {
      const next = [entry, ...prev]
      try { localStorage.setItem('ceo_saved_calcs', JSON.stringify(next)) } catch {}
      return next
    })
  }

  const handleDelete = (id: string) => {
    setSaves(prev => {
      const next = prev.filter(s => s.id !== id)
      try { localStorage.setItem('ceo_saved_calcs', JSON.stringify(next)) } catch {}
      return next
    })
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar profile={profile} onSignOut={signOut} />

      <div className="lg:pl-64 pb-24 lg:pb-8">
        {/* Sticky header */}
        <div className="sticky top-0 z-30 bg-[#FAFAFA]/90 backdrop-blur-md border-b border-[#F4F4F5] px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#EDE9FE] flex items-center justify-center">
              <Calculator className="w-3.5 h-3.5 text-[#7C3AED]" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-display text-sm font-bold text-[#18181B]">Entrepreneur Calculator</h1>
              <p className="text-[11px] text-[#A1A1AA]">Your founder operating system</p>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
          {/* CEO Metrics Snapshot */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A1A1AA] mb-3 flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5" />
              CEO Metrics Snapshot
            </p>
          </motion.div>
          <MetricsSnapshot />

          {/* Calculator Grid */}
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A1A1AA] mb-4 flex items-center gap-2">
            <Calculator className="w-3.5 h-3.5" />
            Calculators
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <ProfitCalc onSave={handleSave} />
            <PricingCalc onSave={handleSave} />
            <BreakEvenCalc onSave={handleSave} />
            <ContentROICalc onSave={handleSave} />
            <AffiliateCalc onSave={handleSave} />
            <TimeValueCalc onSave={handleSave} />
          </div>

          {/* Saved Calculations */}
          <SavedSection saves={saves} onDelete={handleDelete} />
        </div>
      </div>

      <MobileNav />
    </div>
  )
}
