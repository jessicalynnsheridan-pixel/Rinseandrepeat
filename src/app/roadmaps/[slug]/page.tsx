'use client'


import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Check, Lock, ChevronDown, ChevronUp,
  Trophy, Clock, Zap, BookOpen, CheckSquare, PenLine,
  Plus, X, CheckCircle2,
  ShoppingBag, Monitor, Video, Briefcase, Link2, Leaf,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Sidebar } from '@/components/navigation/Sidebar'
import { MobileNav } from '@/components/navigation/MobileNav'
import { useUser } from '@/components/providers/UserProvider'
import {
  WORKSPACE_TEMPLATES,
  DEFAULT_WORKSPACE,
  useWorkspace,
  type WorkspaceField,
  type WorkspaceData,
} from '@/lib/workspace'

// ──────────────────────────────────────────
// Roadmap content data
// ──────────────────────────────────────────
const ROADMAP_DATA: Record<string, {
  icon: LucideIcon
  title: string
  description: string
  weeks: number
  difficulty: string
  phases: {
    name: string
    color: string
    milestones: {
      id: string
      title: string
      description: string
      xp: number
      locked: boolean
      completed: boolean
      checklist: string[]
      lesson: string
    }[]
  }[]
}> = {
  shopify: {
    icon: ShoppingBag,
    title: 'Start a Shopify Brand',
    description: 'Build a profitable e-commerce brand from scratch — from product research to your first $10K month.',
    weeks: 12,
    difficulty: 'Beginner',
    phases: [
      {
        name: 'Foundation',
        color: '#C4A264',
        milestones: [
          {
            id: 's1',
            title: 'Choose your niche',
            description: 'Pick a profitable niche you can build a brand around.',
            xp: 50,
            locked: false,
            completed: false,
            checklist: ['Research 5 potential niches', 'Check search volume on each', 'Validate with TikTok/Instagram', 'Choose your niche'],
            lesson: 'A good niche is specific, has buyers, and is something you can speak about authentically. Think: pet accessories for small dogs, women\'s fitness wear for curvy bodies, natural skincare for melanin-rich skin. The more specific, the less competition and the more loyal your customers.',
          },
          {
            id: 's2',
            title: 'Register your Canadian business',
            description: 'Make it official — register or incorporate through Ownr in under an hour.',
            xp: 75,
            locked: false,
            completed: false,
            checklist: [
              'Decide: sole proprietorship vs corporation',
              'Create an account at Ownr.co',
              'Register your business name or incorporate federally/provincially',
              'Download and save your official business documents',
              'Apply for a Business Number (BN) from the CRA at canada.ca',
              'Open a dedicated business bank account',
              'Set up a professional business email',
            ],
            lesson: 'In Canada, you have two main options: sole proprietorship (fast, low cost, minimal paperwork — great to start) or incorporation (more legal protection, better for growth and investors). For most beginners, starting as a sole proprietor is totally fine. Use Ownr.co — it walks you through the entire registration or incorporation process online in under an hour, no lawyer required. Once registered, get your Business Number (BN) from the CRA — you\'ll need it for taxes and business banking. Keep business and personal money completely separate from day one. For tax questions, speak with a Canadian accountant — rules vary by province.',
          },
          {
            id: 's3',
            title: 'Set up your Shopify store',
            description: 'Launch your store with the right settings from day one.',
            xp: 100,
            locked: false,
            completed: false,
            checklist: ['Start Shopify free trial', 'Choose and customize a theme', 'Add your brand colors and logo', 'Set up payment processing', 'Configure shipping settings', 'Add your return policy'],
            lesson: 'Use the Dawn or Debut theme to start — they\'re clean, fast, and convert well. Don\'t overthink the design. A simple, fast store beats a beautiful slow one every time. Your settings matter more than your aesthetics early on.',
          },
          {
            id: 's4',
            title: 'Source your first products',
            description: 'Find reliable suppliers and order samples before going live.',
            xp: 100,
            locked: false,
            completed: false,
            checklist: ['Research 3+ suppliers on Alibaba or CJ Dropshipping', 'Order samples from top 2', 'Evaluate quality and packaging', 'Negotiate pricing and MOQ', 'Place your first order'],
            lesson: 'Always order samples before bulk. Check supplier response time, reviews, and product photos. The quality of your packaging matters almost as much as the product — your unboxing is your first impression.',
          },
          {
            id: 's5',
            title: 'Build your brand identity with Canva',
            description: 'Logo, colors, fonts, and visuals — built in Canva for free.',
            xp: 75,
            locked: false,
            completed: false,
            checklist: [
              'Define 3 words that describe your brand feel',
              'Choose 2–3 brand colors and write down the hex codes',
              'Open Canva.com and search "minimalist logo" templates',
              'Customize your logo with your brand colors and font',
              'Set up a Canva Brand Kit (logo, colors, fonts saved)',
              'Create 3 reusable Instagram post templates',
              'Export your logo as PNG (for web) and SVG (for print)',
              'Write your brand story in 3–5 sentences',
            ],
            lesson: 'Canva is the tool to start with — it\'s free, beginner-friendly, and everything you need is in one place. Start with a simple logo using their free templates. Search "minimalist logo" for clean, professional options. Once your logo is done, set up a Brand Kit in Canva so your colors and fonts auto-apply to every new design. Create a few Instagram post templates while you\'re in there — this lets you batch your content in 30 minutes instead of starting from scratch each time. Your Canva Brand Kit will also be the source for your Stan Store cover images, product covers, and any PDFs or freebies you create.',
          },
        ],
      },
      {
        name: 'Launch',
        color: '#6C63FF',
        milestones: [
          {
            id: 'l1',
            title: 'Create your product listings',
            description: 'Write listings that convert browsers into buyers.',
            xp: 100,
            locked: true,
            completed: false,
            checklist: ['Write SEO product titles', 'Write benefit-focused descriptions', 'Take/edit professional product photos', 'Set pricing strategy', 'Add size guides if needed'],
            lesson: 'Your product title should include: what it is, who it\'s for, and a key benefit. Example: "Moisturizing Body Butter for Dry Skin — Shea & Vitamin E, Women\'s Daily Skincare". Lead with the benefit, not the feature.',
          },
          {
            id: 'l2',
            title: 'Set up your social media',
            description: 'Create Instagram and TikTok accounts for your brand.',
            xp: 50,
            locked: true,
            completed: false,
            checklist: ['Create Instagram business account', 'Create TikTok business account', 'Write optimized bios', 'Post 3 intro content pieces', 'Follow 50 accounts in your niche'],
            lesson: 'Post before you launch. Build an audience while you\'re still setting up. Even 200 engaged followers before launch day can lead to your first sales. Your content before launch is your pre-sale marketing.',
          },
          {
            id: 'l3',
            title: 'Launch your store',
            description: 'Go live and make your first sale.',
            xp: 200,
            locked: true,
            completed: false,
            checklist: ['Remove Shopify password page', 'Announce on all social platforms', 'Email your personal network', 'Run a launch discount (10-15%)', 'Post launch content every day for 7 days'],
            lesson: 'Your first sale will not come from strangers. It will come from someone who knows, likes, and trusts you. Tell everyone. Post about it everywhere. Text people directly. There is no shame in a public launch — only in staying hidden.',
          },
        ],
      },
      {
        name: 'Growth',
        color: '#16A34A',
        milestones: [
          {
            id: 'g1',
            title: 'Run your first paid ad',
            description: 'Start with Meta ads to drive consistent traffic.',
            xp: 150,
            locked: true,
            completed: false,
            checklist: ['Set up Meta Business Manager', 'Install Shopify Facebook Pixel', 'Create your first ad creative', 'Set $10/day test budget', 'Analyze results after 7 days'],
            lesson: 'Start with a $10/day budget on a single ad set. Test one variable at a time — image, copy, or audience. Never change multiple things at once or you won\'t know what moved the needle. Data after 7 days, then iterate.',
          },
          {
            id: 'g2',
            title: 'Build your email list',
            description: 'Email is your most valuable owned asset.',
            xp: 100,
            locked: true,
            completed: false,
            checklist: ['Set up Klaviyo (free up to 500)', 'Create a welcome popup with 10% discount', 'Write 3-email welcome sequence', 'Set up abandoned cart emails', 'Send weekly broadcast emails'],
            lesson: 'Email converts 3–5× better than social media. Every follower you earn should eventually land on your email list. Social platforms own your audience — your email list is yours forever.',
          },
        ],
      },
      {
        name: 'Scale',
        color: '#E5974A',
        milestones: [
          {
            id: 'sc1',
            title: 'Hit your first $5K month',
            description: 'Systems and consistency to reach $5K/mo revenue.',
            xp: 250,
            locked: true,
            completed: false,
            checklist: ['Optimize top 3 products', 'Scale winning ads to $50/day', 'Launch an upsell or bundle', 'Reach out to micro-influencers', 'Review and cut underperforming SKUs'],
            lesson: 'The jump from $1K to $5K is about doubling down on what works. Look at your data — what product has the best margin and conversion rate? Pour your energy and budget into that. Cut what isn\'t working without emotional attachment.',
          },
        ],
      },
    ],
  },
  digital: {
    icon: Monitor,
    title: 'Digital Product Business',
    description: 'Create and sell courses, ebooks, templates, and tools with near-zero overhead.',
    weeks: 8,
    difficulty: 'Beginner',
    phases: [
      {
        name: 'Foundation',
        color: '#C4A264',
        milestones: [
          {
            id: 'd1',
            title: 'Choose your digital product type',
            description: 'Pick the format that matches your skills and audience.',
            xp: 50,
            locked: false,
            completed: false,
            checklist: ['List your top 5 skills or knowledge areas', 'Research what sells in your niche', 'Choose: ebook, course, template, or toolkit', 'Validate with a poll or question box'],
            lesson: 'The fastest digital product to create is a PDF guide or template pack. Courses take longer but earn more. Done is better than perfect — start simple and upgrade later. You can always expand a guide into a course once you have buyers.',
          },
          {
            id: 'd2',
            title: 'Create your first product',
            description: 'Build it once, sell it forever.',
            xp: 150,
            locked: false,
            completed: false,
            checklist: ['Outline your product content', 'Create in Canva, Notion, or Google Docs', 'Design a professional cover', 'Export as PDF', 'Set your price ($27-$97 for beginners)'],
            lesson: 'Your first product doesn\'t need to be a masterpiece — it needs to solve one specific problem for one specific person. Outline first, then write, then design. In that order. The cover matters more than you think; it\'s your first impression.',
          },
          {
            id: 'd3',
            title: 'Set up your Stan Store',
            description: 'Your entire storefront, freebie funnel, and bio link — all in one place.',
            xp: 75,
            locked: false,
            completed: false,
            checklist: [
              'Create your Stan Store account at stan.store',
              'Add your first freebie or lead magnet (checklist, guide, or template)',
              'Upload your first paid digital product',
              'Set up a simple funnel: freebie → email capture → paid offer',
              'Replace your Instagram bio link with your Stan Store link',
              'Post a DM call-to-action: "comment GUIDE to get this free"',
              'Set up your payment info to receive payouts',
            ],
            lesson: 'Stan Store is the tool for Canadian creators and online business owners — free to start, and it handles payments, product delivery, email capture, and your bio link all in one place. Here\'s how the funnel works: someone finds you on Instagram → they see your content → they click your bio link → they download your free resource → they join your email list → eventually they buy your paid product. Always create a freebie first (a checklist, PDF guide, or Canva template). Then use Instagram DM automations like "comment GUIDE below" or "DM me the word START" to drive traffic into your Stan Store without paying for ads. This is the exact system that moves someone from a stranger seeing your Reel to a paying customer.',
          },
        ],
      },
      {
        name: 'Launch',
        color: '#6C63FF',
        milestones: [
          {
            id: 'dl1',
            title: 'Launch to your audience',
            description: 'Create urgency and make your first sales.',
            xp: 200,
            locked: true,
            completed: false,
            checklist: ['Write 5 launch posts', 'Create a launch reel or TikTok', 'Post daily for launch week', 'Add a limited-time bonus', 'Follow up with DMs to warm audience'],
            lesson: 'Your launch should feel like an event. Create anticipation 3–5 days before, reveal on launch day, then maintain momentum for a week. People buy from energy. The more excited you are, the more your audience will be.',
          },
        ],
      },
    ],
  },
  creator: {
    icon: Video,
    title: 'Content Creator Business',
    description: 'Build an engaged audience and monetize through brand deals, products, and memberships.',
    weeks: 10,
    difficulty: 'Beginner',
    phases: [
      {
        name: 'Foundation',
        color: '#C4A264',
        milestones: [
          {
            id: 'c1',
            title: 'Define your content niche',
            description: 'The riches are in the niches — get specific.',
            xp: 50,
            locked: false,
            completed: false,
            checklist: ['List what you could talk about for hours', 'Research 3 creators in your niche', 'Define your unique angle', 'Write your content mission statement'],
            lesson: 'You don\'t need to be the most expert person — you need to be the most relatable. "Business tips from a 23-year-old building her first brand" is more compelling than "business tips". Your perspective is your product.',
          },
          {
            id: 'c2',
            title: 'Set up your platforms',
            description: 'Start with 1-2 platforms and dominate them.',
            xp: 75,
            locked: false,
            completed: false,
            checklist: ['Choose your primary platform (TikTok or Instagram)', 'Optimize your bio with keywords', 'Choose a consistent username', 'Create a highlight cover set on Canva', 'Post your intro video'],
            lesson: 'TikTok grows faster for new creators. Instagram has better monetization once established. Pick one to go deep on first. Spreading thin across 5 platforms is how creators plateau at 1,000 followers.',
          },
        ],
      },
    ],
  },
  service: {
    icon: Briefcase,
    title: 'Service Business',
    description: 'Launch a consulting, freelance, or agency business.',
    weeks: 6,
    difficulty: 'Beginner',
    phases: [
      {
        name: 'Foundation',
        color: '#C4A264',
        milestones: [
          {
            id: 'sv1',
            title: 'Define your service offer',
            description: 'Get crystal clear on what you do, who you serve, and what they get.',
            xp: 75,
            locked: false,
            completed: false,
            checklist: ['List your top 3 marketable skills', 'Define your ideal client', 'Write your service offer in one sentence', 'Set your pricing (start at $500-$1500/project)', 'Create a simple service menu'],
            lesson: 'The more specific your offer, the easier it is to sell. "I help women-owned product brands grow on Instagram" beats "social media manager" every time. Specificity signals expertise.',
          },
          {
            id: 'sv2',
            title: 'Get your first client',
            description: 'Your network is your net worth — start there.',
            xp: 200,
            locked: false,
            completed: false,
            checklist: ['List 20 people who might need your service', 'Send 10 personalized DMs or emails', 'Offer a discounted first project', 'Ask for a testimonial when done', 'Raise your rates after first client'],
            lesson: 'Your first client will come from your existing network 90% of the time. Don\'t wait to build a following. Reach out to people you already know today. One warm yes beats 100 cold no\'s.',
          },
        ],
      },
    ],
  },
  affiliate: {
    icon: Link2,
    title: 'Affiliate Marketing',
    description: 'Build passive income streams by recommending products you love.',
    weeks: 6,
    difficulty: 'Beginner',
    phases: [
      {
        name: 'Foundation',
        color: '#C4A264',
        milestones: [
          {
            id: 'a1',
            title: 'Choose your affiliate niche',
            description: 'Pick products you genuinely use and believe in.',
            xp: 50,
            locked: false,
            completed: false,
            checklist: ['List products you use daily and love', 'Check if each has an affiliate program', 'Apply to 3–5 programs (Amazon.ca, LTK, ShareASale, brand-direct programs)', 'Choose your primary content platform', 'Create a content plan built around your products'],
            lesson: 'The most successful affiliates recommend products they actually use. Your audience can tell when you\'re chasing a commission. Authenticity converts — a genuine recommendation from a trusted voice outperforms any polished ad. For Canadians: Amazon.ca affiliate program, LTK (formerly Like to Know It), and direct brand affiliate programs all work in Canada. Always disclose affiliate relationships clearly — it\'s required by the Canadian Competition Bureau.',
          },
        ],
      },
    ],
  },
  medspa: {
    icon: Leaf,
    title: 'Med Spa / Wellness Business',
    description: 'Open and scale a beauty or wellness business.',
    weeks: 16,
    difficulty: 'Intermediate',
    phases: [
      {
        name: 'Foundation',
        color: '#C4A264',
        milestones: [
          {
            id: 'm1',
            title: 'Get licensed and legal in Canada',
            description: 'Understand the licensing requirements for your province and service type.',
            xp: 100,
            locked: false,
            completed: false,
            checklist: [
              'Research your province\'s esthetics and cosmetology licensing requirements',
              'Confirm if your services require a medical director or registered nurse',
              'Enroll in required training or certification programs',
              'Apply for a municipal business license',
              'Get professional liability insurance',
              'Register your business through Ownr.co (sole prop or corporation)',
              'Speak with a Canadian accountant about your business structure',
            ],
            lesson: 'Licensing for beauty and wellness businesses in Canada is governed provincially — the rules in Ontario, BC, and Alberta are all different. Check your provincial regulatory body (e.g. College of Nurses for medical aesthetics, provincial cosmetology board for esthetics). For medical treatments like injectables, a medical director or RN may be required regardless of province. For insurance, look at Intact Insurance, BFL Canada, or specialty wellness coverage providers. Register your business through Ownr.co — it handles provincial and federal incorporation online with no lawyer needed. Do not rely on US-based advice for Canadian licensing — always verify with your province directly.',
          },
        ],
      },
    ],
  },
}

// ──────────────────────────────────────────
// Brainstorm (chip) input
// ──────────────────────────────────────────
function BrainstormInput({
  field,
  value,
  onChange,
}: {
  field: WorkspaceField
  value: string[]
  onChange: (v: string[]) => void
}) {
  const [input, setInput] = useState('')

  const add = () => {
    const trimmed = input.trim()
    if (!trimmed || value.includes(trimmed)) return
    onChange([...value, trimmed])
    setInput('')
  }

  const remove = (item: string) => onChange(value.filter(v => v !== item))

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); add() }
    if (e.key === 'Backspace' && !input && value.length) remove(value[value.length - 1])
  }

  return (
    <div>
      {field.hint && (
        <p className="text-xs text-[#A1A1AA] mb-2">{field.hint}</p>
      )}
      <div className="min-h-[56px] w-full rounded-xl border border-[#E4E4E7] bg-white p-3 focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/10 transition-all">
        <div className="flex flex-wrap gap-1.5 mb-2">
          <AnimatePresence>
            {value.map(item => (
              <motion.span
                key={item}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EDE9FE] text-[#7C3AED] text-xs font-medium rounded-lg"
              >
                {item}
                <button
                  onClick={() => remove(item)}
                  className="ml-0.5 hover:text-[#5B21B6] transition-colors"
                  type="button"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder={field.placeholder}
            className="flex-1 text-sm text-[#18181B] placeholder:text-[#A1A1AA] bg-transparent outline-none"
          />
          <button
            onClick={add}
            disabled={!input.trim()}
            type="button"
            className="w-6 h-6 rounded-lg bg-[#7C3AED] text-white flex items-center justify-center disabled:opacity-30 transition-opacity flex-shrink-0"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────
// Single workspace field renderer
// ──────────────────────────────────────────
function WorkspaceFieldRenderer({
  field,
  data,
  onUpdate,
}: {
  field: WorkspaceField
  data: WorkspaceData
  onUpdate: (id: string, v: string | string[]) => void
}) {
  const value = data[field.id]

  return (
    <div>
      <label className="block text-xs font-semibold text-[#52525B] mb-1.5 uppercase tracking-wider">
        {field.label}
      </label>

      {field.type === 'brainstorm' && (
        <BrainstormInput
          field={field}
          value={(value as string[] | undefined) ?? []}
          onChange={v => onUpdate(field.id, v)}
        />
      )}

      {field.type === 'textarea' && (
        <div>
          {field.hint && <p className="text-xs text-[#A1A1AA] mb-2">{field.hint}</p>}
          <textarea
            value={(value as string | undefined) ?? ''}
            onChange={e => onUpdate(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="w-full rounded-xl border border-[#E4E4E7] bg-white px-3 py-2.5 text-sm text-[#18181B] placeholder:text-[#A1A1AA] outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 transition-all resize-none leading-relaxed"
          />
        </div>
      )}

      {field.type === 'text' && (
        <div>
          {field.hint && <p className="text-xs text-[#A1A1AA] mb-2">{field.hint}</p>}
          <input
            type="text"
            value={(value as string | undefined) ?? ''}
            onChange={e => onUpdate(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="w-full rounded-xl border border-[#E4E4E7] bg-white px-3 py-2.5 text-sm text-[#18181B] placeholder:text-[#A1A1AA] outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 transition-all"
          />
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────
// Workspace section
// ──────────────────────────────────────────
function WorkspaceSection({ milestoneId, userId }: { milestoneId: string; userId?: string }) {
  const { data, update, saveState } = useWorkspace(milestoneId, userId)
  const fields = WORKSPACE_TEMPLATES[milestoneId] ?? DEFAULT_WORKSPACE

  const hasContent = Object.values(data).some(v =>
    Array.isArray(v) ? v.length > 0 : Boolean(v)
  )

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PenLine className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#7C3AED]">
            Founder Workspace
          </span>
        </div>
        <AnimatePresence>
          {saveState !== 'idle' && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                'text-[10px] font-medium',
                saveState === 'saving' ? 'text-[#A1A1AA]' : 'text-[#16A34A]'
              )}
            >
              {saveState === 'saving' ? 'Saving…' : '✓ Saved'}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Empty state nudge */}
      {!hasContent && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-[#FAFAFA] border border-dashed border-[#E4E4E7]">
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            This is your founder workspace. Capture ideas, decisions, and notes as you work through this step — it auto-saves and stays with your roadmap.
          </p>
        </div>
      )}

      {/* Fields */}
      <div className="space-y-5">
        {fields.map(field => (
          <WorkspaceFieldRenderer
            key={field.id}
            field={field}
            data={data}
            onUpdate={update}
          />
        ))}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────
// XP celebration toast
// ──────────────────────────────────────────
function XPToast({ xp, onDone }: { xp: number; onDone: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onAnimationComplete={() => setTimeout(onDone, 1800)}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-elevated"
      style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)' }}
    >
      <Check className="w-3.5 h-3.5 text-[#EDE9FE]" strokeWidth={2.5} />
      <span className="text-white font-medium text-sm">Step complete</span>
      <span className="text-[#A1A1AA] text-xs">+{xp} XP</span>
    </motion.div>
  )
}

// ──────────────────────────────────────────
// Step card
// ──────────────────────────────────────────
type StepTab = 'lesson' | 'tasks' | 'workspace'

function StepCard({
  milestone,
  index,
  phaseColor,
  isCompleted,
  savedChecklist,
  onComplete,
  onChecklistChange,
  userId,
}: {
  milestone: (typeof ROADMAP_DATA)['shopify']['phases'][0]['milestones'][0]
  index: number
  phaseColor: string
  isCompleted: boolean
  savedChecklist: Record<number, boolean>
  onComplete: () => void
  onChecklistChange: (itemIndex: number, value: boolean) => void
  userId?: string
}) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<StepTab>('lesson')
  // Initialise from parent-provided persisted state
  const [checked, setChecked] = useState<Record<number, boolean>>(savedChecklist)
  const [completed, setCompleted] = useState(isCompleted)

  // Sync if parent state changes (e.g. after localStorage loads)
  useEffect(() => { setCompleted(isCompleted) }, [isCompleted])
  useEffect(() => { setChecked(savedChecklist) }, [milestone.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const [celebrating, setCelebrating] = useState(false)

  const completedCount = Object.values(checked).filter(Boolean).length
  const totalCount = milestone.checklist.length
  const progress = Math.round((completedCount / totalCount) * 100)
  const allDone = completedCount === totalCount

  const toggleItem = (i: number) => {
    if (milestone.locked || completed) return
    const newValue = !checked[i]
    setChecked(prev => ({ ...prev, [i]: newValue }))
    onChecklistChange(i, newValue)
  }

  const markComplete = () => {
    setCompleted(true)
    setCelebrating(true)
    setOpen(false)
    onComplete()
  }

  const TABS = [
    { id: 'lesson' as StepTab, label: 'Lesson', icon: BookOpen },
    { id: 'tasks' as StepTab, label: `Tasks`, icon: CheckSquare, badge: `${completedCount}/${totalCount}` },
    { id: 'workspace' as StepTab, label: 'Workspace', icon: PenLine },
  ]

  return (
    <>
      <AnimatePresence>
        {celebrating && (
          <XPToast xp={milestone.xp} onDone={() => setCelebrating(false)} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06 }}
        className={cn(
          'rounded-2xl border transition-all duration-200',
          completed
            ? 'bg-white border-[#F4F4F5]'
            : 'bg-white border-[#F4F4F5] hover:border-[#A1A1AA]',
          milestone.locked && 'opacity-40'
        )}
      >
        {/* ── Card header ── */}
        <button
          onClick={() => !milestone.locked && setOpen(o => !o)}
          className="w-full flex items-start gap-4 p-5 text-left"
        >
          {/* Step indicator */}
          <div className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border transition-all',
            completed ? 'bg-[#18181B] border-[#18181B]' : milestone.locked ? 'border-[#E4E4E7] bg-transparent' : 'border-[#A1A1AA] bg-transparent'
          )}>
            {completed ? (
              <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            ) : milestone.locked ? (
              <Lock className="w-3 h-3 text-[#A1A1AA]" />
            ) : (
              <span className="text-[10px] font-semibold text-[#A1A1AA]">{index + 1}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className={cn(
                  'font-semibold text-sm leading-snug',
                  completed ? 'text-[#A1A1AA]' : milestone.locked ? 'text-[#A1A1AA]' : 'text-[#18181B]'
                )}>
                  {milestone.title}
                </h3>
                <p className="text-xs text-[#A1A1AA] mt-0.5 leading-relaxed">{milestone.description}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                <span className="text-[10px] text-[#A1A1AA]">+{milestone.xp} XP</span>
                {!milestone.locked && (
                  open
                    ? <ChevronUp className="w-4 h-4 text-[#A1A1AA]" />
                    : <ChevronDown className="w-4 h-4 text-[#A1A1AA]" />
                )}
              </div>
            </div>

            {/* Progress strip */}
            {!milestone.locked && !completed && (
              <div className="flex items-center gap-2 mt-2.5">
                <div className="flex-1 h-1 bg-[#F4F4F5] rounded-full overflow-hidden max-w-[80px]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, backgroundColor: '#7C3AED' }}
                  />
                </div>
                <span className="text-[10px] text-[#A1A1AA]">{completedCount}/{totalCount}</span>
              </div>
            )}
          </div>
        </button>

        {/* ── Expanded body ── */}
        <AnimatePresence>
          {open && !milestone.locked && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="border-t border-[#F4F4F5]">
                {/* Tab bar */}
                <div className="flex gap-0 border-b border-[#F4F4F5] px-1">
                  {TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-4 py-3 text-xs font-semibold transition-all border-b-2 -mb-px',
                        activeTab === tab.id
                          ? 'text-[#7C3AED] border-[#7C3AED]'
                          : 'text-[#A1A1AA] border-transparent hover:text-[#52525B]'
                      )}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                      {tab.badge && (
                        <span className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                          activeTab === tab.id ? 'bg-[#EDE9FE] text-[#7C3AED]' : 'bg-[#F4F4F5] text-[#A1A1AA]'
                        )}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="p-5">
                  <AnimatePresence mode="wait">
                    {/* ── Lesson ── */}
                    {activeTab === 'lesson' && (
                      <motion.div
                        key="lesson"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7]">
                          <BookOpen className="w-4 h-4 text-[#8B5CF6] flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-[#3F3F46] leading-relaxed">{milestone.lesson}</p>
                        </div>
                        <button
                          onClick={() => setActiveTab('tasks')}
                          className="mt-4 w-full py-2.5 rounded-xl border border-[#E4E4E7] text-sm font-medium text-[#7C3AED] hover:bg-[#EDE9FE] transition-all flex items-center justify-center gap-2"
                        >
                          <CheckSquare className="w-4 h-4" />
                          View tasks →
                        </button>
                      </motion.div>
                    )}

                    {/* ── Tasks ── */}
                    {activeTab === 'tasks' && (
                      <motion.div
                        key="tasks"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="space-y-2">
                          {milestone.checklist.map((item, i) => (
                            <motion.button
                              key={i}
                              onClick={() => toggleItem(i)}
                              whileTap={{ scale: 0.98 }}
                              className={cn(
                                'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all',
                                checked[i]
                                  ? 'bg-[#FAFAFA]'
                                  : 'hover:bg-[#FAFAFA]'
                              )}
                            >
                              <div className={cn(
                                'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200',
                                checked[i] ? 'bg-[#18181B] border-[#18181B]' : 'border-[#D1D0CC]'
                              )}>
                                {checked[i] && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 500 }}
                                  >
                                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                  </motion.div>
                                )}
                              </div>
                              <span className={cn(
                                'text-sm font-medium transition-all',
                                checked[i] ? 'text-[#A1A1AA] line-through' : 'text-[#3F3F46]'
                              )}>
                                {item}
                              </span>
                            </motion.button>
                          ))}
                        </div>

                        {/* Mark complete CTA */}
                        <AnimatePresence>
                          {allDone && !completed && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="mt-4"
                            >
                              <button
                                onClick={markComplete}
                                className="w-full py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 shadow-glow transition-all hover:opacity-90 active:scale-[0.98]"
                                style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)' }}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Complete step · +{milestone.xp} XP
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {completed && (
                          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#A1A1AA]">
                            <CheckCircle2 className="w-4 h-4" />
                            Step completed · +{milestone.xp} XP earned
                          </div>
                        )}

                        {!allDone && !completed && (
                          <p className="mt-3 text-xs text-[#A1A1AA] text-center">
                            {totalCount - completedCount} task{totalCount - completedCount !== 1 ? 's' : ''} left
                          </p>
                        )}
                      </motion.div>
                    )}

                    {/* ── Workspace ── */}
                    {activeTab === 'workspace' && (
                      <motion.div
                        key="workspace"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ duration: 0.15 }}
                      >
                        <WorkspaceSection milestoneId={milestone.id} userId={userId} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}

// ──────────────────────────────────────────
// Page
// ──────────────────────────────────────────
export default function RoadmapDetailPage() {
  const { user, profile, signOut } = useUser()
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [activePhase, setActivePhase] = useState(0)

  // ── Per-user progress state, persisted in localStorage ─────────────
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [checklists, setChecklists] = useState<Record<string, Record<number, boolean>>>({})

  useEffect(() => {
    if (!user?.id) return
    try {
      const raw = localStorage.getItem(`${user.id}_roadmap_${slug}_v1`)
      if (raw) {
        const saved = JSON.parse(raw)
        setCompletedIds(new Set(saved.completed ?? []))
        setChecklists(saved.checklists ?? {})
      }
    } catch { /* ignore */ }
  }, [user?.id, slug])

  const saveProgress = useCallback((ids: Set<string>, lists: Record<string, Record<number, boolean>>) => {
    if (!user?.id) return
    try {
      localStorage.setItem(`${user.id}_roadmap_${slug}_v1`, JSON.stringify({
        completed: Array.from(ids),
        checklists: lists,
      }))
    } catch { /* ignore */ }
  }, [user?.id, slug])

  const handleComplete = useCallback((milestoneId: string) => {
    setCompletedIds(prev => {
      const next = new Set(prev)
      next.add(milestoneId)
      saveProgress(next, checklists)
      return next
    })
  }, [checklists, saveProgress])

  const handleChecklistChange = useCallback((milestoneId: string, itemIndex: number, value: boolean) => {
    setChecklists(prev => {
      const next = { ...prev, [milestoneId]: { ...prev[milestoneId], [itemIndex]: value } }
      saveProgress(completedIds, next)
      return next
    })
  }, [completedIds, saveProgress])

  const roadmap = ROADMAP_DATA[slug]

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#A1A1AA] mb-4">Roadmap not found.</p>
          <button onClick={() => router.push('/roadmaps')} className="btn-primary">
            Back to Roadmaps
          </button>
        </div>
      </div>
    )
  }

  const allMilestones = roadmap.phases.flatMap(p => p.milestones)
  // Use real per-user progress, not static mock data
  const completedCount = allMilestones.filter(m => completedIds.has(m.id)).length
  const totalCount = allMilestones.length
  const progressPct = Math.round((completedCount / totalCount) * 100)
  const totalXP = allMilestones.reduce((sum, m) => sum + m.xp, 0)

  const currentPhase = roadmap.phases[activePhase]

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar profile={profile} onSignOut={signOut} />

      <div className="lg:pl-64 pb-20 lg:pb-8">
        {/* Sticky header */}
        <div className="sticky top-0 z-30 bg-white border-b border-[#F4F4F5] px-4 md:px-6 py-3.5">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <button
              onClick={() => router.push('/roadmaps')}
              className="w-8 h-8 rounded-xl border border-[#E4E4E7] flex items-center justify-center hover:bg-[#EDE9FE] transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-[#71717A]" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <roadmap.icon className="w-4 h-4 text-[#71717A] flex-shrink-0" strokeWidth={1.5} />
                <h1 className="font-display text-sm font-bold text-[#18181B] truncate">{roadmap.title}</h1>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-20 h-1 bg-[#E4E4E7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#7C3AED] rounded-full transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#A1A1AA]">{progressPct}%</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-[#A1A1AA] flex-shrink-0">
              <Trophy className="w-3.5 h-3.5 text-[#C4A264]" />
              {completedCount}/{totalCount}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">
          {/* Hero card */}
          <div className="bg-white rounded-2xl border border-[#F4F4F5] shadow-card p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] flex items-center justify-center flex-shrink-0">
                <roadmap.icon className="w-5 h-5 text-[#7C3AED]" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-xl font-bold text-[#18181B] mb-1">{roadmap.title}</h2>
                <p className="text-sm text-[#71717A] leading-relaxed">{roadmap.description}</p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FAFAFA] text-[#52525B]">
                    <Clock className="w-3 h-3" />{roadmap.weeks} weeks
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FAFAFA] text-[#52525B]">
                    <Trophy className="w-3 h-3" />{totalCount} steps
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#EDE9FE] text-[#7C3AED]">
                    <Zap className="w-3 h-3" />{totalXP} XP total
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FAFAFA] text-[#52525B]">
                    {roadmap.difficulty}
                  </span>
                </div>
              </div>
            </div>
            <ProgressBar value={progressPct} showPercent label="Overall progress" color="gold" size="md" />
          </div>

          {/* Phase tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {roadmap.phases.map((phase, i) => {
              const phaseDone = phase.milestones.filter(m => completedIds.has(m.id)).length
              const phaseTotal = phase.milestones.length
              return (
                <button
                  key={phase.name}
                  onClick={() => setActivePhase(i)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0',
                    activePhase === i
                      ? 'bg-[#18181B] text-white shadow-card'
                      : 'bg-white border border-[#F4F4F5] text-[#71717A] hover:border-[#A1A1AA]'
                  )}
                >
                  {phase.name}
                  <span className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full',
                    activePhase === i ? 'bg-white/15 text-white/80' : 'bg-[#FAFAFA] text-[#A1A1AA]'
                  )}>
                    {phaseDone}/{phaseTotal}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Step cards */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#A1A1AA]">
              {currentPhase.name} · {currentPhase.milestones.length} steps
            </p>
            {currentPhase.milestones.map((milestone, i) => (
              <StepCard
                key={milestone.id}
                milestone={milestone}
                index={i}
                phaseColor={currentPhase.color}
                isCompleted={completedIds.has(milestone.id)}
                savedChecklist={checklists[milestone.id] ?? {}}
                onComplete={() => handleComplete(milestone.id)}
                onChecklistChange={(idx, val) => handleChecklistChange(milestone.id, idx, val)}
                userId={user?.id}
              />
            ))}
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  )
}
