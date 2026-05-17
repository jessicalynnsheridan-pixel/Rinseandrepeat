'use client'


import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Star, Lock, FileText, Layout, CheckSquare,
  MessageSquare, Bot, Palette, Mail, Truck, BookOpen,
  X, Copy, Check, Clock, Users, ChevronDown, ChevronUp,
  Lightbulb, Sparkles, ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sidebar } from '@/components/navigation/Sidebar'
import { MobileNav } from '@/components/navigation/MobileNav'
import { useUser } from '@/components/providers/UserProvider'
import type { LucideIcon } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = 'all' | 'template' | 'checklist' | 'script' | 'prompt' | 'guide' | 'email' | 'branding' | 'supplier'

interface Section {
  title: string
  type: 'checklist' | 'template' | 'scripts' | 'list' | 'tips'
  intro?: string
  items?: string[]
  body?: string
}

interface Resource {
  id: string
  title: string
  tagline: string
  preview: string
  creatorNote: string
  whyItWorks: string
  bestFor: string[]
  estimatedTime: string
  usedBy: number
  category: Category
  tier: 'free' | 'pro' | 'ceo'
  tags: string[]
  featured: boolean
  sections: Section[]
}

// ─── Category config ─────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; icon: LucideIcon }> = {
  all:       { label: 'All',        icon: BookOpen },
  template:  { label: 'Templates',  icon: Layout },
  checklist: { label: 'Checklists', icon: CheckSquare },
  script:    { label: 'Scripts',    icon: MessageSquare },
  prompt:    { label: 'AI Prompts', icon: Bot },
  guide:     { label: 'Guides',     icon: FileText },
  email:     { label: 'Email',      icon: Mail },
  branding:  { label: 'Branding',   icon: Palette },
  supplier:  { label: 'Suppliers',  icon: Truck },
}

// ─── Resource data ────────────────────────────────────────────────────────────

const RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'Shopify Brand Launch Checklist',
    tagline: '78 steps from zero to first sale  -  nothing missed.',
    preview: 'The most common mistake is skipping the marketing setup section. This checklist is sequenced so you never have to backtrack.',
    creatorNote: 'We built this from 200+ successful Shopify launches. The marketing setup section is where most founders fall short  -  do not skip it.',
    whyItWorks: 'Sequenced by dependencies, so every step is ready before the next one needs it. No backtracking, no forgotten passwords on launch day.',
    bestFor: ['First Shopify store', 'Launch week prep', 'Pre-launch audit'],
    estimatedTime: '3–4 hrs',
    usedBy: 4820,
    category: 'checklist',
    tier: 'free',
    tags: ['shopify', 'launch'],
    featured: true,
    sections: [
      {
        title: 'Domain & Branding',
        type: 'checklist',
        items: [
          'Purchase your domain name',
          'Set up branded email (hello@yourbrand.com)',
          'Create your logo (Canva or Fiverr)',
          'Define 2–3 brand colors + write them down as hex codes',
          'Choose 2 fonts: one display, one body',
          'Write your brand story in 3–5 sentences',
        ],
      },
      {
        title: 'Shopify Store Setup',
        type: 'checklist',
        items: [
          'Start Shopify free trial',
          'Connect your custom domain',
          'Install Dawn or Debut theme (clean, fast, converts)',
          'Set brand colors and fonts in theme editor',
          'Add logo to header, set favicon',
          'Configure your store currency and timezone',
        ],
      },
      {
        title: 'Products & Listings',
        type: 'checklist',
        items: [
          'Write SEO-optimized product titles (what + who + benefit)',
          'Write benefit-led descriptions (outcome first, features second)',
          'Upload min 3 professional product photos per SKU',
          'Set pricing and compare-at price for perceived value',
          'Enable inventory tracking',
          'Create collections and tag products',
        ],
      },
      {
        title: 'Payment & Shipping',
        type: 'checklist',
        items: [
          'Enable Shopify Payments (available in Canada  -  no third-party processor needed)',
          'Enable PayPal express checkout',
          'Configure shipping rates and zones (set up Canada Post integration)',
          'Set free shipping threshold ($75 CAD+ converts well for Canadian stores)',
          'Write and publish return/refund policy',
          'Add Terms of Service and Privacy Policy pages',
        ],
      },
      {
        title: 'Marketing Setup',
        type: 'checklist',
        items: [
          'Create Instagram business account',
          'Create TikTok business account',
          'Write bio with link-in-bio for both (use Stan Store link or Linktree)',
          'Install Meta Pixel via Shopify integration',
          'Set up Google Analytics 4',
          'Install Klaviyo or Omnisend (free up to 500 subscribers)',
          'Create welcome popup: 10% off or a free gift for email signup',
          'Write 3-email welcome sequence before launch',
        ],
      },
      {
        title: 'Launch Week',
        type: 'checklist',
        items: [
          'Remove Shopify password page',
          'Test checkout flow end-to-end with a real card',
          'Set up abandoned cart recovery email',
          'Prepare 5–7 launch posts in advance',
          'Announce on every platform on launch day',
          'Personally text 20 people in your network',
          'Post 1x per day for 7 days straight',
          'Respond to every comment and DM within 2 hours',
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'Instagram Bio Template Pack',
    tagline: '15 fill-in-the-blank bios that actually convert.',
    preview: 'Your bio has 5 seconds to earn a follow. These templates are built on proven copywriting structures  -  not generic advice.',
    creatorNote: 'We tested 50+ bio formats. The ones that drive the most link-in-bio clicks all have one thing in common: they lead with the reader\'s outcome, not your credentials.',
    whyItWorks: 'Each template is built on a proven copywriting framework. Fill in the blanks, and the structure does the persuasion work for you.',
    bestFor: ['New accounts', 'Rebranding', 'Improving click-through'],
    estimatedTime: '15 min',
    usedBy: 3200,
    category: 'template',
    tier: 'free',
    tags: ['instagram', 'branding'],
    featured: true,
    sections: [
      {
        title: 'Product Brand Bios',
        type: 'scripts',
        intro: 'Copy, fill in the brackets, and test for 2 weeks.',
        items: [
          '[Brand] for women who [desired outcome]\n[Product] that [key benefit]\nShop the collection ↓\n[your link]',
          'Loved by [X]K+ women\n[Product type] made for [target audience]\nFree shipping on orders $[X]+\n[your link]',
          'The only [product] made for [specific audience]\n[Key differentiator in 1 line]\n[CTA] ↓\n[your link]',
        ],
      },
      {
        title: 'Service Business Bios',
        type: 'scripts',
        items: [
          'Helping [target client] achieve [specific result]\n[Service type] · [Location or "Worldwide"]\nBook a free call ↓\n[your link]',
          '[Job title] & founder of [Brand]\n[X] clients · [one notable result]\nDM "START" to get started\n[your link]',
        ],
      },
      {
        title: 'Creator & Personal Brand Bios',
        type: 'scripts',
        items: [
          'I help [audience] [accomplish specific thing]\n[Content format] every [frequency]\nFree [lead magnet] ↓\n[your link]',
          '[Fun descriptor] + [profession]\nBuilding [what] in public\n[Current project or obsession]\n[your link]',
        ],
      },
      {
        title: 'Pro Tips for Better Bios',
        type: 'tips',
        items: [
          'Keep it under 150 characters  -  bios get cut off on mobile',
          'Use line breaks for scannability  -  short lines convert better',
          'Last line should always be a clear CTA with your link',
          'Update your link every time you launch something new',
          'Test different bios monthly and check your link-click analytics',
        ],
      },
    ],
  },
  {
    id: '3',
    title: '100 AI Prompts for Business Owners',
    tagline: 'Stop starting from scratch. Steal these instead.',
    preview: 'ChatGPT and Claude prompts for content, strategy, email, and ops  -  organized by the exact moment you need them.',
    creatorNote: 'Generic prompts get generic output. Every prompt here is written to give AI enough context to actually be useful. The difference is specificity.',
    whyItWorks: 'Each prompt includes the who, what, and context variables that AI needs to generate results worth using. Most prompts fail because they\'re too vague.',
    bestFor: ['Content batching', 'Strategy sessions', 'Customer research'],
    estimatedTime: '5 min to copy',
    usedBy: 6100,
    category: 'prompt',
    tier: 'pro',
    tags: ['ai', 'content', 'strategy'],
    featured: true,
    sections: [
      {
        title: 'Content Creation',
        type: 'scripts',
        intro: 'Fill in the brackets, paste into ChatGPT or Claude.',
        items: [
          'Write 10 Instagram caption hooks for a [product/niche] brand targeting [audience]. Each hook should be under 12 words and create curiosity without clickbait.',
          'Create a 30-day content calendar for a [business type] with 3 posts per week. Mix: 40% educational, 30% personal/story, 30% product/offer.',
          'I sell [product/service] to [audience]. Give me 15 TikTok video ideas under 60 seconds that a beginner creator could film at home.',
          'Rewrite this caption to sound more confident and premium: [paste caption]. Keep the core message but remove hesitant language.',
          'Generate 10 "before and after" content concepts for my [product/service]. Each should show a transformation the audience actually wants.',
        ],
      },
      {
        title: 'Email Marketing',
        type: 'scripts',
        items: [
          'Write a 3-email welcome sequence for someone who signed up for [lead magnet]. Email 1: deliver the goods + brand intro. Email 2: story + value. Email 3: soft offer.',
          'Create an abandoned cart email that feels like it\'s from a real person, not a robot. Product: [product]. Tone: [warm/direct/playful].',
          'Write a re-engagement email for subscribers who haven\'t opened in 60 days. Make it feel like a genuine check-in, not a desperation pitch.',
        ],
      },
      {
        title: 'Strategy & Planning',
        type: 'scripts',
        items: [
          'I sell [product/service] to [audience]. What are 5 underused marketing channels I should test? Explain why each fits my specific business.',
          'Create a 90-day growth plan for a [business type] at [current revenue]/mo. Goal: [target]. Include weekly focus areas and key milestones.',
          'What are the 3 highest-leverage activities for a [stage] founder this month? I currently spend most of my time on [current focus].',
        ],
      },
      {
        title: 'Customer Research',
        type: 'scripts',
        items: [
          'Write 10 survey questions to understand why customers buy from me vs competitors. I sell [product] to [audience].',
          'Create an ideal customer avatar for [product/niche]. Include: demographics, psychographics, top 3 fears, top 3 desires, where they spend time online.',
          'List 8 objections [target customer] would have before buying [product], then write a rebuttal for each that feels like a real conversation.',
        ],
      },
    ],
  },
  {
    id: '4',
    title: 'Cold DM Script Pack',
    tagline: '5 scripts that opened $50K+ in service contracts.',
    preview: 'The first message is the hardest part. These scripts lead with the reader\'s situation  -  not your pitch  -  which is why they work.',
    creatorNote: 'The #1 mistake in cold DMs: leading with yourself. Every script here leads with something specific about the recipient. That\'s the whole game.',
    whyItWorks: 'Each script opens with genuine curiosity or a specific observation  -  not a pitch. People respond to people who notice them, not people who need something from them.',
    bestFor: ['Service businesses', 'Freelancers', 'Getting first clients'],
    estimatedTime: '10 min to personalize',
    usedBy: 2900,
    category: 'script',
    tier: 'pro',
    tags: ['outreach', 'clients', 'dms'],
    featured: false,
    sections: [
      {
        title: 'The Genuine Compliment Open',
        type: 'template',
        intro: 'Best for: warm-ish leads who you\'ve actually followed for a while.',
        body: `Hey [Name]  -  I've been following your content and genuinely love [specific thing]. The way you [specific detail] is something I rarely see in this space.

I work with [type of business] helping them [specific result]. I noticed [specific opportunity in their account].

Would love to share a quick idea  -  would that be okay?`,
      },
      {
        title: 'The Direct Value Offer',
        type: 'template',
        intro: 'Best for: cold outreach when you have a specific, demonstrable insight.',
        body: `Hi [Name],

I help [target client type] achieve [specific result]  -  usually within [timeframe].

I looked at your [profile/website] and spotted 3 things that could [improvement]. I won't pitch you anything  -  I'd just love to share them in a voice note. Would that be helpful?`,
      },
      {
        title: 'The Problem-First Opener',
        type: 'template',
        intro: 'Best for: when you know the exact pain point your ideal client has.',
        body: `[Name]  -  quick question. Is [specific pain point] something you're currently dealing with?

I ask because I work with [business type] on exactly this  -  and most tell me [common feeling/frustration].

Not pitching anything. Just curious if it resonates.`,
      },
      {
        title: 'The Follow-Up (After No Reply)',
        type: 'template',
        intro: 'Send this 4–5 days after the first message. Then move on.',
        body: `Hey [Name]  -  circling back on this. Totally understand if the timing isn't right.

I just [new thing / recently helped a similar client] and thought of you.

Even if you're not looking for [service] right now, happy to share the resource free  -  no strings.`,
      },
      {
        title: 'DM Rules That Actually Work',
        type: 'tips',
        items: [
          'Never pitch in the first message  -  curiosity converts, selling repels',
          'Always reference something specific about them (shows you actually looked)',
          'Voice notes on Instagram convert 3× better than text',
          'Follow up once after 4–5 days, then move on gracefully',
          'Warm > cold  -  engage with their content for a week first if possible',
        ],
      },
    ],
  },
  {
    id: '5',
    title: 'Brand Identity Workbook',
    tagline: 'Build a brand people feel before they read a single word.',
    preview: 'Colors, fonts, voice, and visual style  -  structured as a 5-step exercise, not a boring design theory lecture.',
    creatorNote: 'Most brand guides overcomplicate this. A brand is just 3 adjectives, consistently applied. Everything in this guide helps you make those 3 words real across every touchpoint.',
    whyItWorks: 'Constraints breed consistency. The 3-adjective rule gives you a filter for every design, copy, and business decision  -  so your brand compounds instead of drifting.',
    bestFor: ['Pre-launch brand building', 'Rebranding', 'Inconsistent brand feel'],
    estimatedTime: '2–3 hrs',
    usedBy: 5400,
    category: 'branding',
    tier: 'free',
    tags: ['branding', 'design', 'identity'],
    featured: true,
    sections: [
      {
        title: 'Step 1  -  Define Your 3 Adjectives',
        type: 'template',
        intro: 'Every brand decision you make should pass this test: "Does this match these 3 words?"',
        body: `My brand is: __________, __________, __________

Examples that work well together:
• Bold, Feminine, Minimal
• Warm, Elevated, Approachable
• Edgy, Confident, Raw
• Clean, Expert, Accessible

Test: Hold up any piece of content and ask  -  does this feel like those 3 words? If not, edit it.`,
      },
      {
        title: 'Step 2  -  Color Palette',
        type: 'list',
        intro: 'You need exactly 4 colors. Not 8. Not 2.',
        items: [
          'Primary  -  dominant brand color. Used in logo, CTAs, key accents',
          'Secondary  -  supports primary. Used in backgrounds and cards',
          'Neutral  -  white, cream, or light gray for breathing room',
          'Accent  -  used sparingly for highlights and callouts only',
        ],
      },
      {
        title: 'Color Psychology Quick Reference',
        type: 'list',
        items: [
          'Burgundy / Deep Red → luxury, confidence, femininity',
          'Sage / Olive → wellness, natural, grounded',
          'Cobalt / Navy → trust, authority, expertise',
          'Warm Cream → approachable luxury, organic, soft',
          'Black + Gold → premium, editorial, high-end',
        ],
      },
      {
        title: 'Step 3  -  Typography',
        type: 'tips',
        intro: 'Two fonts maximum. Always. Non-negotiable.',
        items: [
          'Display font (headlines)  -  should feel distinctive. Options: Playfair Display, Space Grotesk, Cormorant Garamond',
          'Body font (descriptions)  -  must be readable at 14px. Options: Inter, DM Sans, Lato',
          'Never pair two serif fonts or two decorative fonts  -  it creates visual chaos',
          'Test your fonts by writing a 3-word headline and a 50-word paragraph  -  both need to feel right',
        ],
      },
      {
        title: 'Step 4  -  Brand Voice',
        type: 'template',
        body: `Complete these sentences out loud (yes, out loud):

"My brand sounds like ____________ at a dinner party."
"We always say ____________. We never say ____________."
"If our brand were a person, they'd be reading ____________ and wearing ____________."

5 "We are / We are not" statements:
• We are: confident. We are not: aggressive.
• We are: educational. We are not: preachy.
• We are: _________. We are not: _________.
• We are: _________. We are not: _________.
• We are: _________. We are not: _________.`,
      },
    ],
  },
  {
    id: '6',
    title: 'Welcome Email Sequence',
    tagline: '5 emails that turn new subscribers into paying customers.',
    preview: 'Most welcome sequences either dump information or go straight to a pitch. This one builds trust first  -  and that\'s why it converts.',
    creatorNote: 'The magic is in the reply rate. Email 1 asks a real question. When people reply, respond personally. That single conversation can turn a subscriber into a customer immediately.',
    whyItWorks: 'The sequence mirrors the natural trust arc of a human relationship: deliver value → share your story → earn credibility → make the offer. Skipping steps kills conversion.',
    bestFor: ['Email list building', 'Product launches', 'Low-ticket offers'],
    estimatedTime: '2 hrs to write',
    usedBy: 1800,
    category: 'email',
    tier: 'pro',
    tags: ['email', 'marketing', 'conversion'],
    featured: false,
    sections: [
      {
        title: 'Email 1  -  Immediate: The Warm Welcome',
        type: 'template',
        intro: 'Subject: You\'re in  -  here\'s what comes next',
        body: `Hey [First Name],

Welcome to the [Brand] community. I'm genuinely glad you're here.

Here's your [discount / resource / lead magnet]: [LINK or CODE]

Over the next few days I'll share [brief description of email sequence value].

Before that  -  one question: what's the #1 thing you're working on in your business right now?

Hit reply and tell me. I read every single one.

[Your name]`,
      },
      {
        title: 'Email 2  -  Day 2: The Real Story',
        type: 'template',
        intro: 'Subject: Why I actually started this (the honest version)',
        body: `[First Name],

[2–3 sentences of your real origin story. Honest > polished.]

I'm sharing this because [connect story to what you help people achieve].

Here's something I wish I'd known earlier:

[Genuine tip, resource, or insight  -  100–200 words max]

Try it this week and let me know how it goes.

[Your name]`,
      },
      {
        title: 'Email 3  -  Day 4: The Mistake',
        type: 'template',
        intro: 'Subject: The mistake that cost me [X] (don\'t do this)',
        body: `[First Name],

This one's a little embarrassing to share. But if it saves you time or money, it's worth it.

[Real mistake story  -  specific, relatable, 2–3 short paragraphs]

The lesson: [One clear takeaway]

How to avoid it: [2–3 actionable steps]

[Your name]`,
      },
      {
        title: 'Email 4  -  Day 6: The Proof',
        type: 'template',
        intro: 'Subject: What happened when [client] tried this',
        body: `[First Name],

I want to share what happened with [client first name or "one of our customers"].

[Specific result with real numbers if possible]

They did it by: [2–3 simple steps]

If you want [similar outcome], [soft CTA to product or next step  -  not a hard sell].

[Your name]`,
      },
      {
        title: 'Email 5  -  Day 8: The Offer',
        type: 'template',
        intro: 'Subject: Ready for [desired outcome]? Here\'s how I can help.',
        body: `[First Name],

You've been here for over a week. I've loved having you.

If you're ready to [specific outcome], I'd love to help you get there faster.

[Product name] is [one sentence description].

What you get:
• [Benefit 1]
• [Benefit 2]
• [Benefit 3]

[CTA Button: Get started  -  $XX]

This is the only time I'll offer this price in your welcome sequence.

[Your name]`,
      },
      {
        title: 'Sequence Tips',
        type: 'tips',
        items: [
          'Keep every email under 300 words  -  people read on mobile',
          'One CTA per email, maximum  -  more choices = fewer clicks',
          'Reply to anyone who responds within 24 hours  -  that\'s your most engaged future customer',
          'Subject lines: curiosity or a specific number beat clever every time',
          'Resend Email 5 with a different subject line to non-openers 48 hours later',
        ],
      },
    ],
  },
  {
    id: '7',
    title: 'Canadian-Friendly Supplier Guide',
    tagline: 'Find suppliers that actually ship to Canada without the customs headache.',
    preview: 'The best print-on-demand, white-label, and dropshipping platforms that work for Canadian Shopify brands  -  with Canada-specific shipping tips built in.',
    creatorNote: 'Sourcing as a Canadian is different. Customs fees, longer shipping windows, and US-centric platforms are real friction. These are the platforms that actually work north of the border.',
    whyItWorks: 'Every platform here either has Canadian warehousing, integrates with Shopify natively, or ships internationally with predictable timelines. No customs surprises, no lost packages.',
    bestFor: ['Canadian Shopify brands', 'Print-on-demand products', 'Reducing shipping times'],
    estimatedTime: '30 min to shortlist',
    usedBy: 2800,
    category: 'supplier',
    tier: 'pro',
    tags: ['shopify', 'canada', 'suppliers'],
    featured: false,
    sections: [
      {
        title: 'Best Platforms for Canadian Sellers',
        type: 'list',
        items: [
          'Blanka  -  Canadian white-label beauty brand. Ships from Canada. No customs headaches.',
          'Printify  -  Print-on-demand. Has Canadian print providers. Good for apparel and accessories.',
          'Spocket  -  Dropshipping with US and EU suppliers. Filter for fast international shipping.',
          'Syncee  -  Broad dropshipping catalogue. Has Canadian-based supplier filtering.',
          'Faire  -  Canadian and US wholesale. Great for boutique-style product brands.',
          'Alibaba / CJdropshipping  -  For bulk and custom orders. Budget extra time for customs and duties.',
        ],
      },
      {
        title: 'Canadian Shipping Tips',
        type: 'tips',
        items: [
          'Always confirm whether a supplier charges DDP (Delivered Duty Paid)  -  this means no surprise customs fees for your customers',
          'For orders under $20 CAD: typically duty-free. For $20+: expect customs fees on US imports',
          'Shopify Shipping integrates with Canada Post, UPS, and FedEx  -  compare rates before committing to one carrier',
          'Offer free shipping at a threshold (e.g. $75 CAD) to improve conversion  -  test this early',
          'Set customer expectations clearly: 5–12 business days for international suppliers is normal',
        ],
      },
      {
        title: 'Supplier Vetting Checklist',
        type: 'checklist',
        intro: 'Run every new supplier through this before committing.',
        items: [
          'Response time under 24 hours (send a test question before ordering)',
          'Order a sample  -  confirm quality and packaging personally',
          'Verify actual delivery time to a Canadian address',
          'Confirm whether duties/customs are included (DDP) or charged to customer',
          'Pricing allows 40%+ margin after all landed costs',
          'Return/refund policy confirmed in writing',
          'Integrates with Shopify without manual order fulfilment',
        ],
      },
    ],
  },
  {
    id: '8',
    title: 'Digital Product Pricing Guide',
    tagline: 'Price too low and you work twice as hard. This fixes that.',
    preview: 'A framework for pricing your courses, ebooks, and templates  -  with the math, the psychology, and the validation steps most founders skip.',
    creatorNote: 'The most common mistake is pricing based on how long something took to create. Price based on the value of the outcome you deliver. A guide that saves someone $10K is worth $497, not $27.',
    whyItWorks: 'Pricing is positioning. The price you choose signals the quality of your offer before anyone reads a word of your sales page. This guide helps you choose the right signal.',
    bestFor: ['Digital product creators', 'Course launches', 'Ebook pricing'],
    estimatedTime: '20 min',
    usedBy: 2600,
    category: 'guide',
    tier: 'free',
    tags: ['pricing', 'digital', 'strategy'],
    featured: false,
    sections: [
      {
        title: 'The 3 Proven Price Tiers',
        type: 'list',
        items: [
          '$9–$37  -  Entry: ebooks, checklists, template packs, mini-courses. Best for building a buyer list.',
          '$47–$197  -  Mid: comprehensive courses, bundle packs, workshops. Your main revenue driver.',
          '$297–$997+  -  Premium: signature courses with community, done-for-you systems, coaching add-ons.',
        ],
      },
      {
        title: 'The Revenue Math',
        type: 'list',
        intro: 'This is why raising your price often makes your business easier, not harder.',
        items: [
          'At $47 → need 22 sales to hit $1K/mo',
          'At $97 → need 11 sales to hit $1K/mo',
          'At $197 → need 6 sales to hit $1K/mo',
          'At $497 → need 3 sales to hit $1.5K/mo',
          'At $997 → need 2 sales to hit $2K/mo',
        ],
      },
      {
        title: 'Pricing Psychology',
        type: 'tips',
        items: [
          'Charm pricing: $47 outperforms $50. $197 outperforms $200. Always end in 7.',
          'The anchor effect: always show a "was $97" crossed-out price. It frames everything below it as a deal.',
          'Three tiers with a "Most Popular" label  -  the labeled option gets 20–35% more clicks.',
          'Odd numbers feel calculated, not arbitrary. $73 feels more considered than $70.',
          'Your price is a signal. A $27 course signals low stakes. A $297 course signals transformation.',
        ],
      },
      {
        title: 'Validate Before You Price',
        type: 'checklist',
        items: [
          'Poll your audience: "Would you pay $X for Y?"  -  anything over 30% yes is a green light',
          'Pre-sell at a launch discount before creating the product',
          'Research 3 competitors  -  price in the same range unless you can justify premium',
          'A/B test two price points with split traffic if your audience is large enough',
        ],
      },
    ],
  },
  {
    id: '9',
    title: 'Content Calendar Template',
    tagline: 'Batch your whole month in one afternoon.',
    preview: 'A weekly posting structure with 30 ready-to-use hook starters  -  so you spend your creative energy on content, not figuring out what to post.',
    creatorNote: 'Consistency beats creativity in the first 6 months. This template removes the daily "what do I post" decision that kills most creators\' momentum.',
    whyItWorks: 'The 3-post-per-week structure is proven  -  enough presence to build momentum, not so much that quality drops. The hook starters reduce blank-page paralysis to zero.',
    bestFor: ['New content creators', 'Content batching', 'Consistency building'],
    estimatedTime: '2 hrs/month',
    usedBy: 4100,
    category: 'template',
    tier: 'pro',
    tags: ['content', 'planning', 'social'],
    featured: false,
    sections: [
      {
        title: 'Weekly Content Structure',
        type: 'list',
        intro: 'Post 3 times per week. Rotate these formats.',
        items: [
          'Monday  -  Educational: Carousel or talking-head video. Goal: establish expertise. Hook: "Most people don\'t know [surprising fact]"',
          'Wednesday  -  Personal/Story: Single image or B-roll reel. Goal: build connection. Hook: "The thing nobody tells you about [relatable situation]"',
          'Friday  -  Product/Offer: Demo, testimonial, or feature. Goal: drive sales. Hook: "If you want [outcome], you need to see this"',
        ],
      },
      {
        title: 'Caption Formula',
        type: 'template',
        body: `HOOK (line 1  -  stops the scroll)
[Bold statement, open question, or surprising fact  -  under 12 words]

BODY (2–4 short paragraphs)
Point 1: [Teaching moment or story beat]
Point 2: [Supporting detail or example]
Point 3: [The insight or takeaway]

CTA (last line  -  always)
[What do you want them to do?]

Examples:
"Save this for your next launch. Which tip are you trying first? ↓"
"Follow for more. New post every Monday, Wednesday, Friday."
"Drop your biggest struggle below  -  I read every reply."`,
      },
      {
        title: '30 Hook Starters',
        type: 'scripts',
        intro: 'Copy directly. Fill in the blank. Post.',
        items: [
          'Nobody talks about this, but...',
          'I made $[X] doing this one thing:',
          'Stop doing [common thing]. Do this instead:',
          'The [niche] advice that changed everything for me:',
          'If I started over, here\'s what I\'d do differently:',
          'This took me from [before] to [after] in [timeframe]:',
          '3 things I wish I knew before [starting/launching]:',
          'Unpopular opinion: [contrarian take]',
          'Your [problem] isn\'t [what they think]. It\'s [real reason].',
          'I asked [X people] what they struggle with most. The answer surprised me.',
        ],
      },
    ],
  },
  {
    id: '10',
    title: 'Client Proposal Template',
    tagline: 'The doc that closes premium clients without a sales call.',
    preview: 'A professional proposal template structured around the client\'s situation first  -  which is why it commands premium rates without pushback.',
    creatorNote: 'Most proposals lead with you: your services, your packages, your prices. This one leads with them. That single reframe is why it closes at rates 2–3× higher than the industry average.',
    whyItWorks: 'Clients pay premium prices when they feel deeply understood. The proposal starts by mirroring their situation back to them  -  which creates the "this person gets it" moment before a price is mentioned.',
    bestFor: ['Service businesses', 'Freelancers', 'Agency owners'],
    estimatedTime: '30 min to customize',
    usedBy: 1900,
    category: 'template',
    tier: 'pro',
    tags: ['service', 'proposal', 'clients'],
    featured: false,
    sections: [
      {
        title: 'Full Proposal Template',
        type: 'template',
        intro: 'Replace everything in brackets. Send as a PDF.',
        body: `Prepared for: [Client Name]
Date: [Date]
Prepared by: [Your Name / Brand]

─── The Situation ───────────────────
[2–3 sentences describing their challenge in your own words. Show that you listened.]

Example: "Based on our call, [Client] is generating strong organic reach but struggling to convert that attention into consistent revenue. The funnel is there  -  the offer-to-content connection isn't optimized yet."

─── The Opportunity ─────────────────
[What's possible if this is solved? Be specific with numbers.]

"Brands in your position typically see a 3–5× return within 90 days when the content-to-offer pipeline is corrected. For [Client], that's an estimated $[X]K/month in additional revenue."

─── My Approach ─────────────────────
Phase 1  -  Discovery (Week 1–2): [Deliverables]
Phase 2  -  Strategy (Week 2–4): [Deliverables]
Phase 3  -  Execution (Month 2–3): [Deliverables]

─── Investment ──────────────────────
Starter: [Deliverables]  -  $[X]/mo
★ Growth (recommended): [Deliverables]  -  $[X]/mo
Scale: [Deliverables]  -  $[X]/mo

─── Next Steps ──────────────────────
1. Reply to confirm scope
2. I'll send a contract + first invoice
3. We schedule our kickoff call

[Your Name]`,
      },
      {
        title: 'Proposal Tips',
        type: 'tips',
        items: [
          'Mirror their exact words from the discovery call  -  it signals deep listening',
          'Use real numbers in the Opportunity section  -  vague potential doesn\'t close deals',
          'Always include 3 tiers  -  most clients choose the middle. Label it "Most Popular".',
          'Send as a PDF, not a Google Doc  -  it feels more considered and professional',
          'Follow up after 48 hours if you don\'t hear back  -  one follow-up is expected, not pushy',
        ],
      },
    ],
  },
  {
    id: '12',
    title: 'Affiliate Marketing Starter Kit',
    tagline: 'Your first affiliate income stream in 30 days.',
    preview: 'Everything you need to choose programs, create content, and earn your first commission  -  structured as a real 4-week plan, not a vague guide.',
    creatorNote: 'Most people start affiliate marketing backwards  -  they sign up for programs, then figure out what to post. Start with content topics you already care about, then find the programs. The order matters.',
    whyItWorks: 'Authenticity is the only moat in affiliate marketing. This kit is built around products you genuinely use  -  which means your recommendations actually convert instead of feeling like ads.',
    bestFor: ['Content creators', 'Passive income beginners', 'Audience monetization'],
    estimatedTime: '4 weeks',
    usedBy: 3300,
    category: 'guide',
    tier: 'free',
    tags: ['affiliate', 'passive', 'income'],
    featured: false,
    sections: [
      {
        title: 'Week 1  -  Foundation',
        type: 'checklist',
        items: [
          'List 5 products you use every day and would recommend without a commission',
          'Check each brand\'s website footer for an "Affiliate" or "Partners" link',
          'Apply to 3–5 programs: start with Amazon Associates + 2 niche-specific',
          'Set up your link-in-bio tool (LTK, Stan Store, or Linktree)',
          'Choose your content platform: TikTok for fastest growth, YouTube for highest conversion',
        ],
      },
      {
        title: 'Week 2  -  First Content',
        type: 'list',
        intro: 'Create these 5 pieces before worrying about anything else.',
        items: [
          '"My current favorites" roundup  -  honest, specific, useful',
          'Product comparison: this vs. that (pick one you actually prefer)',
          '"How I use [product] in my daily routine"  -  real lifestyle content',
          '"What I bought vs. what I actually use"  -  high-trust, high-conversion format',
          'Honest review of one product (include a con  -  it builds credibility)',
        ],
      },
      {
        title: 'Income Benchmarks',
        type: 'list',
        intro: 'The math  -  so you know what to expect and what to optimize.',
        items: [
          '500 clicks/mo · 2% conv · $50 AOV → ~$50/mo',
          '2,000 clicks/mo · 2% conv · $75 AOV → $60–$150/mo',
          '10,000 clicks/mo · 3% conv · $80 AOV → $240–$600/mo',
          '50,000 clicks/mo · 3% conv · $100 AOV → $1,500–$4,500/mo',
        ],
      },
      {
        title: 'Rules for Staying Trustworthy',
        type: 'tips',
        items: [
          'Always disclose: #ad or #affiliate is legally required and builds trust, not erodes it',
          'Never promote something you wouldn\'t buy with your own money',
          'Integrate links naturally into content  -  don\'t dump links in captions',
          'Track which content drives clicks  -  double down on what works',
          'Negotiate commission rates after you\'ve driven consistent sales to a brand',
        ],
      },
    ],
  },
  {
    id: '11',
    title: 'Ownr: Canadian Business Registration Guide',
    tagline: 'Register or incorporate your Canadian business online in under an hour.',
    preview: 'A plain-English walkthrough of registering or incorporating a business in Canada  -  using Ownr.co, no lawyer required.',
    creatorNote: 'A lot of Canadian entrepreneurs delay getting registered because they think it\'s complicated. It\'s not. Ownr makes it fast, affordable, and fully online.',
    whyItWorks: 'Ownr is built specifically for Canadian founders. It handles provincial and federal registration online, generates your documents automatically, and walks you through every step.',
    bestFor: ['New Canadian entrepreneurs', 'First-time business registration', 'Solo founders ready to go official'],
    estimatedTime: '45–60 min',
    usedBy: 1200,
    category: 'guide',
    tier: 'free',
    tags: ['canada', 'legal', 'setup'],
    featured: true,
    sections: [
      {
        title: 'Sole Proprietorship vs Corporation  -  Which Is Right for You?',
        type: 'list',
        intro: 'Neither is permanent. Start where it makes sense.',
        items: [
          'Sole Proprietorship  -  Fast, cheap, minimal paperwork. You and the business are legally the same. Best for: freelancers, service providers, testing a business idea.',
          'Corporation  -  More legal protection, lower corporate tax rate, better for investors. Best for: scaling brands, hiring, or if you\'re making $50K+ net.',
          'Rule of thumb: Start as a sole proprietor. Incorporate when revenue or risk justifies it.',
          'Not sure? Talk to a Canadian accountant before deciding  -  it affects your taxes.',
        ],
      },
      {
        title: 'Step-by-Step: Register Through Ownr',
        type: 'checklist',
        intro: 'Go to Ownr.co to follow along.',
        items: [
          'Step 1  -  Create your Ownr account at ownr.co',
          'Step 2  -  Choose your registration type (sole prop or incorporation)',
          'Step 3  -  Search and reserve your business name',
          'Step 4  -  Select your province (or federal incorporation)',
          'Step 5  -  Fill in your business details and owner information',
          'Step 6  -  Complete payment (sole prop starts at ~$49, incorporation is higher)',
          'Step 7  -  Receive and download your official registration documents',
          'Step 8  -  Apply for your Business Number (BN) at canada.ca/cra  -  free',
          'Step 9  -  Open a business bank account using your registration documents',
          'Step 10  -  Register for HST/GST if you expect to earn over $30,000 CAD',
        ],
      },
      {
        title: 'After You Register  -  What Comes Next',
        type: 'tips',
        items: [
          'Business Number (BN): Get yours from the CRA at canada.ca. You\'ll need this for taxes, suppliers, and banking.',
          'HST/GST: You must register for HST if your revenue exceeds $30,000 CAD in a calendar year. You can also register voluntarily before that.',
          'Business bank account: Keep personal and business money 100% separate from day one  -  it makes taxes dramatically simpler.',
          'Bookkeeping: Use Wave (free), QuickBooks, or FreshBooks. Start tracking expenses immediately.',
          'Accountant: Find a Canadian accountant who works with small businesses before your first tax season. It\'s worth it.',
          'Tax note: Canadian corporate tax rates and rules are different from US. Never use US business tax advice for your Canadian business.',
        ],
      },
    ],
  },
  {
    id: '12',
    title: 'Stan Store Setup Guide',
    tagline: 'Your bio link, your storefront, your email funnel  -  all in one place.',
    preview: 'A step-by-step guide to setting up your Stan Store, building your first freebie funnel, and driving Instagram traffic to sales  -  without ads.',
    creatorNote: 'Stan Store is the tool I recommend to every creator and digital product seller. It handles payments, delivery, email capture, and your bio link  -  and it\'s free to start.',
    whyItWorks: 'Stan Store removes every friction point between your Instagram audience and your offer. Freebie → email capture → paid product is the entire funnel, built in one afternoon.',
    bestFor: ['Digital product creators', 'Service providers', 'Coaches and creators'],
    estimatedTime: '2–3 hrs (first setup)',
    usedBy: 3100,
    category: 'guide',
    tier: 'free',
    tags: ['stan store', 'digital', 'instagram', 'funnel'],
    featured: true,
    sections: [
      {
        title: 'Step 1  -  Create Your Stan Store',
        type: 'checklist',
        items: [
          'Go to stan.store and click "Get Started"',
          'Create your account with your email',
          'Choose your username (this becomes stan.store/yourusername)',
          'Upload a profile photo and write a short bio',
          'Connect your payment method (Stripe  -  available to Canadians)',
          'Your store is live  -  now add products',
        ],
      },
      {
        title: 'Step 2  -  Add a Freebie (Lead Magnet)',
        type: 'checklist',
        intro: 'A freebie builds your email list and earns trust before anyone spends money.',
        items: [
          'Create a free resource: checklist, Canva template, PDF guide, or mini-training',
          'In Stan Store: click "Add Product" → choose "Digital Download" → set price to $0',
          'Upload your file (PDF or link to Canva template)',
          'Write a compelling title and description (what will they learn or get?)',
          'Turn on email capture  -  this automatically adds downloaders to your email list',
          'Copy your freebie link  -  you\'ll use this in your bio and DM automations',
        ],
      },
      {
        title: 'Step 3  -  Add Your Paid Product',
        type: 'checklist',
        items: [
          'Click "Add Product" → choose the right type (digital download, course, or booking)',
          'Set your price in CAD (Stan handles currency)',
          'Upload your product file or add your course content',
          'Write your product description: who is it for, what do they get, what outcome does it create?',
          'Design a cover image in Canva  -  use your brand colors',
          'Publish and test checkout with a dummy purchase',
        ],
      },
      {
        title: 'Step 4  -  Build Your Funnel',
        type: 'list',
        intro: 'The goal is to move someone from Instagram stranger → email list → buyer. Here\'s how.',
        items: [
          'Funnel step 1  -  Instagram content: post valuable, consistent content in your niche',
          'Funnel step 2  -  Bio link: replace your link-in-bio with your Stan Store link',
          'Funnel step 3  -  Freebie: your bio points to the freebie first, not the paid product',
          'Funnel step 4  -  Email capture: stan.store automatically captures their email when they download',
          'Funnel step 5  -  Email sequence: follow up with 2–3 value emails, then introduce your paid offer',
          'Funnel step 6  -  DM automation: use Instagram DM automations to send the freebie link automatically',
        ],
      },
      {
        title: 'Instagram DM Automations  -  How to Use Them',
        type: 'tips',
        intro: 'These turn your Instagram content into an automated sales machine.',
        items: [
          '"Comment GUIDE below and I\'ll send it to your DMs"  -  post this in your caption, set up auto-DM with your Stan freebie link',
          '"DM me the word START"  -  works the same way, but reaches people already in your DMs',
          'Use tools like ManyChat or Instagram\'s built-in auto-reply for DM automation',
          'When someone DMs for the freebie: send the link + a friendly note + ask what they\'re working on',
          'Personal replies convert  -  if someone downloads your freebie, reply to say "hope it helps!" The conversation that follows is where sales happen',
          'After 3–5 pieces of value content, post your paid offer directly. Your audience will be ready.',
        ],
      },
    ],
  },
  {
    id: '13',
    title: 'Canva Brand Kit Quick-Start',
    tagline: 'Build a professional logo and brand in one afternoon  -  no design experience needed.',
    preview: 'A step-by-step Canva guide for creating your logo, setting up your brand kit, and building reusable templates for Instagram, digital products, and your Stan Store.',
    creatorNote: 'Canva is the tool I use for everything  -  logos, Instagram posts, product covers, PDFs, and Stan Store thumbnails. You don\'t need Photoshop. You just need a Canva account and this guide.',
    whyItWorks: 'A brand kit in Canva means your logo, colors, and fonts are saved and auto-apply to every design  -  so you can batch a week of content in 30 minutes instead of starting from scratch.',
    bestFor: ['New entrepreneurs', 'Building a brand on a budget', 'Creating content faster'],
    estimatedTime: '2–3 hrs (first setup)',
    usedBy: 4600,
    category: 'branding',
    tier: 'free',
    tags: ['canva', 'branding', 'logo', 'design'],
    featured: true,
    sections: [
      {
        title: 'Step 1  -  Create Your Logo',
        type: 'checklist',
        items: [
          'Go to Canva.com  -  create a free account if you don\'t have one',
          'Click "Create a Design" → search "Logo" (use the 500x500 px canvas)',
          'Search templates: type "minimalist logo"  -  pick a clean, simple design',
          'Click on the template to edit it',
          'Replace the template text with your business name',
          'Change colors to match your brand palette (have your hex codes ready)',
          'Swap or remove any icons that don\'t fit your brand',
          'Keep it simple  -  your logo should look good as a small profile photo',
          'Download as PNG with transparent background (Canva Pro) for most uses',
          'Download as SVG for scalable/print uses (also Canva Pro)',
        ],
      },
      {
        title: 'Step 2  -  Set Up Your Canva Brand Kit',
        type: 'checklist',
        intro: 'Brand Kit is a Canva Pro feature (~$17 CAD/month). Worth it if you\'re creating content regularly.',
        items: [
          'Upgrade to Canva Pro (30-day free trial available)',
          'Go to Brand Hub → Create Brand Kit',
          'Upload your logo files (PNG and SVG)',
          'Add your brand colors: enter your hex codes',
          'Set your brand fonts: one display font and one body font',
          'Now every new design auto-suggests your brand elements  -  fast and consistent',
        ],
      },
      {
        title: 'Step 3  -  Create Reusable Instagram Templates',
        type: 'checklist',
        items: [
          'Create a new design → choose "Instagram Post (Square)"  -  1080x1080 px',
          'Design a simple template using your brand colors and fonts',
          'Create 3 versions: one for educational posts, one for personal/story posts, one for product/offer posts',
          'Right-click each design → "Make a copy" when you want to post  -  never overwrite the original template',
          'Batch your content: create 8–10 posts in one sitting using your templates',
        ],
      },
      {
        title: 'Step 4  -  Create Product Covers and Freebie PDFs',
        type: 'tips',
        items: [
          'Stan Store product covers: use "Presentation (16:9)" canvas size in Canva for the best fit',
          'Freebie PDF guides: use "Letter" or "A4" document size, one page per section, keep it clean and scannable',
          'Digital product workbooks: use landscape orientation with wide margins  -  easier to read on screen',
          'Instagram Story covers for Highlights: use 1080x1920 canvas  -  create a matching set for consistency',
          'Export all PDFs at "PDF - Print" quality for crisp, professional delivery',
          'Save everything in a Canva folder named "Brand Assets" so you can find it fast',
        ],
      },
      {
        title: 'Free vs Pro  -  What You Actually Need',
        type: 'list',
        items: [
          'Free (always): basic design, logo creation, Instagram templates, PDF export, team sharing',
          'Pro (~$17 CAD/month): Brand Kit (logo, colors, fonts saved), transparent background downloads, Magic Resize, 100M+ premium elements',
          'Start free. Upgrade to Pro when you\'re creating content consistently  -  it pays for itself in time saved.',
          'Pro tip: Canva often runs 30–40% off promotions. Check before paying full price.',
        ],
      },
    ],
  },
]

// ─── Copy Button ──────────────────────────────────────────────────────────────

function CopyBtn({ text, size = 'sm' }: { text: string; size?: 'xs' | 'sm' }) {
  const [copied, setCopied] = useState(false)
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={handle}
      className={cn(
        'flex items-center gap-1 font-medium rounded-lg border transition-all flex-shrink-0',
        size === 'xs'
          ? 'text-[10px] px-2 py-1 gap-0.5'
          : 'text-xs px-2.5 py-1.5',
        copied
          ? 'border-[#C8E6D5] bg-[#F4FBF7] text-[#15803D]'
          : 'border-[#E4E4E7] text-[#7C3AED] hover:bg-[#EDE9FE]'
      )}
    >
      {copied ? <Check className={size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3'} /> : <Copy className={size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

// ─── Section Renderers ────────────────────────────────────────────────────────

function ChecklistBlock({ section }: { section: Section }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const doneCount = Object.values(checked).filter(Boolean).length
  const total = section.items?.length ?? 0
  const allDone = doneCount === total && total > 0

  return (
    <div>
      {section.intro && <p className="text-xs text-[#A1A1AA] mb-3 leading-relaxed">{section.intro}</p>}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-medium text-[#A1A1AA]">{doneCount}/{total} completed</span>
        {allDone && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[10px] font-semibold text-[#15803D]">
            All done
          </motion.span>
        )}
      </div>
      <div className="space-y-1.5">
        {section.items?.map((item, i) => (
          <button
            key={i}
            onClick={() => setChecked(p => ({ ...p, [i]: !p[i] }))}
            className={cn(
              'w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-colors text-xs',
              checked[i] ? 'bg-[#FAFAFA]' : 'hover:bg-[#FAFAFA]'
            )}
          >
            <div className={cn(
              'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
              checked[i] ? 'bg-[#18181B] border-[#18181B]' : 'border-[#D1D0CC]'
            )}>
              {checked[i] && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
            </div>
            <span className={cn('leading-relaxed', checked[i] ? 'text-[#A1A1AA] line-through' : 'text-[#3F3F46]')}>
              {item}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function TemplateBlock({ section }: { section: Section }) {
  return (
    <div>
      {section.intro && <p className="text-xs text-[#A1A1AA] mb-3 leading-relaxed italic">{section.intro}</p>}
      <div className="relative rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#E4E4E7] bg-white/60">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#A1A1AA]">Template</span>
          <CopyBtn text={section.body ?? ''} size="xs" />
        </div>
        <pre className="whitespace-pre-wrap text-xs leading-relaxed text-[#3F3F46] font-sans px-4 py-4 overflow-x-auto">
          {section.body}
        </pre>
      </div>
    </div>
  )
}

function ScriptsBlock({ section }: { section: Section }) {
  return (
    <div>
      {section.intro && <p className="text-xs text-[#A1A1AA] mb-3 leading-relaxed">{section.intro}</p>}
      <div className="space-y-3">
        {section.items?.map((script, i) => (
          <div key={i} className="rounded-xl border border-[#F4F4F5] bg-white overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#FAFAFA]">
              <span className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider">
                {section.title.toLowerCase().includes('hook') ? `Hook ${i + 1}` :
                 section.title.toLowerCase().includes('bio') ? `Template ${i + 1}` :
                 section.title.toLowerCase().includes('script') ? `Script ${i + 1}` : `Option ${i + 1}`}
              </span>
              <CopyBtn text={script} size="xs" />
            </div>
            <pre className="whitespace-pre-wrap text-xs leading-relaxed text-[#3F3F46] font-sans px-3 py-2.5">
              {script}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}

function ListBlock({ section }: { section: Section }) {
  return (
    <div>
      {section.intro && <p className="text-xs text-[#A1A1AA] mb-3 leading-relaxed">{section.intro}</p>}
      <div className="space-y-2">
        {section.items?.map((item, i) => (
          <div key={i} className="flex items-start gap-2.5 text-xs text-[#3F3F46] leading-relaxed">
            <div className="w-1 h-1 rounded-full bg-[#A1A1AA] flex-shrink-0 mt-[7px]" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TipsBlock({ section }: { section: Section }) {
  return (
    <div>
      {section.intro && <p className="text-xs text-[#A1A1AA] mb-3 leading-relaxed">{section.intro}</p>}
      <div className="space-y-2.5">
        {section.items?.map((tip, i) => (
          <div key={i} className="flex items-start gap-3 text-xs leading-relaxed">
            <span className="text-[10px] font-bold text-[#A1A1AA] flex-shrink-0 w-4 mt-0.5">{i + 1}</span>
            <span className="text-[#3F3F46]">{tip}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SectionBlock({ section }: { section: Section }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="border-b border-[#FAFAFA] last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-3.5 text-left group"
      >
        <span className="text-xs font-semibold text-[#18181B] group-hover:text-[#7C3AED] transition-colors">
          {section.title}
        </span>
        {open
          ? <ChevronUp className="w-3.5 h-3.5 text-[#A1A1AA]" />
          : <ChevronDown className="w-3.5 h-3.5 text-[#A1A1AA]" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4">
              {section.type === 'checklist' && <ChecklistBlock section={section} />}
              {section.type === 'template' && <TemplateBlock section={section} />}
              {section.type === 'scripts' && <ScriptsBlock section={section} />}
              {section.type === 'list' && <ListBlock section={section} />}
              {section.type === 'tips' && <TipsBlock section={section} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Resource Modal ───────────────────────────────────────────────────────────

function ResourceModal({
  resource,
  isFavorited,
  onFavorite,
  onClose,
}: {
  resource: Resource
  isFavorited: boolean
  onFavorite: () => void
  onClose: () => void
}) {
  const Icon = CATEGORY_META[resource.category]?.icon ?? FileText

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[#18181B]/50 backdrop-blur-sm" />

      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-xl max-h-[92vh] flex flex-col shadow-[0_24px_80px_rgba(0,0,0,0.16)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="px-5 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] flex items-center justify-center flex-shrink-0">
              <Icon className="w-4.5 h-4.5 text-[#7C3AED]" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#A1A1AA]">
                  {CATEGORY_META[resource.category]?.label}
                </span>
                <span className={cn(
                  'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                  resource.tier === 'free' ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#EDE9FE] text-[#7C3AED]'
                )}>
                  {resource.tier === 'free' ? 'Free' : 'Founder'}
                </span>
              </div>
              <h2 className="font-semibold text-base text-[#18181B] leading-snug">{resource.title}</h2>
              <p className="text-xs text-[#A1A1AA] mt-0.5">{resource.tagline}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={onFavorite}
                className={cn(
                  'p-2 rounded-xl transition-colors',
                  isFavorited ? 'text-[#C4A264] bg-[#FAFAFA]' : 'text-[#E4E4E7] hover:text-[#C4A264] hover:bg-[#FAFAFA]'
                )}
              >
                <Star className={cn('w-4 h-4', isFavorited && 'fill-current')} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-[#A1A1AA] hover:text-[#71717A] hover:bg-[#FAFAFA] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-4 mt-3 text-[11px] text-[#A1A1AA]">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" strokeWidth={1.5} />
              {resource.usedBy.toLocaleString()} founders
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" strokeWidth={1.5} />
              {resource.estimatedTime}
            </span>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">

          {/* Creator Note */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7]">
            <Lightbulb className="w-3.5 h-3.5 text-[#8B5E3C] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#A1A1AA] mb-1">Creator Note</p>
              <p className="text-xs text-[#5C4030] leading-relaxed">{resource.creatorNote}</p>
            </div>
          </div>

          {/* Best for */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#A1A1AA] mb-2">Best used for</p>
            <div className="flex flex-wrap gap-1.5">
              {resource.bestFor.map(b => (
                <span key={b} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#FAFAFA] text-[#52525B]">
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Why it works */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-white border border-[#F4F4F5]">
            <Sparkles className="w-3.5 h-3.5 text-[#C4A264] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#A1A1AA] mb-1">Why it works</p>
              <p className="text-xs text-[#52525B] leading-relaxed">{resource.whyItWorks}</p>
            </div>
          </div>

          {/* Content sections */}
          <div className="rounded-xl border border-[#F4F4F5] bg-white px-4 divide-y-0">
            {resource.sections.map((section, i) => (
              <SectionBlock key={i} section={section} />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Resource Card ────────────────────────────────────────────────────────────

function ResourceCard({
  resource, canAccess, isFavorited, onFavorite, onOpen, delay,
}: {
  resource: Resource; canAccess: boolean; isFavorited: boolean;
  onFavorite: () => void; onOpen: () => void; delay: number;
}) {
  const Icon = CATEGORY_META[resource.category]?.icon ?? FileText

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        'group bg-white rounded-2xl border p-5 flex flex-col gap-4 cursor-pointer transition-all duration-200',
        'hover:border-[#A1A1AA] hover:shadow-[0_6px_24px_rgba(0,0,0,0.07)]',
        resource.featured ? 'border-[#E4E4E7]' : 'border-[#F4F4F5]',
      )}
      onClick={canAccess ? onOpen : undefined}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FAFAFA] flex items-center justify-center group-hover:bg-[#EDE9FE] transition-colors">
            <Icon className="w-4 h-4 text-[#7C3AED]" strokeWidth={1.5} />
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#A1A1AA]">
              {CATEGORY_META[resource.category]?.label}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={cn(
                'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                resource.tier === 'free' ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#EDE9FE] text-[#7C3AED]'
              )}>
                {resource.tier === 'free' ? 'Free' : 'Founder'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onFavorite() }}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            isFavorited ? 'text-[#C4A264]' : 'text-[#F4F4F5] hover:text-[#C4A264]'
          )}
        >
          <Star className={cn('w-4 h-4', isFavorited && 'fill-current')} />
        </button>
      </div>

      {/* Title + tagline */}
      <div>
        <h3 className="font-semibold text-sm text-[#18181B] leading-snug mb-1">{resource.title}</h3>
        <p className="text-xs text-[#A1A1AA] leading-relaxed">{resource.tagline}</p>
      </div>

      {/* Preview */}
      <p className="text-xs text-[#71717A] leading-relaxed line-clamp-2 border-l-2 border-[#E4E4E7] pl-3 italic">
        {resource.preview}
      </p>

      {/* Best for pills */}
      <div className="flex flex-wrap gap-1.5">
        {resource.bestFor.slice(0, 2).map(b => (
          <span key={b} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FAFAFA] text-[#71717A]">
            {b}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-[#FAFAFA]">
        <div className="flex items-center gap-1 text-[10px] text-[#A1A1AA]">
          <Users className="w-3 h-3" strokeWidth={1.5} />
          {resource.usedBy.toLocaleString()} founders
        </div>
        {canAccess ? (
          <span className="text-xs font-semibold text-[#7C3AED] flex items-center gap-1 group-hover:gap-2 transition-all">
            Open <ArrowRight className="w-3.5 h-3.5" />
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA]">
            <Lock className="w-3 h-3" />
            Upgrade
          </span>
        )}
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VaultPage() {
  const { profile, signOut } = useUser()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category>('all')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [openResource, setOpenResource] = useState<Resource | null>(null)

  const userTier = profile?.subscription_tier ?? 'free'

  const filtered = RESOURCES.filter(r => {
    const q = search.toLowerCase()
    const matchesSearch = !search ||
      r.title.toLowerCase().includes(q) ||
      r.tagline.toLowerCase().includes(q) ||
      r.tags.some(t => t.includes(q))
    const matchesCategory = category === 'all' || r.category === category
    return matchesSearch && matchesCategory
  })

  const featured = filtered.filter(r => r.featured)
  const rest = filtered.filter(r => !r.featured)

  const canAccess = (tier: string) => {
    if (tier === 'free') return true
    if (tier === 'pro') return userTier === 'pro' || userTier === 'ceo'
    return userTier === 'ceo'
  }

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar profile={profile} onSignOut={signOut} />

      <div className="lg:pl-64 pb-20 lg:pb-8">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-[#FAFAFA]/90 backdrop-blur-md border-b border-[#F4F4F5] px-6 py-4">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <h1 className="font-semibold text-sm text-[#18181B]">Resource Vault</h1>
              <p className="text-xs text-[#A1A1AA]">{RESOURCES.length} tools built for founders who are serious</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A1A1AA]" strokeWidth={1.5} />
              <input
                className="w-full pl-8 pr-4 py-2 rounded-xl border border-[#E4E4E7] bg-white text-xs text-[#18181B] placeholder:text-[#A1A1AA] outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 transition-all"
                placeholder="Search resources..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-6">
          {/* Category filters */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            {(Object.entries(CATEGORY_META) as [Category, typeof CATEGORY_META[string]][]).map(([key, meta]) => {
              const Icon = meta.icon
              const count = key === 'all' ? RESOURCES.length : RESOURCES.filter(r => r.category === key).length
              return (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex-shrink-0',
                    category === key
                      ? 'bg-[#18181B] text-white'
                      : 'bg-white border border-[#F4F4F5] text-[#71717A] hover:border-[#A1A1AA]'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {meta.label}
                  <span className={cn(
                    'text-[10px] px-1.5 rounded-full',
                    category === key ? 'bg-white/20 text-white' : 'bg-[#FAFAFA] text-[#A1A1AA]'
                  )}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Featured */}
          {featured.length > 0 && category === 'all' && !search && (
            <div className="mb-8">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A1A1AA] mb-3">Featured this week</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featured.map((r, i) => (
                  <ResourceCard
                    key={r.id} resource={r}
                    canAccess={canAccess(r.tier)}
                    isFavorited={favorites.has(r.id)}
                    onFavorite={() => toggleFavorite(r.id)}
                    onOpen={() => setOpenResource(r)}
                    delay={i * 0.05}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All resources */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-6 h-6 text-[#A1A1AA] mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm font-medium text-[#A1A1AA]">Nothing found for "{search}"</p>
              <p className="text-xs text-[#A1A1AA] mt-1">Try a different keyword or browse by category</p>
            </div>
          ) : (
            <div>
              {!search && category === 'all' && (
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A1A1AA] mb-3">All resources</p>
              )}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(search || category !== 'all' ? filtered : rest).map((r, i) => (
                  <ResourceCard
                    key={r.id} resource={r}
                    canAccess={canAccess(r.tier)}
                    isFavorited={favorites.has(r.id)}
                    onFavorite={() => toggleFavorite(r.id)}
                    onOpen={() => setOpenResource(r)}
                    delay={i * 0.04}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {openResource && (
          <ResourceModal
            resource={openResource}
            isFavorited={favorites.has(openResource.id)}
            onFavorite={() => toggleFavorite(openResource.id)}
            onClose={() => setOpenResource(null)}
          />
        )}
      </AnimatePresence>

      <MobileNav />
    </div>
  )
}
