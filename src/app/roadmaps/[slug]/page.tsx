'use client'


import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Check, Lock, ChevronDown,
  Trophy, Zap, PenLine,
  Plus, X, CheckCircle2,
  ShoppingBag, Monitor, Video, Briefcase, Link2, Leaf,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sidebar } from '@/components/navigation/Sidebar'
import { MobileNav } from '@/components/navigation/MobileNav'
import { useUser } from '@/components/providers/UserProvider'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { setRing } from '@/lib/rings'
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
      mentorNote: string
      minimumViableAction: string
      sections?: { type: 'bigSisterAdvice' | 'quitterWarning' | 'doItScared' | 'wishIKnew'; content: string }[]
    }[]
  }[]
}> = {
  shopify: {
    icon: ShoppingBag,
    title: 'Start a Shopify Brand',
    description: 'Build a profitable e-commerce brand from scratch  -  from product research to your first $10K month.',
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
            checklist: ['Research 5 potential niches', 'Check if people actually search for this niche (use Google Trends at trends.google.com — it\'s free)', 'Validate with TikTok/Instagram', 'Choose your niche'],
            lesson: 'A good niche is specific, has buyers, and is something you can speak about authentically. Think: pet accessories for small dogs, women\'s fitness wear for curvy bodies, natural skincare for melanin-rich skin. The more specific, the less competition and the more loyal your customers.',
            mentorNote: "I know this feels impossible right now. You're probably sitting there with 10 tabs open, a Notes app full of ideas, and a growing anxiety that you'll pick the \"wrong\" one. Here's what nobody tells you: there is no wrong niche — only niches you haven't tested yet. Analysis paralysis is real, and it hits almost every single founder at this exact step. The overwhelm you feel isn't a sign you're not ready. It's a sign you care. Give yourself permission to pick imperfectly and learn as you go. Done beats perfect every single time.",
            minimumViableAction: "Open TikTok right now and search one niche idea you already have. Just look. That's it. That's your first step.",
            sections: [
              {
                type: 'quitterWarning',
                content: "This is where most people quit — they spin in 'research mode' for weeks and never choose. Give yourself 48 hours to decide, then commit. You can always pivot later. A chosen niche you can change beats a perfect niche that never gets started.",
              },
            ],
          },
          {
            id: 's2',
            title: 'Register your Canadian business',
            description: 'Make it official  -  register or incorporate through Ownr in under an hour.',
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
            lesson: 'In Canada, you have two main options: sole proprietorship (fast, low cost, minimal paperwork  -  great to start) or incorporation (more legal protection, better for growth and investors). For most beginners, starting as a sole proprietor is totally fine. Use Ownr.co  -  it walks you through the entire registration or incorporation process online in under an hour, no lawyer required. Once registered, get your Business Number (BN) from the CRA  -  you\'ll need it for taxes and business banking. Keep business and personal money completely separate from day one. For tax questions, speak with a Canadian accountant  -  rules vary by province.',
            mentorNote: "Okay, I need to acknowledge what this moment actually means. You're making it official. That can feel terrifying — like now it's 'real' and you can fail for real. Impostor syndrome tends to peak right here. You might be wondering: 'Who am I to start a business? What if people laugh? What if it doesn't work?' Those thoughts are completely normal. Every woman who has ever built something went through this exact moment. The fear doesn't mean stop — it means you're about to become someone new.",
            minimumViableAction: "Go to Ownr.co right now and look at the registration page. You don't have to start — just look at what's there. Familiarity is the first step.",
            sections: [
              {
                type: 'doItScared',
                content: "You don't need to feel 'ready' to make this official. Make it official and you'll feel ready. The registration takes about 30 minutes. Most of the fear lives in the anticipation — not the actual doing.",
              },
            ],
          },
          {
            id: 's3',
            title: 'Set up your Shopify store',
            description: 'Launch your store with the right settings from day one.',
            xp: 100,
            locked: false,
            completed: false,
            checklist: ['Start Shopify free trial', 'Choose and customize a theme', 'Add your brand colors and logo', 'Set up payment processing', 'Configure shipping settings', 'Add your return policy'],
            lesson: 'Use the Dawn or Debut theme to start  -  they\'re clean, fast, and convert well. Don\'t overthink the design. A simple, fast store beats a beautiful slow one every time. Your settings matter more than your aesthetics early on.',
            mentorNote: "Tech overwhelm hits hard right here. You might be staring at the Shopify dashboard feeling like everyone else knows what they're doing and you're the only one lost. You're not. Most successful Shopify founders felt exactly this way on day one. Perfectionism will whisper that your store needs to be flawless before you launch — ignore it. A 'good enough' store that's live beats a perfect store that never launches. You can improve it every week. Start messy.",
            minimumViableAction: "Start the Shopify free trial. Just that. You don't have to build anything today — just get inside and look around for 10 minutes.",
            sections: [
              {
                type: 'bigSisterAdvice',
                content: "Don't touch the theme code. Don't try to make it look like your favourite brand's store yet. Pick Dawn (it's clean, free, and fast), add your logo and colors, and move on. Your first store's job is to be functional — not beautiful. Beautiful comes after buyers.",
              },
            ],
          },
          {
            id: 's4',
            title: 'Source your first products',
            description: 'Find reliable suppliers and order samples before going live.',
            xp: 100,
            locked: false,
            completed: false,
            checklist: ['Find 3+ suppliers on Alibaba.com or CJDropshipping.com (these are marketplaces where manufacturers list products they can make for your brand)', 'Order samples from top 2', 'Evaluate quality and packaging', 'Ask each supplier about their minimum order quantity (MOQ = the minimum number of items you must buy) and negotiate their price', 'Place your first order'],
            lesson: 'Always order samples before bulk. Check supplier response time, reviews, and product photos. The quality of your packaging matters almost as much as the product  -  your unboxing is your first impression.',
            mentorNote: "Fear of being scammed is completely valid — and almost every new e-commerce founder feels it at this stage. The internet is full of sketchy suppliers, and it's hard to know who to trust. That uncertainty can make you freeze. But here's the thing: ordering samples is literally the system designed to protect you. You don't have to trust anyone blindly — you get to verify first. Take it one supplier at a time. Slow and careful is still progress.",
            minimumViableAction: "Search one product idea on Alibaba.com today. Just browse the listings. Don't order anything, don't contact anyone — just see what exists out there.",
            sections: [
              {
                type: 'wishIKnew',
                content: "I wish someone had told me: the first supplier you find probably isn't the one you'll use — and that's completely normal. Sampling a few and discarding most is the actual process. It's not a sign you're doing it wrong. It's due diligence, and every successful brand did exactly this.",
              },
            ],
          },
          {
            id: 's5',
            title: 'Build your brand identity with Canva',
            description: 'Logo, colors, fonts, and visuals  -  built in Canva for free.',
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
            lesson: 'Canva is the tool to start with  -  it\'s free, beginner-friendly, and everything you need is in one place. Start with a simple logo using their free templates. Search "minimalist logo" for clean, professional options. Once your logo is done, set up a Brand Kit in Canva so your colors and fonts auto-apply to every new design. Create a few Instagram post templates while you\'re in there  -  this lets you batch your content in 30 minutes instead of starting from scratch each time. Your Canva Brand Kit will also be the source for your Stan Store cover images, product covers, and any PDFs or freebies you create.',
            mentorNote: "This is the step where perfectionism goes absolutely feral. You'll look at polished brand accounts and feel like yours looks 'amateur.' You'll redo your logo six times. You'll change your brand colors at 2am. I'm telling you this because it's going to happen, and I want you to recognize it when it does. Your brand doesn't have to be perfect — it has to be consistent. Pick three words that feel like you, choose colors you love, and commit. You can always refine later. Brands evolve. Yours will too.",
            minimumViableAction: "Write down 3 words that describe how you want your brand to feel. Three words. That's your entire brand strategy on day one. Everything else builds from those 3 words.",
            sections: [
              {
                type: 'quitterWarning',
                content: "This is where the perfectionism spiral starts — and it can eat weeks. Most people spend so long on 'branding' that they never actually open their store. Give yourself one focused afternoon. Lock in what you have. Move forward. You will refine it over time, and that's normal and expected.",
              },
            ],
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
            checklist: ['Write product titles that include: what it is + who it\'s for + one key benefit (this format helps Google find you — that\'s called SEO)', 'Write benefit-focused descriptions', 'Take/edit professional product photos', 'Set your price (aim for 3–4× your product cost to cover shipping, ads, packaging, and still make profit)', 'Add size guides if needed'],
            lesson: 'Your product title should include: what it is, who it\'s for, and a key benefit. Example: "Moisturizing Body Butter for Dry Skin  -  Shea & Vitamin E, Women\'s Daily Skincare". Lead with the benefit, not the feature.',
            mentorNote: "Here's a truth about this step: putting your work out there for strangers to judge is genuinely scary. What if nobody buys? What if someone leaves a bad review? What if people laugh? Those fears are real, and I'm not going to minimize them. But staying hidden costs more than being seen. Write the listing like you're explaining it to a friend who needs exactly this product. Authenticity beats polished copy every time.",
            minimumViableAction: "Fill in this sentence right now: 'This product is for ______ who want ______ so they can ______.' That one sentence is the foundation of every product listing you write.",
            sections: [
              {
                type: 'bigSisterAdvice',
                content: "Write your description by answering three questions: Who is this for? What problem does it solve? What will their life look or feel like after using it? Answer those three questions in plain English and you have your listing. No marketing degree required.",
              },
            ],
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
            mentorNote: "Comparison is going to hit hardest right here. You'll look at accounts with 50K followers and feel like you're starting impossibly behind. Everyone with a big following started at zero — including the ones who make it look effortless. The fear of being judged, of posting content and getting silence, of putting your face or brand out there? It's universal. Post anyway. The algorithm rewards consistency, not perfection. Your first posts don't have to be good — they have to exist.",
            minimumViableAction: "Set up your Instagram business account right now. Just the account. Don't post anything yet, don't worry about the bio — just have the account exist and be in your name.",
            sections: [
              {
                type: 'doItScared',
                content: "Post your first piece of content before you feel ready. The algorithm doesn't reward perfect — it rewards consistent. Your first posts will feel awkward. That's not a sign you're doing it wrong. That's proof you started. Your future customers need you to show up before you feel confident.",
              },
            ],
          },
          {
            id: 'l3',
            title: 'Launch your store',
            description: 'Go live and make your first sale.',
            xp: 200,
            locked: true,
            completed: false,
            checklist: ['Remove Shopify password page', 'Announce on all social platforms', 'Email your personal network', 'Run a launch discount (10-15%)', 'Post launch content every day for 7 days'],
            lesson: 'Your first sale will not come from strangers. It will come from someone who knows, likes, and trusts you. Tell everyone. Post about it everywhere. Text people directly. There is no shame in a public launch  -  only in staying hidden.',
            mentorNote: "Launch anxiety is one of the most common reasons businesses never actually launch. You find one more thing to fix, one more photo to retake, one more tweak to make. That's perfectionism trying to protect you from the vulnerability of being seen. And 'crickets' on launch day is genuinely one of the most crushing feelings in entrepreneurship — I won't pretend otherwise. But a quiet launch is something you can build from. An un-launched store is a dream that never got its chance. You're ready.",
            minimumViableAction: "Tell one person about your store today. Text them, DM them, or say it out loud. One person. That counts. That is a real launch action.",
            sections: [
              {
                type: 'quitterWarning',
                content: "This is where most businesses never actually launch. The founder finds one more thing to fix. Then another. Then another. Here is the truth: there will always be something to fix. A live store with flaws gets sales. A perfect store that never goes live earns nothing. Press the button.",
              },
            ],
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
            checklist: ['Set up Meta Business Manager', 'Install the Meta Pixel on your Shopify store — it\'s a small tracking code that helps your ads reach the right people (Shopify has a one-click install in Settings → Apps)', 'Create your first ad creative', 'Set a $10/day test budget (you can pause anytime — this is your learning investment, not a gamble)', 'Analyze results after 7 days'],
            lesson: 'Start with a $10/day budget on a single ad set. Test one variable at a time  -  image, copy, or audience. Never change multiple things at once or you won\'t know what moved the needle. Data after 7 days, then iterate.',
            mentorNote: "Spending money on ads when your business is new feels terrifying. What if you lose it all? What if it doesn't work? What if you're not smart enough to do this right? Those fears are so common in the female founder community — and they're compounded by the fact that most paid ads education is designed for people with big budgets and marketing degrees. At $10/day, you're buying data, not results. You're learning, not gambling. Reframe this as tuition, not spending.",
            minimumViableAction: "Set up your Meta Business Manager account at business.facebook.com. Don't create an ad yet — just get the account set up so you're ready when the time comes.",
            sections: [
              {
                type: 'wishIKnew',
                content: "I wish someone had told me: your first ad campaign will probably not work — and that's the whole point. You're not trying to go viral. You're buying data. You're learning what messaging, images, and audiences respond to your product. Think of your first $10/day as paying tuition at a very practical business school.",
              },
            ],
          },
          {
            id: 'g2',
            title: 'Build your email list',
            description: 'Email is your most valuable owned asset.',
            xp: 100,
            locked: true,
            completed: false,
            checklist: ['Create a free Klaviyo account at klaviyo.com (Klaviyo is an email marketing tool — free for your first 500 subscribers, no credit card required)', 'Create a welcome popup with 10% discount', 'Write 3-email welcome sequence', 'Set up an abandoned cart email — this automatically emails someone who added to cart but didn\'t check out (this one email can recover 10–15% of lost sales)', 'Send weekly broadcast emails'],
            lesson: 'Email converts 3–5× better than social media. Every follower you earn should eventually land on your email list. Social platforms own your audience  -  your email list is yours forever.',
            mentorNote: "New tools, new systems, new overwhelm — this is where a lot of founders hit a wall. Klaviyo has a learning curve. Email sequences feel complicated. It's easy to feel like 'other people' understand this stuff and you don't. But here's what matters: every email you send is going directly to someone who raised their hand and said 'I want to hear from you.' That's rare and powerful. Start with one email. It doesn't have to be perfect. It just has to land in their inbox.",
            minimumViableAction: "Create a free Klaviyo account at klaviyo.com. Just the account. You don't have to set up anything today — just have the account so you can connect it to your store.",
            sections: [
              {
                type: 'bigSisterAdvice',
                content: "Your first welcome email doesn't need to be a masterpiece. Write it like you're texting a friend who just signed up: 'Hey! So glad you're here. Here's what you signed up for and what to expect from me...' That warmth and personality will convert better than any polished corporate copy.",
              },
            ],
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
            lesson: 'The jump from $1K to $5K is about doubling down on what works. Look at your data  -  what product has the best margin and conversion rate? Pour your energy and budget into that. Cut what isn\'t working without emotional attachment.',
            mentorNote: "If you're here and you haven't hit $5K yet, please hear this: the gap between where you are and where you want to be is not a sign of failure — it's a sign that you're still in the game. Most founders feel like they're doing everything right and not seeing results, and that discouragement is one of the hardest emotional hurdles in business. The answer is almost never 'work harder' — it's 'work smarter on fewer things.' What's actually working? Do more of that. Everything else can wait.",
            minimumViableAction: "Open your Shopify analytics right now and find your single best-selling product. Write it down. That one product is your entire focus for the next 30 days.",
            sections: [
              {
                type: 'quitterWarning',
                content: "The plateau between $1K and $5K/month is where most stores get abandoned. It feels like you've hit a ceiling. You feel like you must be doing something wrong because growth has slowed. You haven't hit a ceiling — you've hit the moment where data-driven focus matters more than scattered hustle. Double down on what's already working.",
              },
            ],
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
            checklist: ['List your top 5 skills or knowledge areas', 'Research what sells in your niche', 'Choose: ebook, course, template, or toolkit', 'Validate your idea — post an Instagram poll or question box asking: "Would you pay for a guide on [your topic]?" At least a few yes answers means you\'re onto something'],
            lesson: 'The fastest digital product to create is a PDF guide or template pack. Courses take longer but earn more. Done is better than perfect  -  start simple and upgrade later. You can always expand a guide into a course once you have buyers.',
            mentorNote: "There is a specific kind of impostor syndrome that hits digital product creators, and it sounds like this: 'Who am I to charge for this? Other people know way more than me. No one is going to pay for what I know.' It's one of the most paralyzing thoughts in online business — and almost every single person who has ever sold a digital product felt it before their first sale. You don't need to be the world's leading expert. You need to be a few steps ahead of the person you're helping. That's enough.",
            minimumViableAction: "Write down one specific problem you already know how to solve — one sentence. 'I know how to help people ______.' That is your first product idea.",
            sections: [
              {
                type: 'bigSisterAdvice',
                content: "Start with a PDF guide or a checklist — not a full course. You can create a PDF in a weekend. A course can take months, and perfectionism will make it take even longer. Get one product finished and sold first. Expand into a course once you know people want what you're offering.",
              },
            ],
          },
          {
            id: 'd2',
            title: 'Create your first product',
            description: 'Build it once, sell it forever.',
            xp: 150,
            locked: false,
            completed: false,
            checklist: ['Outline your product content', 'Create in Canva, Notion, or Google Docs', 'Design a professional cover', 'Export as PDF', 'Set your price ($27-$97 for beginners)'],
            lesson: 'Your first product doesn\'t need to be a masterpiece  -  it needs to solve one specific problem for one specific person. Outline first, then write, then design. In that order. The cover matters more than you think; it\'s your first impression.',
            mentorNote: "Perfectionism will try to destroy this step. You'll outline and re-outline. You'll decide the topic isn't good enough. You'll wonder if it's too basic or too advanced. You'll want to redesign the cover before you've even written the content. I need you to hear this clearly: a finished, imperfect product beats a perfect product that exists only in your head. Get the words down first. Then design. Then launch. Then improve. In that order. Always.",
            minimumViableAction: "Write a 5-bullet outline for your product right now. Five bullets. That's your whole product structure on day one. You can add more later, but start with five.",
            sections: [
              {
                type: 'quitterWarning',
                content: "This is where the perfectionism spiral eats people alive. They outline, re-outline, change the topic, decide it's not good enough, redesign the cover before they've written a word, and never finish. Set a hard deadline: 7 days to a finished, imperfect product. Finished and out in the world beats perfect and still in your drafts.",
              },
            ],
          },
          {
            id: 'd3',
            title: 'Set up your Stan Store',
            description: 'Your entire storefront, freebie funnel, and bio link  -  all in one place.',
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
            lesson: 'Stan Store is the tool for Canadian creators and online business owners  -  free to start, and it handles payments, product delivery, email capture, and your bio link all in one place. Here\'s how the funnel works: someone finds you on Instagram → they see your content → they click your bio link → they download your free resource → they join your email list → eventually they buy your paid product. Always create a freebie first (a checklist, PDF guide, or Canva template). Then use Instagram DM automations like "comment GUIDE below" or "DM me the word START" to drive traffic into your Stan Store without paying for ads. This is the exact system that moves someone from a stranger seeing your Reel to a paying customer.',
            mentorNote: "Tech setup always brings a wave of 'am I doing this right?' anxiety. Funnels and email captures and payment setup — it can feel like you need a degree just to sell a PDF. You don't. Stan Store was built specifically for people who are not tech experts. If you get stuck, their support is genuinely good. Every successful digital product creator fumbled through the setup at the start. You are not behind. You are exactly where you're supposed to be.",
            minimumViableAction: "Go to stan.store and create your free account. Don't upload anything yet — just have the account exist with your name on it.",
            sections: [
              {
                type: 'doItScared',
                content: "The tech setup always feels harder than it is until you're inside it. You will probably be confused for about 20–30 minutes, and then something will click. Every single person who uses Stan Store had those same confused 30 minutes. They pushed through. So will you. The confusion is temporary. The store is permanent.",
              },
            ],
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
            mentorNote: "This is the step that stops most people cold — not because they can't do it, but because launching means being judged by people who actually know you. The fear of family or friends seeing you put yourself out there and failing publicly is deeply real. Most founders underestimate how much this fear holds them back. But here's what's also true: the people in your corner are rooting for you harder than you know. And strangers on the internet? They're either buying or scrolling past. Either way, you're still standing.",
            minimumViableAction: "Write your launch announcement post right now — but don't post it yet. Just write it. Having it written and ready removes the biggest barrier between you and actually posting.",
            sections: [
              {
                type: 'doItScared',
                content: "The hardest part of launching a digital product is knowing that people who went to school with you, used to work with you, or follow you for other reasons will see it. That vulnerability is so real. Launch anyway. The people who judge you for trying were never going to support you regardless. And the strangers who need what you made? They're out there waiting.",
              },
            ],
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
            description: 'The riches are in the niches  -  get specific.',
            xp: 50,
            locked: false,
            completed: false,
            checklist: ['List what you could talk about for hours', 'Research 3 creators in your niche', 'Define your unique angle', 'Write your content mission statement'],
            lesson: 'You don\'t need to be the most expert person  -  you need to be the most relatable. "Business tips from a 23-year-old building her first brand" is more compelling than "business tips". Your perspective is your product.',
            mentorNote: "The pressure to pick the 'right' niche before you've even started can feel suffocating. What if it's too small? What if it's too competitive? What if you get bored? Confusion at this stage is not a problem — it's information. You don't need to have it figured out. Your niche often sharpens over time as you create and see what resonates. The creators you admire most? Many of them 'found' their niche after posting consistently for months. Give yourself the same grace.",
            minimumViableAction: "Post one piece of content today. Even if it doesn't feel 'on brand' yet. Even if it's rough. One post. That's the whole assignment.",
            sections: [
              {
                type: 'wishIKnew',
                content: "I wish someone had told me: you don't find your niche — you create it by showing up consistently. The creators who seem to have a perfectly defined niche actually just kept posting about the same things until it became their identity. You don't need a perfect niche to start. You need to start to find your niche.",
              },
            ],
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
            mentorNote: "The fear of being on camera, of saying something stupid, of looking less polished than the accounts you follow — these are real feelings that stop millions of people from ever posting. Here's what's true: nobody starts polished. The creators with pristine aesthetics and confident delivery had a year of cringeworthy content before they found their voice. Your first posts will feel awkward. That's not a sign you're doing it wrong — it's proof you're doing it at all. Show up. Consistently. The rest follows.",
            minimumViableAction: "Record a 15-second video on your phone today — just you talking about anything related to your topic. Don't post it. Just record it. That's how you start getting comfortable on camera.",
            sections: [
              {
                type: 'bigSisterAdvice',
                content: "If you're starting from zero followers, choose TikTok first. I know Instagram feels more familiar — but TikTok's algorithm actively distributes content from brand new accounts to people who don't follow you yet. Your first 100–500 followers will come much faster there. Then cross-post everything to Instagram and let it grow alongside.",
              },
            ],
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
            checklist: ['List your top 3 marketable skills', 'Define your ideal client', 'Write your service offer in one sentence', 'Set your starting price ($500–$1,500 per project is a normal beginner range — raise it after your first happy client)', 'Create a simple service menu'],
            lesson: 'The more specific your offer, the easier it is to sell. "I help women-owned product brands grow on Instagram" beats "social media manager" every time. Specificity signals expertise.',
            mentorNote: "Impostor syndrome is loudest here. 'Why would anyone pay me? There are so many people better than me. I don't have enough experience. I should wait until I know more.' These thoughts are so common among women starting service businesses — and they're almost never grounded in reality. You have skills that other people genuinely need and would pay for. The gap between what you know and what you charge for is not a gap in ability — it's a gap in confidence. And confidence is built through action, not waiting.",
            minimumViableAction: "Fill in this sentence: 'I help ______ do/get ______ so they can ______.' That's your service offer. It doesn't have to be perfect — write it now and refine it later.",
            sections: [
              {
                type: 'bigSisterAdvice',
                content: "Your offer is not: 'I do social media management.' Your offer is: 'I help female-owned product brands get consistent Instagram growth without spending hours creating content.' The more specific your offer is, the more you can charge for it, and the easier it is for the right clients to say yes immediately.",
              },
            ],
          },
          {
            id: 'sv2',
            title: 'Get your first client',
            description: 'Your network is your net worth  -  start there.',
            xp: 200,
            locked: false,
            completed: false,
            checklist: ['List 20 people who might need your service', 'Send 10 personalized DMs or emails', 'Offer a discounted first project', 'Ask for a testimonial when done', 'Raise your rates after first client'],
            lesson: 'Your first client will come from your existing network 90% of the time. Don\'t wait to build a following. Reach out to people you already know today. One warm yes beats 100 cold no\'s.',
            mentorNote: "Reaching out to people and potentially hearing 'no' — or worse, hearing nothing — is one of the scariest parts of starting a service business. Rejection feels personal even when it isn't. The silence of unread messages hits harder than we expect. But every client-based business was built one uncomfortable conversation at a time. Your first 'yes' is closer than it feels. And the people you reach out to? Most of them are rooting for you, even if the timing isn't right.",
            minimumViableAction: "Write a list of 5 people in your phone or on social media who might know someone who needs your service. Don't message them yet — just make the list. The list is the first step.",
            sections: [
              {
                type: 'quitterWarning',
                content: "Most service business owners quit at exactly this step — not because they're not good enough, but because reaching out feels too vulnerable. They wait for clients to find them. Clients don't find people who haven't told anyone they exist. You have to make the first move. Everyone who has a client-based business sent uncomfortable messages to get their first one.",
              },
            ],
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
            checklist: ['List products you use daily and love', 'Check if each has an affiliate program', 'Apply to 3–5 affiliate programs — they\'re free to join. Good ones to start with: Amazon.ca, LTK (formerly LikeToKnowIt), ShareASale, or email brands you already love and ask if they have an affiliate program', 'Choose your primary content platform', 'Create a content plan built around your products'],
            lesson: 'The most successful affiliates recommend products they actually use. Your audience can tell when you\'re chasing a commission. Authenticity converts  -  a genuine recommendation from a trusted voice outperforms any polished ad. For Canadians: Amazon.ca affiliate program, LTK (formerly Like to Know It), and direct brand affiliate programs all work in Canada. Always disclose affiliate relationships clearly  -  it\'s required by the Canadian Competition Bureau.',
            mentorNote: "Affiliate marketing has a reputation problem — there's so much hype and so many promises of 'passive income overnight' that it can be hard to know what's real. That skepticism is healthy. But it can also make you hesitant to start because you're not sure it will actually work for you. The difference between affiliates who earn and affiliates who don't is almost always authenticity and consistency. If you genuinely love a product and talk about it honestly to people who trust you, it will convert. Start with what you already use.",
            minimumViableAction: "Make a list of 5 products you already use and genuinely love. Google each one with the words 'affiliate program' after the name. That's your whole research session for today.",
            sections: [
              {
                type: 'wishIKnew',
                content: "I wish someone had told me earlier: the most successful affiliate content isn't 'buy this!' — it's genuinely useful content that happens to recommend a product. A tutorial. An honest review. A 'what I use every day.' Lead with the help first, and recommend second. That's what converts and what your audience will actually trust.",
              },
            ],
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
            lesson: 'Licensing for beauty and wellness businesses in Canada is governed provincially  -  the rules in Ontario, BC, and Alberta are all different. Check your provincial regulatory body (e.g. College of Nurses for medical aesthetics, provincial cosmetology board for esthetics). For medical treatments like injectables, a medical director or RN may be required regardless of province. For insurance, look at Intact Insurance, BFL Canada, or specialty wellness coverage providers. Register your business through Ownr.co  -  it handles provincial and federal incorporation online with no lawyer needed. Do not rely on US-based advice for Canadian licensing  -  always verify with your province directly.',
            mentorNote: "The regulatory side of beauty and wellness businesses in Canada is genuinely complicated — and that complexity can feel like a wall between you and your dream. It's common to feel overwhelmed, to second-guess whether this path is even possible, or to worry you'll miss something important and face consequences. That fear is not irrational — it's responsible. Take it one checkbox at a time. You don't have to know everything before you start. You just have to start the research. Every licensed spa owner was once exactly where you are right now.",
            minimumViableAction: "Find the phone number for your province's cosmetology or health regulatory board today. Just find it and write it down. One phone call to them replaces hours of confusing online research.",
            sections: [
              {
                type: 'bigSisterAdvice',
                content: "The licensing process looks like a maze when you first Google it — especially because the rules are different in every province and the information online is often out of date or US-focused. Here's what actually works: call your provincial regulatory board directly and tell them exactly what services you plan to offer. They will tell you exactly what you need. One call, clear answers.",
              },
            ],
          },
        ],
      },
    ],
  },
}

// ── Mentor section display config ────────────────────────────────────────────
const SECTION_CONFIGS = {
  bigSisterAdvice: {
    icon: '💜',
    label: 'Big Sister Advice',
    bg: '#EDE9FE',
    border: '#C4B5FD',
    labelColor: '#6D28D9',
    textColor: '#4C1D95',
  },
  quitterWarning: {
    icon: '🚨',
    label: 'This Is Where Most People Quit',
    bg: '#FEF2F2',
    border: '#FECACA',
    labelColor: '#DC2626',
    textColor: '#7F1D1D',
  },
  doItScared: {
    icon: '🔥',
    label: 'Do This Even If You\'re Scared',
    bg: '#FEF9C3',
    border: '#FDE68A',
    labelColor: '#CA8A04',
    textColor: '#713F12',
  },
  wishIKnew: {
    icon: '✨',
    label: 'What I Wish I Knew',
    bg: '#F0F9FF',
    border: '#BAE6FD',
    labelColor: '#0369A1',
    textColor: '#0C4A6E',
  },
} as const

// ──────────────────────────────────────────
// "Do This Now" — one direct action per step
// ──────────────────────────────────────────
const STEP_ACTIONS: Record<string, { label: string; url: string }> = {
  // Shopify
  s1:  { label: 'Research niches on Google Trends', url: 'https://trends.google.com' },
  s2:  { label: 'Register your business on Ownr.co', url: 'https://ownr.co' },
  s3:  { label: 'Start your Shopify free trial', url: 'https://shopify.com/free-trial' },
  s4:  { label: 'Browse suppliers on Alibaba', url: 'https://alibaba.com' },
  s5:  { label: 'Open Canva and start your logo', url: 'https://canva.com' },
  l1:  { label: 'Open your Shopify product editor', url: 'https://shopify.com/login' },
  l2:  { label: 'Create your Instagram business account', url: 'https://www.instagram.com/accounts/convert_to_professional' },
  l3:  { label: 'Go live — remove your store password', url: 'https://shopify.com/login' },
  g1:  { label: 'Open Meta Business Manager', url: 'https://business.facebook.com' },
  g2:  { label: 'Start free with Klaviyo', url: 'https://klaviyo.com' },
  sc1: { label: 'View your Shopify analytics', url: 'https://shopify.com/login' },
  // Digital products
  d1:  { label: 'See what\'s trending on TikTok', url: 'https://tiktok.com' },
  d2:  { label: 'Create your product in Canva', url: 'https://canva.com/create/ebooks' },
  d3:  { label: 'Set up your Stan Store', url: 'https://stan.store' },
  dl1: { label: 'Post your launch content on Instagram', url: 'https://instagram.com' },
  // Creator
  c1:  { label: 'Research your niche on TikTok', url: 'https://tiktok.com' },
  c2:  { label: 'Set up your Instagram business profile', url: 'https://instagram.com' },
  c3:  { label: 'Create your first Reel today', url: 'https://instagram.com' },
  cm1: { label: 'Set up your Stan Store', url: 'https://stan.store' },
  cm2: { label: 'Pitch your first brand deal', url: 'https://app.grin.co' },
  // Service business
  sv1: { label: 'List your service on Fiverr', url: 'https://fiverr.com/selling' },
  sv2: { label: 'Create a proposal template in Canva', url: 'https://canva.com' },
  sv3: { label: 'Set up your booking link on Calendly', url: 'https://calendly.com' },
  // Affiliate
  a1:  { label: 'Browse affiliate programs on ShareASale', url: 'https://shareasale.com' },
  a2:  { label: 'Apply to Amazon Associates', url: 'https://affiliate-program.amazon.ca' },
  a3:  { label: 'Create a link-in-bio with Stan Store', url: 'https://stan.store' },
  // Med spa
  ms1: { label: 'Check your province\'s licensing rules', url: 'https://canada.ca/en/health-canada.html' },
  ms2: { label: 'Register your business on Ownr.co', url: 'https://ownr.co' },
  ms3: { label: 'Set up online booking with Jane App', url: 'https://jane.app' },
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
            This is your founder workspace. Capture ideas, decisions, and notes as you work through this step  -  it auto-saves and stays with your roadmap.
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
// XPBurst
// ──────────────────────────────────────────
function XPBurst({ xp, onDone }: { xp: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
    >
      <div
        className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-bold text-sm shadow-xl"
        style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)' }}
      >
        <motion.span
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >⚡</motion.span>
        +{xp} XP earned
      </div>
    </motion.div>
  )
}

// ──────────────────────────────────────────
// PhaseCompleteOverlay
// ──────────────────────────────────────────
function PhaseCompleteOverlay({
  phaseName, xpEarned, hasNextPhase, onNextPhase, onDashboard
}: {
  phaseName: string; xpEarned: number; hasNextPhase: boolean
  onNextPhase: () => void; onDashboard: () => void
}) {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    color: ['#7C3AED','#A78BFA','#F9A8D4','#FCD34D','#6EE7B7'][i % 5],
  }))
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#18181B] px-8"
    >
      {particles.map(p => (
        <motion.div key={p.id}
          initial={{ y: '110vh', opacity: 1 }}
          animate={{ y: '-20vh', opacity: 0 }}
          transition={{ duration: 1.4 + Math.random() * 0.8, delay: p.delay, ease: 'easeOut' }}
          className="absolute w-2 h-2 rounded-full"
          style={{ background: p.color, left: `${p.left}%` }}
        />
      ))}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.25, type: 'spring', stiffness: 300 }}
        className="text-center z-10"
      >
        <div className="text-6xl mb-4">👑</div>
        <p className="text-[#A78BFA] text-xs font-bold uppercase tracking-widest mb-2">Phase Complete</p>
        <h2 className="text-3xl font-bold text-white mb-1">{phaseName}</h2>
        <p className="text-[#71717A] text-sm mb-8">+{xpEarned} XP earned this phase</p>
        <div className="space-y-3 w-full max-w-xs mx-auto">
          {hasNextPhase && (
            <button onClick={onNextPhase}
              className="w-full py-4 rounded-2xl text-white font-bold text-base"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)' }}>
              Continue to Next Phase →
            </button>
          )}
          <button onClick={onDashboard}
            className="w-full py-3 rounded-2xl text-[#71717A] text-sm font-medium hover:text-white transition-colors">
            Back to Dashboard
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ──────────────────────────────────────────
// StepTrail
// ──────────────────────────────────────────
function StepTrail({
  milestones, completedIds, activeIndex, onSelect
}: {
  milestones: (typeof ROADMAP_DATA)['shopify']['phases'][0]['milestones']
  completedIds: Set<string>; activeIndex: number; onSelect: (i: number) => void
}) {
  const activeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeIndex])

  return (
    <div className="flex items-center overflow-x-auto scrollbar-hide px-1 py-2 gap-0">
      {milestones.map((m, i) => {
        const done = completedIds.has(m.id)
        const active = i === activeIndex
        const locked = m.locked && !done
        return (
          <div key={m.id} className="flex items-center flex-shrink-0">
            {i > 0 && (
              <div className={cn('h-px w-6 transition-all', done ? 'bg-[#7C3AED]' : 'bg-[#E4E4E7]')} />
            )}
            <button
              ref={active ? activeRef : undefined}
              onClick={() => !locked && onSelect(i)}
              className={cn(
                'flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-200',
                active
                  ? 'w-9 h-9 bg-[#7C3AED] shadow-lg ring-4 ring-[#7C3AED]/20'
                  : done
                  ? 'w-7 h-7 bg-[#18181B]'
                  : locked
                  ? 'w-6 h-6 border-2 border-[#E4E4E7] bg-transparent opacity-40'
                  : 'w-6 h-6 border-2 border-[#D4D4D8] bg-white hover:border-[#7C3AED] transition-colors'
              )}
            >
              {active ? (
                <span className="text-[11px] font-bold text-white">{i + 1}</span>
              ) : done ? (
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              ) : locked ? (
                <Lock className="w-2.5 h-2.5 text-[#A1A1AA]" />
              ) : (
                <span className="text-[10px] font-semibold text-[#A1A1AA]">{i + 1}</span>
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ──────────────────────────────────────────
// FocusedStepCard
// ──────────────────────────────────────────
function FocusedStepCard({
  milestone, index, total, phaseColor, isCompleted,
  savedChecklist, onComplete, onChecklistChange,
  onNext, onPrev, hasNext, hasPrev, userId,
}: {
  milestone: (typeof ROADMAP_DATA)['shopify']['phases'][0]['milestones'][0]
  index: number; total: number; phaseColor: string; isCompleted: boolean
  savedChecklist: Record<number, boolean>
  onComplete: () => void
  onChecklistChange: (itemIndex: number, value: boolean) => void
  onNext?: () => void; onPrev?: () => void
  hasNext: boolean; hasPrev: boolean; userId?: string
}) {
  const [checked, setChecked] = useState<Record<number, boolean>>(savedChecklist)
  const [completed, setCompleted] = useState(isCompleted)
  const [showCoach, setShowCoach] = useState(false)
  const [showWorkspace, setShowWorkspace] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [showSharePrompt, setShowSharePrompt] = useState(false)

  useEffect(() => { setCompleted(isCompleted) }, [isCompleted])
  useEffect(() => { setChecked(savedChecklist) }, [milestone.id]) // eslint-disable-line

  const completedCount = Object.values(checked).filter(Boolean).length
  const totalCount = milestone.checklist.length
  const progress = totalCount > 0 ? completedCount / totalCount : 0
  const allDone = completedCount === totalCount

  const toggleItem = (i: number) => {
    if (milestone.locked || completed) return
    const newVal = !checked[i]
    setChecked(prev => ({ ...prev, [i]: newVal }))
    onChecklistChange(i, newVal)
  }

  const markComplete = () => {
    setCompleted(true)
    setCelebrating(true)
    onComplete()
    setTimeout(() => setShowSharePrompt(true), 2200)
  }

  return (
    <>
      <AnimatePresence>
        {celebrating && <XPBurst xp={milestone.xp} onDone={() => setCelebrating(false)} />}
      </AnimatePresence>

      {/* Community share prompt */}
      <AnimatePresence>
        {showSharePrompt && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="fixed bottom-24 lg:bottom-8 left-4 right-4 z-50 max-w-sm mx-auto"
          >
            <div className="bg-[#18181B] rounded-2xl p-4 border border-[#3F3F46] shadow-2xl">
              <p className="text-white text-sm font-bold mb-1">🎉 Step complete!</p>
              <p className="text-[#71717A] text-xs mb-3">Share your win with the community. Someone needs to see this today.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowSharePrompt(false)
                    const msg = `Just completed "${milestone.title}" on my roadmap! 🚀 #CEOera`
                    if (typeof window !== 'undefined') {
                      sessionStorage.setItem('community_prefill', msg)
                    }
                    window.location.href = '/community'
                  }}
                  className="flex-1 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-bold hover:bg-[#5B21B6] transition-colors"
                >
                  Share win →
                </button>
                <button
                  onClick={() => setShowSharePrompt(false)}
                  className="px-4 py-2 rounded-xl bg-[#27272A] text-[#71717A] text-xs font-medium hover:bg-[#3F3F46] transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={milestone.id}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        drag={!milestone.locked ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={(_, info) => {
          if ((info.offset.x < -60 || info.velocity.x < -400) && hasNext) onNext?.()
          if ((info.offset.x > 60 || info.velocity.x > 400) && hasPrev) onPrev?.()
        }}
        className="bg-white rounded-3xl overflow-hidden border border-[#F0F0F0] shadow-card"
        style={{ touchAction: 'pan-y', cursor: milestone.locked ? 'default' : 'grab' }}
      >
        {/* Dark header */}
        <div className="p-6 pb-5" style={{ background: '#18181B' }}>
          <div className="w-8 h-1 rounded-full mb-5" style={{ background: phaseColor }} />
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[#52525B] text-xs font-semibold uppercase tracking-widest mb-2">
                Step {index + 1}
              </p>
              <h2 className="text-white text-[22px] font-bold leading-tight">
                {milestone.title}
              </h2>
            </div>
            {completed && (
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1"
                style={{ background: phaseColor + '30' }}>
                <Check className="w-5 h-5" style={{ color: phaseColor }} strokeWidth={2.5} />
              </div>
            )}
            {milestone.locked && (
              <div className="w-9 h-9 rounded-2xl border border-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                <Lock className="w-4 h-4 text-[#52525B]" />
              </div>
            )}
          </div>

          {/* Task progress bar */}
          {!completed && !milestone.locked && (
            <div className="mt-4">
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: phaseColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <p className="text-[#52525B] text-xs mt-1.5">
                {completedCount} of {totalCount} tasks done
              </p>
            </div>
          )}
        </div>

        {/* White content */}
        <div className="p-5 space-y-5">
          {/* Description */}
          <p className="text-[#52525B] text-sm leading-relaxed">
            {milestone.description}
          </p>

          {/* Mentor Note */}
          {milestone.mentorNote && !milestone.locked && (
            <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#EA580C] mb-2">
                💗 Big Sister Note
              </p>
              <p className="text-sm text-[#7C2D12] leading-relaxed">
                {milestone.mentorNote}
              </p>
            </div>
          )}

          {/* Named mentor sections */}
          {!milestone.locked && milestone.sections?.map((section, i) => {
            const cfg = SECTION_CONFIGS[section.type]
            return (
              <div
                key={i}
                className="rounded-2xl p-4 border"
                style={{ background: cfg.bg, borderColor: cfg.border }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-2"
                  style={{ color: cfg.labelColor }}
                >
                  {cfg.icon} {cfg.label}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: cfg.textColor }}>
                  {section.content}
                </p>
              </div>
            )
          })}

          {/* Minimum Viable Action */}
          {!milestone.locked && milestone.minimumViableAction && (
            <div className="rounded-2xl p-4 border border-[#BBF7D0]" style={{ background: '#F0FDF4' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#15803D] mb-2">
                ⚡ Minimum Viable Action
              </p>
              <p className="text-sm leading-relaxed text-[#14532D]">
                {milestone.minimumViableAction}
              </p>
            </div>
          )}

          {/* Do This Now CTA */}
          {!milestone.locked && !completed && STEP_ACTIONS[milestone.id] && (
            <a
              href={STEP_ACTIONS[milestone.id].url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full px-4 py-3.5 rounded-2xl text-white font-semibold text-sm transition-all active:scale-[0.98]"
              style={{ background: '#18181B' }}
            >
              <span>👉 {STEP_ACTIONS[milestone.id].label}</span>
              <span className="text-[#71717A] text-xs ml-2 flex-shrink-0">Open →</span>
            </a>
          )}

          {/* Tasks */}
          {!milestone.locked && (
            <div className="space-y-2">
              {milestone.checklist.map((item, i) => (
                <motion.button
                  key={i}
                  onClick={() => toggleItem(i)}
                  disabled={milestone.locked || completed}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all active:bg-[#F4F4F5]',
                    checked[i] ? 'bg-[#F4F4F5]' : 'bg-[#FAFAFA] hover:bg-[#F4F4F5]'
                  )}
                >
                  <motion.div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors',
                      checked[i] ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-[#D4D4D8] bg-white'
                    )}
                    animate={{ scale: checked[i] ? [1, 1.3, 1] : 1 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 15 }}
                  >
                    {checked[i] && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </motion.div>
                    )}
                  </motion.div>
                  <span className={cn(
                    'text-sm font-medium leading-snug',
                    checked[i] ? 'text-[#A1A1AA] line-through' : 'text-[#18181B]'
                  )}>
                    {item}
                  </span>
                </motion.button>
              ))}
            </div>
          )}

          {/* Coach note toggle */}
          {!milestone.locked && (
            <>
              <button
                onClick={() => setShowCoach(v => !v)}
                className="w-full flex items-center gap-2.5 py-1 text-left"
              >
                <span className="text-lg leading-none">💬</span>
                <span className="text-sm font-semibold text-[#7C3AED] flex-1">What I Wish I Knew</span>
                <motion.div animate={{ rotate: showCoach ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-4 h-4 text-[#A1A1AA]" />
                </motion.div>
              </button>
              <AnimatePresence>
                {showCoach && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-[#EDE9FE] rounded-2xl p-4">
                      <p className="text-sm text-[#4C1D95] leading-relaxed">{milestone.lesson}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* Workspace toggle */}
          {!milestone.locked && (
            <>
              <button
                onClick={() => setShowWorkspace(v => !v)}
                className="w-full flex items-center gap-2.5 py-1 text-left"
              >
                <PenLine className="w-4 h-4 text-[#A1A1AA]" />
                <span className="text-sm font-semibold text-[#A1A1AA] flex-1">My notes</span>
                <motion.div animate={{ rotate: showWorkspace ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-4 h-4 text-[#A1A1AA]" />
                </motion.div>
              </button>
              <AnimatePresence>
                {showWorkspace && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-[#F4F4F5] pt-4">
                      <WorkspaceSection milestoneId={milestone.id} userId={userId} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* Complete CTA */}
          {!milestone.locked && !completed && (
            <AnimatePresence mode="wait">
              {allDone ? (
                <motion.button
                  key="complete-btn"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={markComplete}
                  className="w-full py-4 rounded-2xl text-white font-bold text-[15px]"
                  style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)', boxShadow: '0 4px 24px rgba(124, 58, 237, 0.35)' }}
                >
                  ✓ Mark Complete · +{milestone.xp} XP
                </motion.button>
              ) : (
                <motion.p
                  key="tasks-left"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center text-xs text-[#A1A1AA] py-1"
                >
                  {totalCount - completedCount} task{totalCount - completedCount !== 1 ? 's' : ''} left to unlock completion
                </motion.p>
              )}
            </AnimatePresence>
          )}

          {completed && (
            <div className="flex items-center justify-center gap-2 py-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              <span className="text-sm font-semibold text-[#16A34A]">
                Step complete · +{milestone.xp} XP earned
              </span>
            </div>
          )}

          {milestone.locked && (
            <div className="text-center py-2">
              <p className="text-sm text-[#A1A1AA]">Complete the previous steps to unlock this one</p>
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}

// ──────────────────────────────────────────
// Page
// ──────────────────────────────────────────
export default function RoadmapDetailPage() {
  const { user, profile, signOut } = useUser()
  const supabase = createClientComponentClient()
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [activePhase, setActivePhase] = useState(0)
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [showPhaseComplete, setShowPhaseComplete] = useState(false)
  const [phaseXP, setPhaseXP] = useState(0)

  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [checklists, setChecklists] = useState<Record<string, Record<number, boolean>>>({})

  // Load progress from Supabase (with localStorage migration fallback)
  useEffect(() => {
    if (!user?.id) return
    async function loadProgress() {
      try {
        const { data } = await supabase
          .from('roadmap_progress')
          .select('completed_ids, checklists')
          .eq('user_id', user!.id)
          .eq('slug', slug)
          .maybeSingle()

        if (data) {
          setCompletedIds(new Set(data.completed_ids as string[]))
          setChecklists((data.checklists as Record<string, Record<number, boolean>>) ?? {})
          return
        }

        // Migration: if no DB row yet, try reading from localStorage and migrate up
        const raw = localStorage.getItem(`${user!.id}_roadmap_${slug}_v1`)
        if (raw) {
          const saved = JSON.parse(raw)
          const ids: string[] = saved.completed ?? []
          const lists = saved.checklists ?? {}
          setCompletedIds(new Set(ids))
          setChecklists(lists)
          // Write to Supabase so future loads come from DB
          await supabase.from('roadmap_progress').upsert({
            user_id: user!.id,
            slug,
            completed_ids: ids,
            checklists: lists,
          })
        }
      } catch { /* ignore — use empty state */ }
    }
    void loadProgress()
  }, [user?.id, slug]) // eslint-disable-line react-hooks/exhaustive-deps

  const roadmap = ROADMAP_DATA[slug]

  // Jump to first incomplete step when phase changes
  useEffect(() => {
    if (!roadmap) return
    const phase = roadmap.phases[activePhase]
    const firstIncomplete = phase.milestones.findIndex(m => !completedIds.has(m.id) && !m.locked)
    setActiveStepIndex(firstIncomplete >= 0 ? firstIncomplete : 0)
  }, [activePhase]) // eslint-disable-line

  const saveProgress = useCallback((ids: Set<string>, lists: Record<string, Record<number, boolean>>) => {
    if (!user?.id) return
    // Write to Supabase (source of truth)
    void supabase.from('roadmap_progress').upsert({
      user_id: user.id,
      slug,
      completed_ids: Array.from(ids),
      checklists: lists,
    })
    // Keep localStorage in sync for the dashboard/daily widgets that read it
    try {
      localStorage.setItem(`${user.id}_roadmap_${slug}_v1`, JSON.stringify({
        completed: Array.from(ids),
        checklists: lists,
      }))
    } catch { /* ignore */ }
  }, [user?.id, slug]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleComplete = useCallback((milestoneId: string) => {
    if (!roadmap) return
    setCompletedIds(prev => {
      const next = new Set(prev)
      next.add(milestoneId)
      saveProgress(next, checklists)

      const phase = roadmap.phases[activePhase]
      const milestone = phase.milestones.find(m => m.id === milestoneId)
      const stepXP = milestone?.xp ?? 25
      const allPhaseDone = phase.milestones.every(m => next.has(m.id) || m.locked)

      // Award XP + set build ring on every step completion
      if (user?.id) {
        void supabase.rpc('award_xp', { p_user_id: user.id, p_xp: stepXP })
        setRing(user.id, 'build')
      }

      if (allPhaseDone) {
        const earned = phase.milestones.reduce((sum, m) => sum + (next.has(m.id) ? m.xp : 0), 0)
        setTimeout(() => {
          setPhaseXP(earned)
          setShowPhaseComplete(true)
        }, 1400)
      } else {
        setActiveStepIndex(cur => {
          const nextIdx = phase.milestones.findIndex((m, i) => i > cur && !next.has(m.id) && !m.locked)
          return nextIdx >= 0 ? nextIdx : cur
        })
      }

      return next
    })
  }, [checklists, saveProgress, roadmap, activePhase, user?.id]) // eslint-disable-line

  const handleChecklistChange = useCallback((milestoneId: string, itemIndex: number, value: boolean) => {
    setChecklists(prev => {
      const next = { ...prev, [milestoneId]: { ...prev[milestoneId], [itemIndex]: value } }
      saveProgress(completedIds, next)
      return next
    })
  }, [completedIds, saveProgress])

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#A1A1AA] mb-4">Roadmap not found.</p>
          <button onClick={() => router.push('/roadmaps')} className="btn-primary">Back to Roadmaps</button>
        </div>
      </div>
    )
  }

  const allMilestones = roadmap.phases.flatMap(p => p.milestones)
  const completedCount = allMilestones.filter(m => completedIds.has(m.id)).length
  const totalCount = allMilestones.length
  const progressPct = Math.round((completedCount / totalCount) * 100)
  const totalXP = allMilestones.reduce((sum, m) => sum + m.xp, 0)
  const currentPhase = roadmap.phases[activePhase]
  const currentMilestone = currentPhase.milestones[activeStepIndex]

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar profile={profile} onSignOut={signOut} />

      {/* Phase complete overlay */}
      <AnimatePresence>
        {showPhaseComplete && (
          <PhaseCompleteOverlay
            phaseName={currentPhase.name}
            xpEarned={phaseXP}
            hasNextPhase={activePhase < roadmap.phases.length - 1}
            onNextPhase={() => {
              setShowPhaseComplete(false)
              setActivePhase(p => p + 1)
              setActiveStepIndex(0)
            }}
            onDashboard={() => router.push('/dashboard')}
          />
        )}
      </AnimatePresence>

      <div className="lg:pl-64 pb-28 lg:pb-8">
        {/* Sticky header */}
        <div className="sticky top-0 z-30 bg-white border-b border-[#F4F4F5] px-4 md:px-6 py-3.5">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button
              onClick={() => router.push('/roadmaps')}
              className="w-8 h-8 rounded-xl border border-[#E4E4E7] flex items-center justify-center hover:bg-[#EDE9FE] transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-[#71717A]" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <roadmap.icon className="w-4 h-4 text-[#71717A] flex-shrink-0" strokeWidth={1.5} />
                <h1 className="text-sm font-bold text-[#18181B] truncate">{roadmap.title}</h1>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-20 h-1 bg-[#E4E4E7] rounded-full overflow-hidden">
                  <div className="h-full bg-[#7C3AED] rounded-full transition-all" style={{ width: `${progressPct}%` }} />
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

        <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
          {/* XP badge */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#A1A1AA]">{roadmap.weeks} weeks · {roadmap.difficulty}</p>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#EDE9FE] text-[#7C3AED]">
              <Zap className="w-3 h-3" />{totalXP} XP total
            </span>
          </div>

          {/* Phase tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {roadmap.phases.map((phase, i) => {
              const pDone = phase.milestones.filter(m => completedIds.has(m.id)).length
              const pTotal = phase.milestones.length
              return (
                <button
                  key={phase.name}
                  onClick={() => setActivePhase(i)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0',
                    activePhase === i
                      ? 'bg-[#18181B] text-white shadow-sm'
                      : 'bg-white border border-[#F4F4F5] text-[#71717A] hover:border-[#A1A1AA]'
                  )}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: phase.color }} />
                  {phase.name}
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full', activePhase === i ? 'bg-white/15 text-white/80' : 'bg-[#F4F4F5] text-[#A1A1AA]')}>
                    {pDone}/{pTotal}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Step trail */}
          <StepTrail
            milestones={currentPhase.milestones}
            completedIds={completedIds}
            activeIndex={activeStepIndex}
            onSelect={setActiveStepIndex}
          />

          {/* Focused step card */}
          <AnimatePresence mode="wait">
            {currentMilestone && (
              <FocusedStepCard
                key={`${activePhase}-${activeStepIndex}`}
                milestone={currentMilestone}
                index={activeStepIndex}
                total={currentPhase.milestones.length}
                phaseColor={currentPhase.color}
                isCompleted={completedIds.has(currentMilestone.id)}
                savedChecklist={checklists[currentMilestone.id] ?? {}}
                onComplete={() => handleComplete(currentMilestone.id)}
                onChecklistChange={(idx, val) => handleChecklistChange(currentMilestone.id, idx, val)}
                onNext={() => setActiveStepIndex(i => Math.min(i + 1, currentPhase.milestones.length - 1))}
                onPrev={() => setActiveStepIndex(i => Math.max(i - 1, 0))}
                hasNext={activeStepIndex < currentPhase.milestones.length - 1}
                hasPrev={activeStepIndex > 0}
                userId={user?.id}
              />
            )}
          </AnimatePresence>

          {/* Prev / Next buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setActiveStepIndex(i => Math.max(i - 1, 0))}
              disabled={activeStepIndex === 0}
              className="flex-1 py-3 rounded-2xl border border-[#E4E4E7] text-sm font-medium text-[#71717A] disabled:opacity-30 hover:bg-[#F4F4F5] transition-all"
            >
              ← Previous
            </button>
            <button
              onClick={() => setActiveStepIndex(i => Math.min(i + 1, currentPhase.milestones.length - 1))}
              disabled={activeStepIndex === currentPhase.milestones.length - 1}
              className="flex-1 py-3 rounded-2xl border border-[#E4E4E7] text-sm font-medium text-[#71717A] disabled:opacity-30 hover:bg-[#F4F4F5] transition-all"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  )
}
