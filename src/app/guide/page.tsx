'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Check, ChevronDown, Sparkles, ArrowRight, Copy, CheckCheck, Mail, Crown, Lock } from 'lucide-react'
import Link from 'next/link'
import { Sidebar } from '@/components/navigation/Sidebar'
import { MobileNav } from '@/components/navigation/MobileNav'
import { useUser } from '@/components/providers/UserProvider'
import { cn } from '@/lib/utils'

// ── Storage key ───────────────────────────────────────────────────────────────
const storageKey = (userId: string) => `${userId}_claude_guide_v1`

// ── Context template component ─────────────────────────────────────────────────
const TEMPLATE_TEXT = `Hi Claude! Here's some context about me:
- My business: [what you sell or do]
- My customers: [who buys from you - age, interests, problem they have]
- My goal right now: [what you're working on this month]
- My experience level: Beginner entrepreneur

With that in mind, [your question here]`

function ContextTemplate() {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(TEMPLATE_TEXT).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="relative">
      <div className="bg-[#18181B] rounded-2xl p-4 pr-12">
        <pre className="text-xs text-[#E4E4E7] leading-relaxed whitespace-pre-wrap font-mono">
          {TEMPLATE_TEXT}
        </pre>
      </div>
      <button
        onClick={copy}
        className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
      >
        {copied
          ? <CheckCheck className="w-4 h-4 text-[#86EFAC]" />
          : <Copy className="w-4 h-4 text-[#A1A1AA]" />
        }
      </button>
      {copied && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-xs text-[#16A34A] mt-2 font-semibold"
        >
          Copied! Paste it next time you open Claude ✓
        </motion.p>
      )}
    </div>
  )
}

// ── Power prompts ──────────────────────────────────────────────────────────────
const POWER_PROMPTS = [
  {
    emoji: '📸',
    label: 'Instagram captions',
    prompt: 'I sell [your product] to [your customer]. Write me 5 Instagram captions with a fun, relatable tone. Include one question to boost engagement.',
    color: '#FEF9C3',
    border: '#FDE68A',
    text: '#713F12',
  },
  {
    emoji: '📅',
    label: '30-day content plan',
    prompt: 'I run a [your business type] business. Create a 30-day Instagram content calendar with a mix of educational, entertaining, and promotional posts.',
    color: '#EDE9FE',
    border: '#C4B5FD',
    text: '#4C1D95',
  },
  {
    emoji: '💌',
    label: 'Cold DM script',
    prompt: 'Write a friendly, non-pushy cold DM I can send to potential clients for my [your service] business. Keep it short and end with a soft question.',
    color: '#F0FDF4',
    border: '#BBF7D0',
    text: '#14532D',
  },
  {
    emoji: '💰',
    label: 'Pricing advice',
    prompt: 'I offer [your product/service]. My costs are approximately [your costs]. Help me think through my pricing strategy and what I should charge.',
    color: '#FFF7ED',
    border: '#FED7AA',
    text: '#7C2D12',
  },
  {
    emoji: '📧',
    label: 'Welcome email',
    prompt: 'Write a warm, personal welcome email for my first customer who just bought [your product]. Make it feel human, not corporate.',
    color: '#F0F9FF',
    border: '#BAE6FD',
    text: '#0C4A6E',
  },
  {
    emoji: '💡',
    label: 'Content ideas',
    prompt: 'My business is [your business]. Give me 20 content ideas I could post about - a mix of educational tips, behind the scenes, and personal story content.',
    color: '#FEF2F2',
    border: '#FECACA',
    text: '#7F1D1D',
  },
  {
    emoji: '👥',
    label: 'Find first customers',
    prompt: 'I just started [your business]. I have zero customers and a small following. Give me 10 realistic, free strategies to find my first 10 customers.',
    color: '#F5F3FF',
    border: '#DDD6FE',
    text: '#3B0764',
  },
  {
    emoji: '✍️',
    label: 'Improve my bio',
    prompt: 'Here is my current Instagram bio: [paste your bio]. Rewrite it to clearly say who I help, what I do, and include a call to action. Make it punchy.',
    color: '#ECFDF5',
    border: '#A7F3D0',
    text: '#064E3B',
  },
]

// ── Power prompts grid ─────────────────────────────────────────────────────────
function PowerPromptsGrid({ tryPrompt, isGuest }: { tryPrompt: (p: string) => void; isGuest: boolean }) {
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null)

  function handleAction(p: typeof POWER_PROMPTS[0]) {
    if (isGuest) {
      navigator.clipboard.writeText(p.prompt).catch(() => {})
      setCopiedLabel(p.label)
      setTimeout(() => setCopiedLabel(null), 3000)
    } else {
      tryPrompt(p.prompt)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#3F3F46] leading-relaxed">
        Fill in the <span className="bg-[#EDE9FE] text-[#7C3AED] px-1 rounded font-medium">[brackets]</span> with your details, then {isGuest ? 'copy it and paste into Claude.ai' : 'tap Try this to send it to Claude'}.
      </p>
      <div className="grid grid-cols-1 gap-2">
        {POWER_PROMPTS.map(p => (
          <div
            key={p.label}
            className="rounded-2xl p-4 border"
            style={{ background: p.color, borderColor: p.border }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold mb-1.5" style={{ color: p.text }}>
                  {p.emoji} {p.label}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: p.text, opacity: 0.8 }}>
                  &quot;{p.prompt}&quot;
                </p>
              </div>
              <div className="flex-shrink-0 flex flex-col items-end gap-1">
                <button
                  onClick={() => handleAction(p)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-white text-[10px] font-bold transition-all active:scale-95"
                  style={{ background: copiedLabel === p.label ? '#16A34A' : '#18181B' }}
                >
                  {copiedLabel === p.label ? (
                    <><CheckCheck className="w-3 h-3" /> Copied!</>
                  ) : isGuest ? (
                    <><Copy className="w-3 h-3" /> Copy</>
                  ) : (
                    <>Try this <ArrowRight className="w-3 h-3" /></>
                  )}
                </button>
                {copiedLabel === p.label && (
                  <a
                    href="https://claude.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] font-semibold text-[#7C3AED] hover:underline"
                  >
                    Open Claude.ai →
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Guide lessons ─────────────────────────────────────────────────────────────
const LESSONS = [
  {
    id: 'what-is-claude',
    emoji: '🤖',
    title: 'What even is Claude?',
    subtitle: 'Think of her as your always-available, never-judging business bestie',
    xp: 25,
    color: '#EDE9FE',
    borderColor: '#C4B5FD',
    accentColor: '#7C3AED',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-[#3F3F46] leading-relaxed">
          Claude is an AI, which basically means she&apos;s a really, really smart text conversation that never gets tired, never judges you, and is available at 3am when you&apos;re spiralling about your business idea.
        </p>
        <div className="bg-[#F8F8FF] rounded-2xl p-4 border border-[#E0E0FF]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED] mb-3">💬 Example conversation</p>
          <div className="space-y-2">
            <div className="flex justify-end">
              <div className="bg-[#7C3AED] text-white text-sm rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%]">
                I want to start a business selling candles but I have no idea where to start
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-white border border-[#E4E4E7] text-[#18181B] text-sm rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[85%]">
                Love this! Candles are a great first product. Let&apos;s break it down into your first 3 steps: 1) Pick your niche (soy? beeswax? scented?), 2) Order supplies to make 10 test candles, 3) Sell to 5 people you know before spending a dollar on ads. Want me to help with any of these?
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[#FFF7ED] rounded-2xl p-4 border border-[#FED7AA]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#EA580C] mb-2">💗 Good to know</p>
          <p className="text-sm text-[#7C2D12] leading-relaxed">
            Claude won&apos;t remember your previous conversations. Every new chat starts fresh, so always give her a quick reminder of who you are and what your business is.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'be-specific',
    emoji: '🎯',
    title: 'Be specific: she loves details',
    subtitle: 'The more context you give, the better the answer',
    xp: 50,
    color: '#FEF9C3',
    borderColor: '#FDE68A',
    accentColor: '#CA8A04',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-[#3F3F46] leading-relaxed">
          Vague questions get vague answers. Specific questions get answers you can actually use. Here&apos;s the difference:
        </p>
        <div className="space-y-3">
          <div className="bg-[#FEF2F2] rounded-2xl p-4 border border-[#FECACA]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#DC2626] mb-2">❌ Too vague</p>
            <p className="text-sm text-[#7F1D1D] italic">&quot;Help me with marketing&quot;</p>
            <p className="text-xs text-[#B91C1C] mt-1.5">Claude has no idea what to say. The answer will be generic and useless.</p>
          </div>
          <div className="bg-[#F0FDF4] rounded-2xl p-4 border border-[#BBF7D0]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#16A34A] mb-2">✅ Specific + good</p>
            <p className="text-sm text-[#14532D] italic">&quot;I sell handmade soy candles on Etsy, targeting women 25–40 who love cozy home vibes. Give me 5 Instagram caption ideas for autumn.&quot;</p>
            <p className="text-xs text-[#15803D] mt-1.5">Now Claude knows who you are, who your customer is, and exactly what you need.</p>
          </div>
        </div>
        <div className="bg-[#F0F9FF] rounded-2xl p-4 border border-[#BAE6FD]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#0369A1] mb-2">✨ The formula</p>
          <p className="text-sm text-[#0C4A6E] leading-relaxed">
            <strong>Who you are</strong> + <strong>Who your customer is</strong> + <strong>Exactly what you need</strong> = great answer every time.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'give-context',
    emoji: '📋',
    title: 'Your business context template',
    subtitle: 'Copy this once and paste it at the start of every chat',
    xp: 50,
    color: '#F0FDF4',
    borderColor: '#BBF7D0',
    accentColor: '#16A34A',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-[#3F3F46] leading-relaxed">
          Since Claude doesn&apos;t remember you between chats, save this template somewhere and paste it at the start of any new conversation. It takes 10 seconds and makes every answer 10x better.
        </p>
        <ContextTemplate />
        <div className="bg-[#FFF7ED] rounded-2xl p-4 border border-[#FED7AA]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#EA580C] mb-2">💗 Pro tip</p>
          <p className="text-sm text-[#7C2D12] leading-relaxed">
            Save your filled-in template in your phone&apos;s notes app. Copy-paste it every time you start a new Claude conversation. Your answers will be dramatically better.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'keep-going',
    emoji: '🔄',
    title: 'Keep the conversation going',
    subtitle: 'You can refine, ask again, or go deeper. She never gets annoyed.',
    xp: 50,
    color: '#F0F9FF',
    borderColor: '#BAE6FD',
    accentColor: '#0369A1',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-[#3F3F46] leading-relaxed">
          One of Claude&apos;s superpowers is that you can keep talking to her. If an answer isn&apos;t quite right, just say so. She never gets frustrated.
        </p>
        <div className="bg-[#F8F8FF] rounded-2xl p-4 border border-[#E0E0FF]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED] mb-3">💬 Refining an answer</p>
          <div className="space-y-2">
            {[
              { role: 'user', text: 'Write me an Instagram caption for my new candle launch' },
              { role: 'ai',   text: '✨ New arrival alert! Our autumn soy candles are here, hand-poured with love, scented to feel like a warm hug. Shop now (link in bio)' },
              { role: 'user', text: 'I like it but make it shorter and add an emoji at the start' },
              { role: 'ai',   text: '🍂 New candles just dropped. Hand-poured soy, autumn scents, made with love. Link in bio.' },
              { role: 'user', text: 'Perfect! Now give me 4 more in that same style' },
            ].map((msg, i) => (
              <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn(
                  'text-xs rounded-2xl px-3 py-2 max-w-[80%]',
                  msg.role === 'user'
                    ? 'bg-[#7C3AED] text-white rounded-br-sm'
                    : 'bg-white border border-[#E4E4E7] text-[#18181B] rounded-bl-sm'
                )}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            '"Make it shorter"',
            '"Make it more casual"',
            '"Give me 5 options"',
            '"Write it for TikTok instead"',
            '"Add more urgency"',
            '"Make it funnier"',
          ].map(phrase => (
            <div key={phrase} className="bg-[#FAFAFA] rounded-xl px-3 py-2 border border-[#E4E4E7]">
              <p className="text-xs text-[#52525B] font-medium">{phrase}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#A1A1AA] text-center">These short follow-ups work every time</p>
      </div>
    ),
  },
  {
    id: 'power-prompts',
    emoji: '⚡',
    title: 'Your CEO power prompts',
    subtitle: 'Tap any prompt to try it in the AI assistant right now',
    xp: 100,
    color: '#EDE9FE',
    borderColor: '#C4B5FD',
    accentColor: '#7C3AED',
    content: null, // rendered separately
  },
]

// ── Email gate (public visitors) ───────────────────────────────────────────────
function EmailGate({ onUnlock }: { onUnlock: (guestId: string) => void }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    const id = `guest_${Math.random().toString(36).slice(2, 10)}`
    try {
      await fetch('/api/guide-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), guestId: id }),
      })
    } catch { /* proceed anyway so the funnel never breaks */ }
    try {
      localStorage.setItem('guide_guest_id', id)
      localStorage.setItem('guide_guest_email', email.trim())
    } catch { /* ignore */ }
    onUnlock(id)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-sm w-full space-y-6"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.25)]">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-none text-[#18181B]">Rinse &amp; Repeat</p>
            <p className="text-[10px] font-semibold text-[#7C3AED] uppercase tracking-widest leading-none mt-0.5">CEO</p>
          </div>
        </Link>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDE9FE] text-[#7C3AED] text-xs font-semibold mb-3">
            <Sparkles className="w-3 h-3" /> Free Guide
          </div>
          <h1 className="text-3xl font-bold text-[#18181B] leading-tight mb-3">
            How to Use Claude AI<br />
            <span className="text-[#7C3AED]">for Your Business</span>
          </h1>
          <p className="text-[#71717A] leading-relaxed text-sm">
            5 quick missions. No tech experience needed. Learn to use AI so it actually saves you hours every week.
          </p>
        </div>

        {/* What's inside */}
        <div className="bg-[#18181B] rounded-2xl p-5 space-y-2.5">
          {[
            'What Claude is and why it matters for you',
            'How to talk to it so it gives great answers',
            'Your personal context template (copy it once, use forever)',
            '8 proven prompts for Instagram, emails & pricing',
            'What Claude can\'t do (so you don\'t waste time)',
          ].map(item => (
            <div key={item} className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-[#7C3AED]/30 flex items-center justify-center flex-shrink-0">
                <Check className="w-2.5 h-2.5 text-[#A78BFA]" strokeWidth={3} />
              </div>
              <span className="text-sm text-[#D4D4D8]">{item}</span>
            </div>
          ))}
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-[#E4E4E7] bg-white text-base focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all"
            />
          </div>
          <motion.button
            type="submit"
            disabled={status === 'loading' || !email.trim()}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3.5 rounded-2xl bg-[#7C3AED] hover:bg-[#5B21B6] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Unlock the free guide
              </>
            )}
          </motion.button>
          <p className="text-[10px] text-[#A1A1AA] text-center">No spam. Unsubscribe any time.</p>
        </form>

        <p className="text-xs text-center text-[#A1A1AA]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#7C3AED] font-semibold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function ClaudeGuidePage() {
  const { user, profile, signOut } = useUser()
  const router = useRouter()
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<string | null>('what-is-claude')
  const [gatePhase, setGatePhase] = useState<'checking' | 'gate' | 'open'>('checking')
  const [guestId, setGuestId] = useState<string | null>(null)

  const effectiveId = user?.id ?? guestId

  // Determine gate phase and load progress
  useEffect(() => {
    if (user?.id) {
      setGatePhase('open')
      try {
        const raw = localStorage.getItem(storageKey(user.id))
        if (raw) setCompleted(new Set(JSON.parse(raw) as string[]))
      } catch { /* ignore */ }
      return
    }
    const storedId = localStorage.getItem('guide_guest_id')
    if (storedId) {
      setGuestId(storedId)
      setGatePhase('open')
      try {
        const raw = localStorage.getItem(storageKey(storedId))
        if (raw) setCompleted(new Set(JSON.parse(raw) as string[]))
      } catch { /* ignore */ }
    } else {
      setGatePhase('gate')
    }
  }, [user?.id])

  function handleUnlock(id: string) {
    setGuestId(id)
    setGatePhase('open')
  }

  // Save progress
  const markDone = (id: string) => {
    if (!effectiveId) return
    setCompleted(prev => {
      const next = new Set(Array.from(prev).concat(id))
      try { localStorage.setItem(storageKey(effectiveId), JSON.stringify(Array.from(next))) } catch { /* ignore */ }
      return next
    })
    // Auto-expand next lesson
    const idx = LESSONS.findIndex(l => l.id === id)
    if (idx < LESSONS.length - 1) setExpanded(LESSONS[idx + 1].id)
  }

  const tryPrompt = (prompt: string) => {
    try { sessionStorage.setItem('ai_prefill', prompt) } catch { /* ignore */ }
    router.push('/ai-assistant')
  }

  const totalXP = LESSONS.filter(l => completed.has(l.id)).reduce((s, l) => s + l.xp, 0)
  const maxXP = LESSONS.reduce((s, l) => s + l.xp, 0)
  const allDone = completed.size >= LESSONS.length

  if (gatePhase === 'checking') return <div className="min-h-screen bg-[#FAFAFA]" />
  if (gatePhase === 'gate') return <EmailGate onUnlock={handleUnlock} />

  const isGuest = !user?.id

  const pageContent = (
        <div className="max-w-2xl mx-auto px-4 py-0 md:py-8 md:px-8">

          {/* ── Hero header ── */}
          <div
            className="rounded-none md:rounded-2xl px-6 py-8 mb-6"
            style={{ background: '#18181B' }}
          >
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#A78BFA]/20 mb-4">
                <Sparkles className="w-3 h-3 text-[#A78BFA]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#A78BFA]">5 Missions</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2 leading-snug">
                Beginner&apos;s Guide to Claude 🤖
              </h1>
              <p className="text-[#71717A] text-sm mb-5 leading-relaxed">
                Never used AI before? No problem. These 5 missions teach you exactly how to talk to Claude so she can actually help your business.
              </p>
              {/* XP progress */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #7C3AED, #A78BFA)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((totalXP / maxXP) * 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <span className="text-xs font-bold text-[#A78BFA] flex-shrink-0">{totalXP} / {maxXP} XP</span>
              </div>
              <p className="text-[#52525B] text-[10px] mt-1.5">{completed.size} of {LESSONS.length} missions complete</p>
            </motion.div>
          </div>

          {/* ── Lessons ── */}
          <div className="px-4 md:px-0 space-y-3">
            {allDone && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl p-5 text-center border"
                style={{ background: '#EDE9FE', borderColor: '#C4B5FD' }}
              >
                <div className="text-4xl mb-2">🎉</div>
                <p className="text-[#4C1D95] font-bold text-base">You finished the guide!</p>
                <p className="text-[#6D28D9] text-sm mt-1">You&apos;ve earned {totalXP} XP. Now go use Claude for real.</p>
                <button
                  onClick={() => router.push('/ai-assistant')}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-bold hover:bg-[#6D28D9] transition-colors"
                >
                  Open AI Assistant →
                </button>
              </motion.div>
            )}

            {LESSONS.map((lesson, i) => {
              const isDone = completed.has(lesson.id)
              const isExpanded = expanded === lesson.id
              const isNext = !isDone && LESSONS.findIndex(l => !completed.has(l.id)) === i

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl border overflow-hidden shadow-sm"
                  style={{ borderColor: isNext ? lesson.borderColor : '#F0F0F0' }}
                >
                  {/* Mission header */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : lesson.id)}
                    className="w-full flex items-center gap-3 p-4 text-left"
                  >
                    {/* Icon */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                      style={{ background: isDone ? '#F0FDF4' : lesson.color }}
                    >
                      {isDone ? <Check className="w-5 h-5 text-[#16A34A]" strokeWidth={2.5} /> : lesson.emoji}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={cn(
                          'text-sm font-bold',
                          isDone ? 'text-[#16A34A]' : 'text-[#18181B]'
                        )}>
                          Mission {i + 1}: {lesson.title}
                        </p>
                        {isNext && !isDone && (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-[#7C3AED] text-white px-2 py-0.5 rounded-full">
                            Up next
                          </span>
                        )}
                        {isDone && (
                          <span className="text-[9px] font-bold text-[#86EFAC]">+{lesson.xp} XP ✓</span>
                        )}
                      </div>
                      <p className="text-xs text-[#71717A] mt-0.5 leading-snug">{lesson.subtitle}</p>
                    </div>

                    {/* XP + chevron */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!isDone && (
                        <span className="text-[10px] font-bold text-[#A1A1AA]">+{lesson.xp} XP</span>
                      )}
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="w-4 h-4 text-[#A1A1AA]" />
                      </motion.div>
                    </div>
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-4">
                          <div className="border-t border-[#F4F4F5] pt-4">
                            {/* Lesson content or power prompts */}
                            {lesson.id === 'power-prompts' ? (
                              <PowerPromptsGrid tryPrompt={tryPrompt} isGuest={isGuest} />
                            ) : (
                              lesson.content
                            )}
                          </div>

                          {/* Complete button */}
                          {!isDone && (
                            <motion.button
                              whileTap={{ scale: 0.97 }}
                              onClick={() => markDone(lesson.id)}
                              className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2"
                              style={{
                                background: `linear-gradient(135deg, ${lesson.accentColor}, ${lesson.accentColor}CC)`,
                                boxShadow: `0 4px 20px ${lesson.accentColor}40`,
                              }}
                            >
                              <Check className="w-4 h-4" strokeWidth={3} />
                              Got it! Mark mission complete · +{lesson.xp} XP
                            </motion.button>
                          )}

                          {isDone && (
                            <div className="flex items-center justify-center gap-2 py-2">
                              <Check className="w-4 h-4 text-[#16A34A]" strokeWidth={2.5} />
                              <span className="text-sm font-semibold text-[#16A34A]">Mission complete · +{lesson.xp} XP earned</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="py-6 text-center space-y-3"
            >
              {isGuest ? (
                <>
                  <p className="text-sm text-[#71717A]">Want to save your progress and try Claude for real?</p>
                  <Link
                    href="/signup?from=guide"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-semibold hover:bg-[#5B21B6] transition-colors"
                  >
                    <Crown className="w-4 h-4" />
                    Create your free account
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-sm text-[#71717A]">Ready to try Claude for real?</p>
                  <button
                    onClick={() => router.push('/ai-assistant')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#18181B] text-white text-sm font-semibold hover:bg-[#27272A] transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-[#A78BFA]" />
                    Open AI Assistant
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </motion.div>
          </div>
        </div>
  )

  if (isGuest) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <main className="pb-16">{pageContent}</main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar profile={profile} onSignOut={signOut} />
      <main className="flex-1 lg:pl-64 pb-24 lg:pb-8">{pageContent}</main>
      <MobileNav />
    </div>
  )
}
