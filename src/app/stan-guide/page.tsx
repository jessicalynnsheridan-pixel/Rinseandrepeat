'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Check, ChevronDown, ArrowRight, Copy, CheckCheck,
  ExternalLink, ShoppingBag,
} from 'lucide-react'
import { Sidebar } from '@/components/navigation/Sidebar'
import { MobileNav } from '@/components/navigation/MobileNav'
import { useUser } from '@/components/providers/UserProvider'
import { cn } from '@/lib/utils'

// ── Constants ──────────────────────────────────────────────────────────────────
const REFERRAL_URL = 'https://join.stan.store/thedit'
const storageKey   = (userId: string) => `${userId}_stan_guide_v1`

// ── Copyable snippet component ─────────────────────────────────────────────────
function CopySnippet({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="relative">
      {label && <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-2">{label}</p>}
      <div className="bg-[#18181B] rounded-2xl p-4 pr-12">
        <p className="text-xs text-[#E4E4E7] leading-relaxed font-mono whitespace-pre-wrap">{text}</p>
      </div>
      <button
        onClick={copy}
        className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        style={{ top: label ? '2.2rem' : '0.75rem' }}
      >
        {copied
          ? <CheckCheck className="w-4 h-4 text-[#86EFAC]" />
          : <Copy className="w-4 h-4 text-[#A1A1AA]" />}
      </button>
      {copied && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-xs text-[#16A34A] mt-2 font-semibold"
        >
          Copied! ✓
        </motion.p>
      )}
    </div>
  )
}

// ── Referral CTA button ────────────────────────────────────────────────────────
function ReferralButton({ label = 'Create your free Stan Store →' }: { label?: string }) {
  return (
    <a
      href={REFERRAL_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-bold text-sm transition-all active:scale-[0.98]"
      style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)', boxShadow: '0 4px 24px rgba(255,107,53,0.35)' }}
    >
      <ShoppingBag className="w-4 h-4" />
      {label}
      <ExternalLink className="w-3.5 h-3.5 opacity-70" />
    </a>
  )
}

// ── Lessons ────────────────────────────────────────────────────────────────────
const LESSONS = [
  {
    id: 'what-is-stan',
    emoji: '🛍️',
    title: 'What is Stan Store?',
    subtitle: 'Your whole online business in one link',
    xp: 25,
    color: '#FFF7ED',
    borderColor: '#FED7AA',
    accentColor: '#EA580C',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-[#3F3F46] leading-relaxed">
          Stan Store is the tool that replaces four different apps with one. Instead of juggling Linktree + Gumroad + Mailchimp + a separate website, Stan Store does all of it in one place — and it lives at your Instagram bio link.
        </p>

        {/* What it replaces */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA]">What stan replaces</p>
          {[
            { old: '🔗 Linktree (link in bio)', new: '✅ Built into Stan Store' },
            { old: '🛒 Gumroad (sell products)', new: '✅ Built into Stan Store' },
            { old: '📧 Mailchimp (email capture)', new: '✅ Built into Stan Store' },
            { old: '🌐 A website', new: '✅ Built into Stan Store' },
          ].map(row => (
            <div key={row.old} className="flex items-center gap-3 bg-[#FAFAFA] rounded-xl px-3 py-2.5 border border-[#F0F0F0]">
              <p className="text-xs text-[#A1A1AA] line-through flex-1">{row.old}</p>
              <p className="text-xs text-[#16A34A] font-semibold flex-shrink-0">{row.new}</p>
            </div>
          ))}
        </div>

        {/* The funnel */}
        <div className="bg-[#FFF7ED] rounded-2xl p-4 border border-[#FED7AA]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#EA580C] mb-3">⚡ The magic funnel</p>
          <div className="flex items-center gap-1 flex-wrap text-xs text-[#7C2D12] font-medium">
            {['📱 Instagram post', '→', '👆 Click bio link', '→', '🎁 Download freebie', '→', '📧 Joins your list', '→', '💰 Buys your product'].map((step, i) => (
              <span key={i} className={step === '→' ? 'text-[#FCA5A5]' : 'bg-white px-2 py-1 rounded-lg border border-[#FED7AA]'}>{step}</span>
            ))}
          </div>
          <p className="text-xs text-[#92400E] mt-2.5 leading-relaxed">
            This is the exact flow that takes someone from a stranger seeing your Reel to a paying customer — all happening automatically.
          </p>
        </div>

        {/* Pricing note */}
        <div className="bg-[#F0FDF4] rounded-2xl p-4 border border-[#BBF7D0]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#16A34A] mb-2">💸 What does it cost?</p>
          <p className="text-sm text-[#14532D] leading-relaxed">
            Stan Store is <strong>free to start</strong> — they take a small commission on sales. When you&apos;re ready to scale, their paid plan removes the commission. For beginners, free is perfect.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'create-account',
    emoji: '✨',
    title: 'Create your free account',
    subtitle: 'Takes 5 minutes — you\'ll need an email and a profile photo',
    xp: 50,
    color: '#FEF9C3',
    borderColor: '#FDE68A',
    accentColor: '#CA8A04',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-[#3F3F46] leading-relaxed">
          Sign up through the link below — it takes about 5 minutes. Use the same email you use for Instagram so everything stays connected.
        </p>

        <ReferralButton />

        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA]">What to do during signup</p>
          {[
            { num: '1', text: 'Enter your email + create a password' },
            { num: '2', text: 'Choose your Stan Store username (use your brand name or @handle)' },
            { num: '3', text: 'Upload a profile photo — use your Instagram one so people recognise you' },
            { num: '4', text: 'Write one line about what you do (you can change this anytime)' },
            { num: '5', text: 'Connect your payment method so you can get paid' },
          ].map(step => (
            <div key={step.num} className="flex items-start gap-3 bg-[#FFFBEB] rounded-xl px-3 py-3 border border-[#FDE68A]">
              <div className="w-6 h-6 rounded-full bg-[#CA8A04] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {step.num}
              </div>
              <p className="text-sm text-[#713F12]">{step.text}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#FFF7ED] rounded-2xl p-4 border border-[#FED7AA]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#EA580C] mb-2">💗 Big sister note</p>
          <p className="text-sm text-[#7C2D12] leading-relaxed">
            Don&apos;t overthink the username — you can change it. Don&apos;t overthink the bio line — you can change it. Just get the account created and we&apos;ll set everything up in the next steps.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'setup-profile',
    emoji: '🎨',
    title: 'Set up your profile page',
    subtitle: 'Make it look like you — not like a blank template',
    xp: 50,
    color: '#EDE9FE',
    borderColor: '#C4B5FD',
    accentColor: '#7C3AED',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-[#3F3F46] leading-relaxed">
          Your Stan Store profile is the first thing people see when they click your bio link. Here&apos;s how to make it convert.
        </p>

        <div className="space-y-3">
          {[
            {
              icon: '🖼️',
              title: 'Profile photo',
              tip: 'Use the same photo as your Instagram. People need to recognise you instantly. A clear face photo works better than a logo for personal brands.',
            },
            {
              icon: '✍️',
              title: 'Your bio line',
              tip: 'One sentence: who you help + what you help them do. Example: "Helping women build their first Shopify brand from scratch."',
            },
            {
              icon: '🎨',
              title: 'Brand colour',
              tip: 'Pick the same primary colour you use on Instagram. Consistency = professionalism. Even just one matching colour makes a huge difference.',
            },
            {
              icon: '🔗',
              title: 'Custom URL',
              tip: 'Your Stan URL will be stan.store/yourusername — keep it clean and easy to say out loud (for when you mention it in videos).',
            },
          ].map(item => (
            <div key={item.title} className="bg-[#FAFAFA] rounded-2xl p-4 border border-[#E4E4E7]">
              <p className="text-sm font-bold text-[#18181B] mb-1">{item.icon} {item.title}</p>
              <p className="text-xs text-[#71717A] leading-relaxed">{item.tip}</p>
            </div>
          ))}
        </div>

        <CopySnippet
          label="Bio line template — copy and customise"
          text={`Helping [who your customer is] [what outcome you give them].
📦 [What your freebie is] → free below 👇`}
        />
      </div>
    ),
  },
  {
    id: 'add-freebie',
    emoji: '🎁',
    title: 'Add your first freebie',
    subtitle: 'A free resource that captures emails — your most valuable asset',
    xp: 75,
    color: '#F0FDF4',
    borderColor: '#BBF7D0',
    accentColor: '#16A34A',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-[#3F3F46] leading-relaxed">
          A freebie (also called a lead magnet) is something you give away for free in exchange for someone&apos;s email address. It&apos;s the foundation of your whole funnel. Without one, you&apos;re just hoping people come back. With one, you own their email forever.
        </p>

        {/* Freebie ideas */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-2">Freebie ideas that work</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { emoji: '📋', label: 'A checklist', desc: 'Easiest to make. 1 page in Canva.' },
              { emoji: '📄', label: 'A PDF guide', desc: '3–5 pages on one specific topic.' },
              { emoji: '🗂️', label: 'A template', desc: 'Canva template, Notion doc, spreadsheet.' },
              { emoji: '🎥', label: 'A mini video', desc: 'Record once, deliver automatically.' },
              { emoji: '📅', label: 'A content plan', desc: '30 days of captions or ideas.' },
              { emoji: '🛒', label: 'A swipe file', desc: 'Saved examples people can copy.' },
            ].map(f => (
              <div key={f.label} className="bg-white rounded-xl p-3 border border-[#E4E4E7]">
                <p className="text-base mb-1">{f.emoji}</p>
                <p className="text-xs font-bold text-[#18181B]">{f.label}</p>
                <p className="text-[10px] text-[#A1A1AA] mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How to add it */}
        <div className="bg-[#F0FDF4] rounded-2xl p-4 border border-[#BBF7D0]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#16A34A] mb-3">📲 How to add it in Stan Store</p>
          <ol className="space-y-2">
            {[
              'In your Stan dashboard, tap + Add Product',
              'Choose "Digital Download" or "Freebie / Lead Magnet"',
              'Upload your PDF or file',
              'Set the price to $0',
              'Write a short description: what it is + who it helps',
              'Add a product cover image (Canva has free templates)',
              'Publish — it goes live on your store page',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-[#14532D]">
                <span className="font-bold flex-shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="bg-[#FFF7ED] rounded-2xl p-4 border border-[#FED7AA]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#EA580C] mb-2">💗 Big sister note</p>
          <p className="text-sm text-[#7C2D12] leading-relaxed">
            Your freebie doesn&apos;t have to be a masterpiece. A one-page checklist you made in 30 minutes will convert better than a 50-page guide that took 3 months. Done beats perfect — especially here.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'add-paid-product',
    emoji: '💰',
    title: 'Add your first paid product',
    subtitle: 'Build once, sell forever — even while you sleep',
    xp: 75,
    color: '#FEF2F2',
    borderColor: '#FECACA',
    accentColor: '#DC2626',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-[#3F3F46] leading-relaxed">
          Now that you have a freebie to capture emails, add something people can pay for. Even a simple $27 PDF guide can become consistent passive income when your freebie is bringing in new leads every day.
        </p>

        {/* Pricing guidance */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-2">Starter pricing guide</p>
          <div className="space-y-2">
            {[
              { range: '$7–$17',  label: 'Impulse buy price',   desc: 'Short PDF, checklist pack, template. People buy without thinking.' },
              { range: '$27–$47', label: 'Sweet spot for beginners', desc: 'A solid guide or template bundle. Best starting price point.' },
              { range: '$67–$97', label: 'Premium guide price', desc: 'Comprehensive ebook or toolkit. Once you have reviews.' },
              { range: '$97+',   label: 'Mini-course price',   desc: 'Video lessons + workbook. Build this after your first few sales.' },
            ].map(tier => (
              <div key={tier.range} className="flex items-start gap-3 bg-[#FFF5F5] rounded-xl px-3 py-3 border border-[#FECACA]">
                <span className="text-sm font-black text-[#DC2626] flex-shrink-0 w-16">{tier.range}</span>
                <div>
                  <p className="text-xs font-bold text-[#18181B]">{tier.label}</p>
                  <p className="text-xs text-[#71717A] mt-0.5">{tier.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cover image tip */}
        <div className="bg-[#EDE9FE] rounded-2xl p-4 border border-[#C4B5FD]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED] mb-2">💜 Big sister advice</p>
          <p className="text-sm text-[#4C1D95] leading-relaxed">
            Your product cover image matters <em>a lot</em>. Search &quot;ebook mockup&quot; on Canva, pick a clean template, add your title and brand colour. A professional-looking cover makes people trust that the content inside is worth paying for.
          </p>
        </div>

        <div className="bg-[#F0F9FF] rounded-2xl p-4 border border-[#BAE6FD]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#0369A1] mb-3">📲 How to add it in Stan Store</p>
          <ol className="space-y-2">
            {[
              'Tap + Add Product → Digital Download',
              'Upload your PDF (or video, template, etc.)',
              'Write your product title: be specific about who it helps',
              'Write 3–5 bullet points of what they get',
              'Upload your product cover image from Canva',
              'Set your price',
              'Publish',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-[#0C4A6E]">
                <span className="font-bold flex-shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    ),
  },
  {
    id: 'setup-funnel',
    emoji: '⚡',
    title: 'Set up your funnel',
    subtitle: 'Connect your freebie to your paid product — this is where the magic happens',
    xp: 75,
    color: '#F0F9FF',
    borderColor: '#BAE6FD',
    accentColor: '#0369A1',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-[#3F3F46] leading-relaxed">
          A funnel just means the path someone takes from discovering you to buying from you. In Stan Store, your funnel is built by the order of products on your page and the upsell settings inside each product.
        </p>

        {/* Funnel visual */}
        <div className="bg-[#F0F9FF] rounded-2xl p-4 border border-[#BAE6FD] space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#0369A1] mb-3">Your funnel order</p>
          {[
            { step: '1', emoji: '🎁', label: 'Freebie at the TOP', desc: 'First thing people see. Captures their email.' },
            { step: '2', emoji: '💌', label: 'Automatic welcome email', desc: 'Stan sends this instantly when they sign up.' },
            { step: '3', emoji: '💰', label: 'Paid product below the freebie', desc: 'They see it after grabbing the freebie.' },
            { step: '4', emoji: '📧', label: 'Follow-up email sequence', desc: 'Nurture them toward buying. Set up in Stan.' },
          ].map(row => (
            <div key={row.step} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#0369A1] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {row.step}
              </div>
              <div>
                <p className="text-xs font-bold text-[#0C4A6E]">{row.emoji} {row.label}</p>
                <p className="text-[10px] text-[#0369A1] mt-0.5">{row.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <CopySnippet
          label="Your welcome email — copy and customise"
          text={`Subject: Here's your [freebie name]! 🎉

Hey [first name]!

Your [freebie name] is attached — I hope it helps you [main benefit].

A little about me: I'm [your name], and I help [your customer] with [what you do].

I'll be sending you [what they can expect — tips, behind the scenes, etc.] a couple of times a week.

If you ever have questions, just reply to this email. I read every one.

Talk soon,
[Your name] 💜

P.S. If you're ready to go deeper, check out [your paid product name] here: [link]`}
        />
      </div>
    ),
  },
  {
    id: 'link-instagram',
    emoji: '📱',
    title: 'Connect to Instagram',
    subtitle: 'Replace your bio link and start driving traffic to your store',
    xp: 100,
    color: '#EDE9FE',
    borderColor: '#C4B5FD',
    accentColor: '#7C3AED',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-[#3F3F46] leading-relaxed">
          Your Stan Store is only as powerful as the traffic going to it. Here&apos;s how to connect it to Instagram and start getting visitors.
        </p>

        {/* Bio link */}
        <div className="bg-[#EDE9FE] rounded-2xl p-4 border border-[#C4B5FD]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED] mb-3">Step 1 — Replace your bio link</p>
          <ol className="space-y-2">
            {[
              'Open Instagram → Edit profile',
              'In the "Website" field, delete whatever is there',
              'Paste your Stan Store URL: stan.store/yourusername',
              'Save. Done.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-[#4C1D95]">
                <span className="font-bold flex-shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* DM automation */}
        <div className="bg-[#FFF7ED] rounded-2xl p-4 border border-[#FED7AA]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#EA580C] mb-2">⚡ The DM automation trick</p>
          <p className="text-sm text-[#7C2D12] leading-relaxed mb-3">
            This is how creators get 100s of freebie downloads without running ads. You post content and say &quot;comment [keyword] below&quot; — Stan&apos;s ManyChat integration automatically DMs them your link.
          </p>
          <div className="space-y-2">
            {[
              { label: 'In your Reel caption', example: '"Comment GUIDE below and I\'ll DM you my free [topic] checklist 👇"' },
              { label: 'In your Stories', example: '"Reply with START and I\'ll send you the free download"' },
              { label: 'In your bio', example: '"DM me the word CEO for my free beginner guide"' },
            ].map(item => (
              <div key={item.label} className="bg-white rounded-xl p-3 border border-[#FDE68A]">
                <p className="text-[10px] font-bold text-[#92400E] uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-xs text-[#713F12] italic">{item.example}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Launch post */}
        <div className="bg-[#F0FDF4] rounded-2xl p-4 border border-[#BBF7D0]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#16A34A] mb-2">🚀 Your first launch post</p>
          <p className="text-sm text-[#14532D] leading-relaxed">
            Post a Reel or Story announcing your Stan Store is live. Show what&apos;s on it. Tell them what the freebie is. Tell them to click the link in your bio. Pin it to your profile.
          </p>
        </div>

        <CopySnippet
          label="Launch caption — copy and customise"
          text={`My Stan Store is officially LIVE 🎉

I've been working on this and I'm so excited to finally share it.

Right now you can grab my FREE [freebie name] — [what it helps with in one sentence].

👉 Link in bio → grab it for free

If you've been [pain point your audience has], this is going to help you so much.

Drop a 🙌 in the comments if you grabbed it!`}
        />
      </div>
    ),
  },
]

// ── Page ───────────────────────────────────────────────────────────────────────
export default function StanGuidePage() {
  const { profile, signOut } = useUser()
  const router = useRouter()
  const [completed, setCompleted]     = useState<Set<string>>(new Set())
  const [expanded, setExpanded]       = useState<string | null>('what-is-stan')
  const [userId, setUserId]           = useState<string | undefined>()

  // Grab user id from profile
  useEffect(() => { if (profile?.id) setUserId(profile.id) }, [profile?.id])

  // Load progress
  useEffect(() => {
    if (!userId) return
    try {
      const raw = localStorage.getItem(storageKey(userId))
      if (raw) setCompleted(new Set(JSON.parse(raw) as string[]))
    } catch { /* ignore */ }
  }, [userId])

  const markDone = (id: string) => {
    setCompleted(prev => {
      const next = new Set(Array.from(prev).concat(id))
      if (userId) {
        try { localStorage.setItem(storageKey(userId), JSON.stringify(Array.from(next))) } catch { /* ignore */ }
      }
      return next
    })
    const idx = LESSONS.findIndex(l => l.id === id)
    if (idx < LESSONS.length - 1) setExpanded(LESSONS[idx + 1].id)
  }

  const totalXP  = LESSONS.filter(l => completed.has(l.id)).reduce((s, l) => s + l.xp, 0)
  const maxXP    = LESSONS.reduce((s, l) => s + l.xp, 0)
  const xpPct    = Math.round((totalXP / maxXP) * 100)
  const allDone  = completed.size >= LESSONS.length

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar profile={profile} onSignOut={signOut} />

      <main className="flex-1 lg:pl-64 pb-24 lg:pb-8">
        <div className="max-w-2xl mx-auto px-4 py-0 md:py-8 md:px-8">

          {/* ── Hero header ── */}
          <div
            className="rounded-none md:rounded-2xl px-6 py-8 mb-6"
            style={{ background: '#18181B' }}
          >
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#FF6B35]/20 mb-4">
                <ShoppingBag className="w-3 h-3 text-[#FF8C42]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF8C42]">7 Missions</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2 leading-snug">
                Stan Store Setup Guide 🛍️
              </h1>
              <p className="text-[#71717A] text-sm mb-5 leading-relaxed">
                Stan Store is the #1 tool for turning your Instagram into a business. These 7 missions walk you through setup step-by-step — no tech skills needed.
              </p>

              {/* Referral CTA */}
              <div className="mb-5">
                <ReferralButton label="Get started free at Stan Store →" />
                <p className="text-center text-[10px] text-[#52525B] mt-2">Free to start · no credit card required</p>
              </div>

              {/* XP progress */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #FF6B35, #FF8C42)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <span className="text-xs font-bold text-[#FF8C42] flex-shrink-0">{totalXP} / {maxXP} XP</span>
              </div>
              <p className="text-[#52525B] text-[10px] mt-1.5">{completed.size} of {LESSONS.length} missions complete</p>
            </motion.div>
          </div>

          {/* ── Lessons ── */}
          <div className="px-4 md:px-0 space-y-3">

            {/* All done celebration */}
            {allDone && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl p-5 text-center border border-[#FED7AA]"
                style={{ background: '#FFF7ED' }}
              >
                <div className="text-4xl mb-2">🎉</div>
                <p className="text-[#7C2D12] font-bold text-base">Your Stan Store is officially set up!</p>
                <p className="text-[#92400E] text-sm mt-1 mb-4">You&apos;ve earned {totalXP} XP. Now go get your first freebie download.</p>
                <ReferralButton label="Open Stan Store →" />
              </motion.div>
            )}

            {LESSONS.map((lesson, i) => {
              const isDone     = completed.has(lesson.id)
              const isExpanded = expanded === lesson.id
              const isNext     = !isDone && LESSONS.findIndex(l => !completed.has(l.id)) === i

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border overflow-hidden shadow-sm"
                  style={{ borderColor: isNext ? lesson.borderColor : '#F0F0F0' }}
                >
                  {/* Mission header — tap to expand */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : lesson.id)}
                    className="w-full flex items-center gap-3 p-4 text-left"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                      style={{ background: isDone ? '#F0FDF4' : lesson.color }}
                    >
                      {isDone
                        ? <Check className="w-5 h-5 text-[#16A34A]" strokeWidth={2.5} />
                        : lesson.emoji}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={cn(
                          'text-sm font-bold',
                          isDone ? 'text-[#16A34A]' : 'text-[#18181B]'
                        )}>
                          Mission {i + 1}: {lesson.title}
                        </p>
                        {isNext && !isDone && (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-[#FF6B35] text-white px-2 py-0.5 rounded-full">
                            Up next
                          </span>
                        )}
                        {isDone && (
                          <span className="text-[9px] font-bold text-[#86EFAC]">+{lesson.xp} XP ✓</span>
                        )}
                      </div>
                      <p className="text-xs text-[#71717A] mt-0.5 leading-snug">{lesson.subtitle}</p>
                    </div>

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
                            {lesson.content}
                          </div>

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
              transition={{ delay: 0.5 }}
              className="py-6 space-y-3"
            >
              <ReferralButton label="Create your Stan Store for free →" />
              <p className="text-center text-xs text-[#A1A1AA]">
                Free to start · takes 5 minutes · link in your bio tonight
              </p>
            </motion.div>
          </div>

        </div>
      </main>

      <MobileNav />
    </div>
  )
}
