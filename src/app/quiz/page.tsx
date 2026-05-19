'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, ArrowRight, ArrowLeft, Check, Sparkles, Lock, Mail, Share2, Copy } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ── Types ───────────────────────────────────────────────────────────────────

type ArchetypeKey =
  | 'creator'
  | 'service_pro'
  | 'digital_seller'
  | 'strategist'
  | 'brand_builder'
  | 'educator'

interface Scores {
  creator: number
  service_pro: number
  digital_seller: number
  strategist: number
  brand_builder: number
  educator: number
}

interface Question {
  id: string
  question: string
  subtext?: string
  options: {
    id: string
    label: string
    emoji: string
    scores: Partial<Scores>
  }[]
}

interface Archetype {
  key: ArchetypeKey
  name: string
  tagline: string
  emoji: string
  description: string
  topMatches: { title: string; why: string; emoji: string }[]
  avoid: string[]
  strengths: string[]
  weaknesses: string[]
  blindSpot: string
  contentStyle: string
  monetizationStyle: string
  firstSteps: string[]
  tools: string[]
}

// ── Questions ───────────────────────────────────────────────────────────────

const QUESTIONS: Question[] = [
  {
    id: 'energy',
    question: "What's your natural energy style?",
    options: [
      { id: 'fast', label: 'Fast-paced - I love momentum and quick wins', emoji: '⚡', scores: { creator: 2, brand_builder: 2 } },
      { id: 'focused', label: 'Calm and focused - I like to go deep on things', emoji: '🎯', scores: { service_pro: 2, digital_seller: 2, strategist: 1 } },
      { id: 'mixed', label: 'Both - I switch depending on the day', emoji: '🔄', scores: { educator: 1, strategist: 1, brand_builder: 1 } },
    ],
  },
  {
    id: 'people',
    question: 'How do you feel about client-facing work all day?',
    options: [
      { id: 'love', label: 'I love it - people genuinely energize me', emoji: '🗣️', scores: { service_pro: 2, educator: 2 } },
      { id: 'some', label: 'Some is fine - not all day every day', emoji: '😊', scores: { strategist: 2, brand_builder: 1, educator: 1 } },
      { id: 'solo', label: 'I would rather work solo or behind the scenes', emoji: '🎧', scores: { digital_seller: 3, strategist: 2, creator: 1 } },
    ],
  },
  {
    id: 'patience',
    question: 'A client appointment takes 2 focused hours. Back-to-back. You feel...',
    subtext: 'This one is about how your body and brain actually respond - not what you think you should say.',
    options: [
      { id: 'perfect', label: "Perfect - I love that deep one-on-one work", emoji: '💜', scores: { service_pro: 3 } },
      { id: 'okay', label: 'Fine for a few sessions, not all day', emoji: '😅', scores: { educator: 1, strategist: 1, creator: 1 } },
      { id: 'drained', label: "Draining honestly - I need variety and movement", emoji: '😬', scores: { creator: 2, brand_builder: 2, digital_seller: 1 } },
    ],
  },
  {
    id: 'interests',
    question: 'What world genuinely excites you?',
    subtext: 'Pick the one that actually pulls you in - not the one that seems most profitable.',
    options: [
      { id: 'beauty', label: 'Beauty, skincare, wellness, aesthetics, treatments', emoji: '💅', scores: { service_pro: 2, creator: 1 } },
      { id: 'content', label: 'Content, social media, video, storytelling', emoji: '🎥', scores: { creator: 3 } },
      { id: 'biz', label: 'Business, strategy, systems, helping brands run better', emoji: '📊', scores: { strategist: 3, brand_builder: 1 } },
      { id: 'digital', label: 'Tech, AI, digital products, online tools', emoji: '💻', scores: { digital_seller: 3, strategist: 1 } },
      { id: 'teaching', label: 'Teaching, coaching, helping people grow', emoji: '🌱', scores: { educator: 3 } },
      { id: 'products', label: 'Fashion, style, products, brand building, e-commerce', emoji: '👗', scores: { brand_builder: 3 } },
    ],
  },
  {
    id: 'camera',
    question: "Are you comfortable on camera or as the face of your brand?",
    options: [
      { id: 'yes', label: "Yes - I want visibility and a personal brand", emoji: '🌟', scores: { creator: 3, educator: 1 } },
      { id: 'maybe', label: "I could learn to be - I'm open to it", emoji: '🙂', scores: { creator: 1, brand_builder: 1, educator: 1 } },
      { id: 'no', label: "Honestly no - I prefer to stay behind the scenes", emoji: '🎬', scores: { strategist: 2, digital_seller: 2 } },
    ],
  },
  {
    id: 'tech',
    question: "What's your tech comfort level?",
    options: [
      { id: 'high', label: 'High - I enjoy apps, AI tools, and digital systems', emoji: '💻', scores: { digital_seller: 2, strategist: 2 } },
      { id: 'mid', label: "Average - I can figure things out when I need to", emoji: '🤔', scores: { creator: 1, brand_builder: 1, educator: 1 } },
      { id: 'low', label: 'Low - I prefer hands-on or in-person work', emoji: '📵', scores: { service_pro: 2 } },
    ],
  },
  {
    id: 'future',
    question: 'A year from now, what does your ideal business day look like?',
    options: [
      { id: 'passive', label: 'Sales coming in on my phone while I live my life', emoji: '💸', scores: { digital_seller: 3, brand_builder: 2 } },
      { id: 'booked', label: 'Fully booked clients paying me for my hands-on skills', emoji: '📅', scores: { service_pro: 3 } },
      { id: 'audience', label: 'A growing audience that buys from me regularly', emoji: '📱', scores: { creator: 3, educator: 2 } },
      { id: 'clients', label: 'Business owners paying me monthly to make their life easier', emoji: '📋', scores: { strategist: 3 } },
    ],
  },
  {
    id: 'consistency',
    question: "Be honest about your consistency. Which is you?",
    options: [
      { id: 'machine', label: "I show up every day - no excuses", emoji: '🔥', scores: { creator: 2, service_pro: 1, digital_seller: 1 } },
      { id: 'rhythm', label: "I'm solid when I'm in a rhythm - mostly consistent", emoji: '✅', scores: { strategist: 1, brand_builder: 1, educator: 1 } },
      { id: 'burnout', label: "I go hard then crash - I'm working on it", emoji: '😬', scores: { creator: -1, service_pro: -1 } },
      { id: 'building', label: "Still figuring out my habits and routine", emoji: '🌀', scores: { digital_seller: 1 } },
    ],
  },
  {
    id: 'personality',
    question: "Which description fits you most honestly?",
    options: [
      { id: 'creative', label: 'Creative, visual, full of ideas that I need to express', emoji: '🎨', scores: { creator: 2, brand_builder: 2 } },
      { id: 'analytical', label: 'Organized, strategic, I see patterns and systems', emoji: '📐', scores: { strategist: 3, digital_seller: 1 } },
      { id: 'nurturing', label: 'Nurturing, empathetic, people love talking to me', emoji: '💜', scores: { educator: 3, service_pro: 1 } },
      { id: 'ambitious', label: 'Ambitious, persuasive, I love selling and building things', emoji: '💼', scores: { brand_builder: 2, creator: 1 } },
    ],
  },
  {
    id: 'content',
    question: "If you had to create content, which would feel most natural?",
    options: [
      { id: 'video', label: 'Short videos, reels, TikToks - fast and visual', emoji: '🎬', scores: { creator: 3 } },
      { id: 'visual', label: 'Graphics, carousels, Canva posts - clean and educational', emoji: '🖼️', scores: { brand_builder: 2, digital_seller: 1 } },
      { id: 'written', label: 'Emails, guides, newsletters - thoughtful and detailed', emoji: '✍️', scores: { digital_seller: 2, strategist: 1, educator: 1 } },
      { id: 'none', label: "Content is not my thing and that's fine", emoji: '🚫', scores: { service_pro: 2, strategist: 1 } },
    ],
  },
  {
    id: 'income',
    question: "What is your income goal in the next 12 months?",
    options: [
      { id: 'starter', label: '$1K - $3K/month - solid extra income', emoji: '🌱', scores: { creator: 1, digital_seller: 1, service_pro: 1 } },
      { id: 'replace', label: '$3K - $6K/month - replace my job', emoji: '📈', scores: { service_pro: 1, brand_builder: 1, strategist: 1 } },
      { id: 'scale', label: '$6K - $10K/month - real business income', emoji: '🎯', scores: { strategist: 1, educator: 1, brand_builder: 1 } },
      { id: 'empire', label: '$10K+/month - build something serious', emoji: '👑', scores: { brand_builder: 2, digital_seller: 1, creator: 1 } },
    ],
  },
  {
    id: 'risk',
    question: "How do you actually feel about financial risk?",
    options: [
      { id: 'high', label: "I will invest in myself and go all in when I believe in something", emoji: '🎲', scores: { brand_builder: 2, creator: 1 } },
      { id: 'mid', label: "I want to test first and scale when it works", emoji: '🔬', scores: { digital_seller: 2, strategist: 1, educator: 1 } },
      { id: 'low', label: "I need predictable income before I take big risks", emoji: '🛡️', scores: { service_pro: 2, educator: 1 } },
    ],
  },
]

const TOTAL = QUESTIONS.length

// ── Archetypes ───────────────────────────────────────────────────────────────

const ARCHETYPES: Record<ArchetypeKey, Archetype> = {
  creator: {
    key: 'creator',
    name: 'The Content Creator',
    tagline: 'You build audiences, not appointment books.',
    emoji: '🎥',
    description:
      "You are fast-moving, visually driven, and at your best when you are creating. Your energy, personality, and ideas are your product - and that is worth serious money in today's economy. You need variety, momentum, and fast feedback or you will lose interest quickly. A slow, repetitive service business will drain you even if you love the industry. A content-forward business is where you actually belong.",
    topMatches: [
      {
        title: 'UGC Creator',
        emoji: '📱',
        why: 'Brands pay $150 - $500+ per video. You film at home, no big audience needed. High demand, low barrier, flexible.',
      },
      {
        title: 'Beauty or Lifestyle Content Creator',
        emoji: '💄',
        why: 'Build an audience around what you love and monetize through brand deals, affiliates, and your own digital products.',
      },
      {
        title: 'Digital Product Seller on Stan Store',
        emoji: '💻',
        why: 'Sell guides, presets, templates, or mini-courses to your audience. Create once, sell forever.',
      },
    ],
    avoid: [
      'Lash or brow artist - back-to-back 2-hour appointments will drain someone with your energy',
      'Bookkeeping or admin VA - too quiet and repetitive for the way your brain works',
      'Physical product brand with inventory - logistics-heavy, slow ROI, no room for creativity',
    ],
    strengths: [
      'Natural on-camera presence',
      'Trend awareness and speed to market',
      'Ability to produce content quickly',
      'Relatability and authenticity',
    ],
    weaknesses: [
      'Finishing long-form projects',
      'Showing up consistently on slow days',
      'Backend business operations',
      'Monetizing before you have a big audience',
    ],
    blindSpot:
      "You will build a following and forget to sell anything. Having 10,000 followers does not pay rent - having an offer does. Add a product, a link, or a service to your bio before you hit 1,000 followers and start treating every post like a business asset, not just content.",
    contentStyle:
      'Short-form video on TikTok and Reels. Fast, relatable, and personal. Behind-the-scenes, day-in-the-life, tutorials, honest takes. Post before it feels ready.',
    monetizationStyle:
      'UGC brand deals, affiliate links, digital products on Stan Store, brand partnerships, sponsored content.',
    firstSteps: [
      'Pick one platform - TikTok or Instagram - and post 3 times per week for 30 days without stopping',
      'Create one free digital download on Stan Store and link it in your bio this week',
      'DM 5 small brands today about UGC partnerships - most say yes faster than you think',
    ],
    tools: ['CapCut', 'Canva', 'Stan Store', 'Later', 'ChatGPT', 'Claude', 'Notion'],
  },

  service_pro: {
    key: 'service_pro',
    name: 'The Service Pro',
    tagline: 'You turn precision into a fully booked calendar.',
    emoji: '💅',
    description:
      "You are patient, detail-oriented, and at your best when you are fully present with one client at a time. You actually enjoy the intimacy of service work - the trust, the transformation, the repeat business. Where other personality types burn out doing back-to-back appointments, you find your rhythm. Your strength is in your hands, your eye, and your ability to make someone feel seen.",
    topMatches: [
      {
        title: 'Lash Artist or Brow Artist',
        emoji: '👁️',
        why: 'High-ticket repeat clients, low startup cost, and you can be fully booked within 90 days of training.',
      },
      {
        title: 'Facial or Skincare Treatment Provider',
        emoji: '✨',
        why: 'Premium service with loyal clientele. Natural path into selling products and building memberships over time.',
      },
      {
        title: 'Permanent Jewelry or Nail Artist',
        emoji: '💍',
        why: 'Low overhead, strong repeat business, excellent fit for patient detail-focused personalities.',
      },
    ],
    avoid: [
      'Full-time content creation - requires daily output and on-camera energy that is not your natural state',
      'E-commerce with inventory - logistics and shipping are the opposite of your skill set',
      'Social media manager for other businesses - fast-paced digital work without the hands-on satisfaction you need',
    ],
    strengths: [
      'Precision and attention to detail',
      'Client retention and loyalty',
      'Quality over quantity mindset',
      'Calm and focused under pressure',
    ],
    weaknesses: [
      'Scaling beyond your own two hands',
      'Charging what you are actually worth',
      'Self-promotion and social media marketing',
      'Automating and systematizing your backend',
    ],
    blindSpot:
      "You will fill your books and forget to raise your prices. Your time is the inventory and it runs out. Start charging premium from day one - do not build a full clientele at discounted rates you cannot raise later without losing everyone. Price for the business you want, not the one you currently have.",
    contentStyle:
      'Before and after transformations, process videos, client results. Visual and trust-building. You do not need to be loud or trendy - you just need to consistently show your work.',
    monetizationStyle:
      'Service packages, memberships, gift cards, retail product add-ons, referral programs, and eventually training other artists.',
    firstSteps: [
      'Get trained or certified in your chosen service - book the course this week',
      'Set up a booking link through Jane, Fresha, or Square and put it everywhere',
      "Post 3 before and after photos this week - that is your entire marketing strategy for now",
    ],
    tools: ['Jane', 'Fresha', 'Canva', 'Square', 'Instagram', 'Google Workspace', 'Ownr'],
  },

  digital_seller: {
    key: 'digital_seller',
    name: 'The Digital Seller',
    tagline: 'You build once and sell forever.',
    emoji: '💸',
    description:
      "You are systematic, consistent, and you understand that the best business makes money without trading every single hour for every dollar. You are more comfortable behind the scenes than in front of a camera, but you know that showing up online is part of the job. You are drawn to building assets - things you create once that keep paying you. That mindset is a competitive advantage.",
    topMatches: [
      {
        title: 'Canva Template or Digital Download Seller',
        emoji: '🎨',
        why: 'Create business templates, social media kits, or Etsy printables once and sell them repeatedly with zero fulfillment.',
      },
      {
        title: 'Stan Store Product Creator',
        emoji: '📲',
        why: 'Sell ebooks, guides, mini-courses, or toolkits. No inventory, no shipping, nearly 100% margin.',
      },
      {
        title: 'Affiliate Marketer in a Specific Niche',
        emoji: '🔗',
        why: 'Build content around products you actually use. Commission income that compounds over time.',
      },
    ],
    avoid: [
      'Service-heavy businesses - trading your time for money is the opposite of what you are building toward',
      'Physical product brands - inventory and shipping destroy the passive income model',
      'Being a full-time SMM for other people - putting your time into someone else\'s growth',
    ],
    strengths: [
      'Systems and long-term thinking',
      'Patience to build before the payoff arrives',
      'Research and learning new skills quickly',
      'Content strategy and positioning',
    ],
    weaknesses: [
      'Getting visible enough for people to find your products',
      'Selling and pitching your offers confidently',
      'Shipping before everything is perfect',
      'Committing to one niche instead of pivoting constantly',
    ],
    blindSpot:
      "You will spend three months perfecting your product and zero weeks promoting it. The product does not sell itself - ever. Marketing is not optional, it is 50% of the job. Build in public, talk about what you are making before it is finished, and get comfortable with imperfect launches.",
    contentStyle:
      'Educational carousels, email newsletters, Pinterest pins, tutorial content. Teach something valuable for free, then sell the full system or shortcut.',
    monetizationStyle:
      'Digital product sales, affiliate commissions, email list monetization, bundled offers, and eventually online courses.',
    firstSteps: [
      'Pick one topic you know well and create one PDF guide or template - start today, finish this week',
      'List it on Stan Store for $9 - $27 and share it in three relevant Facebook groups or Reddit communities',
      'Start an email list now - 100 subscribers who trust you is worth more than 10,000 followers who scroll past',
    ],
    tools: ['Stan Store', 'Canva', 'ChatGPT', 'Claude', 'Flodesk', 'Mailchimp', 'Notion'],
  },

  strategist: {
    key: 'strategist',
    name: 'The Strategist',
    tagline: 'You run the backend that makes other businesses work.',
    emoji: '📊',
    description:
      "You are analytical, organized, and you spot problems and solutions that most business owners are too busy or overwhelmed to see. You are not here to be the face of anything. You are here to make things work. Other entrepreneurs are drowning in tasks they hate and would happily pay someone like you to handle them. That gap between their chaos and your clarity is your business.",
    topMatches: [
      {
        title: 'Social Media Manager',
        emoji: '📱',
        why: 'Businesses pay $500 - $3,000+ per month per client for strategy, content creation, and scheduling.',
      },
      {
        title: 'Virtual Assistant or Online Business Manager',
        emoji: '💼',
        why: 'High demand, flexible hours, and you can specialize in a niche like beauty VAs, coach VAs, or e-commerce support.',
      },
      {
        title: 'AI Automation and Productivity Consultant',
        emoji: '🤖',
        why: 'One of the fastest-growing service niches right now. Businesses pay well to have someone set up and manage their AI workflows.',
      },
    ],
    avoid: [
      'Full-time content creator - being consistently visible on camera is not your natural strength',
      'Hands-on physical service work - not aligned with how your brain likes to work',
      'Any business that requires daily public visibility to generate income',
    ],
    strengths: [
      'Spotting inefficiencies and fixing them fast',
      'Project management and follow-through',
      'Accuracy and attention to detail',
      'Logical thinking and problem solving',
    ],
    weaknesses: [
      'Charging what your expertise is actually worth',
      'Marketing and putting yourself out there',
      'Saying no to underpriced or scope-creeping clients',
      'Building visibility for your own personal brand',
    ],
    blindSpot:
      "You will undercharge because you think doing great work is enough. Strategy and systems are genuinely high-value skills - most business owners have no idea how to build them. Charge accordingly and stop pitching yourself as a helper when you are doing manager-level work. Know the difference.",
    contentStyle:
      'Tips and tutorials, results posts, client transformation before and after, "how I helped a client with X" posts. Written and educational content works better for you than trend-chasing.',
    monetizationStyle:
      'Monthly retainer packages, project rates, VIP intensive days, service bundles.',
    firstSteps: [
      'Write down five things you can do better than most small business owners - that list is your service menu',
      'Create a simple offer page on Canva or a Google Doc and share it this week',
      'DM five business owners in your niche and offer a free 20-minute audit call - most will say yes',
    ],
    tools: ['Notion', 'Google Workspace', 'Canva', 'ChatGPT', 'Claude', 'Stripe', 'Later'],
  },

  brand_builder: {
    key: 'brand_builder',
    name: 'The Brand Builder',
    tagline: 'You are building something that lasts longer than a booking.',
    emoji: '🛍️',
    description:
      "You are ambitious, visually driven, and you can see the bigger picture before others even realize there is one. You are not just thinking about making money - you are thinking about building something real. You understand branding, aesthetics, and positioning, and you are willing to do the unglamorous work for the long-term payoff. You need a business with room to grow, evolve, and eventually scale beyond you.",
    topMatches: [
      {
        title: 'Shopify Product Brand',
        emoji: '🛒',
        why: 'Build a real brand around a physical product you believe in. Beauty, wellness, home, fashion - pick your lane and own it.',
      },
      {
        title: 'Print-on-Demand Clothing or Accessories',
        emoji: '👕',
        why: 'Low startup cost, strong brand potential, zero inventory until a sale is made. A real brand with minimal risk.',
      },
      {
        title: 'Beauty or Wellness Product Line',
        emoji: '🧴',
        why: 'Private label products with your branding. Higher upfront investment but a serious income ceiling and real asset value.',
      },
    ],
    avoid: [
      'Freelancing or service businesses - trading your time for money will never scale the way you are thinking',
      'Unbranded generic dropshipping - no differentiation, no loyalty, a race to the bottom on price',
      'Launching 10 products at once - one strong hero product beats a scattered catalogue every time',
    ],
    strengths: [
      'Vision, aesthetics, and brand instinct',
      'Positioning and long-term thinking',
      'Generating ideas and opportunities',
      'Presenting and selling a concept',
    ],
    weaknesses: [
      'Execution and grinding through the boring middle',
      'Operations, logistics, and fulfillment systems',
      'Staying focused on one thing long enough for it to work',
      'Patience through the slow early growth phase',
    ],
    blindSpot:
      "You will love the brand aesthetic and avoid the operational reality - inventory management, customer service emails, sourcing problems. Those parts are not a distraction from the business. They are the business. Learn them or hire for them early, but do not pretend they do not exist.",
    contentStyle:
      'Lifestyle imagery, product showcases, brand storytelling, unboxing content, aesthetic reels. Visual consistency and brand identity matter more than viral moments for you.',
    monetizationStyle:
      'Direct product sales, bundles, upsells, subscription boxes, wholesale accounts, brand collaborations.',
    firstSteps: [
      'Choose one product, one customer, one aesthetic - do not diversify until you have proven the first thing works',
      'Register your business through Ownr and open a dedicated business bank account this week',
      'Build your Shopify store and get one product listed and live this month - done beats perfect',
    ],
    tools: ['Shopify', 'Canva', 'Ownr', 'ChatGPT', 'Later', 'Klaviyo', 'Google Workspace'],
  },

  educator: {
    key: 'educator',
    name: 'The Educator and Coach',
    tagline: 'Your knowledge is your most valuable product.',
    emoji: '🌱',
    description:
      "You are the person everyone comes to for advice - and you give it really well. You are empathetic, patient, and you genuinely care about other people's growth and transformation. Your ability to explain, teach, and facilitate change is rare and genuinely marketable. You do not need a formal degree, a certification, or permission to start teaching what you know. Someone out there is exactly where you used to be and they need to hear from you specifically.",
    topMatches: [
      {
        title: 'Business or Life Coach',
        emoji: '💬',
        why: 'High-ticket one-on-one coaching at $500 - $3,000+ per month. You are paid for transformation, not just your time.',
      },
      {
        title: 'Online Course or Workshop Creator',
        emoji: '📚',
        why: 'Teach what you know once and sell it repeatedly. Stan Store, Teachable, or Thinkific make this straightforward.',
      },
      {
        title: 'Beauty or Wellness Educator',
        emoji: '✨',
        why: 'Train other aspiring artists or service providers through masterclasses, training days, and group programs.',
      },
    ],
    avoid: [
      'Content creation without a clear teaching angle - entertainment without education burns out fast for your type',
      'E-commerce product brands - you are built for knowledge transfer, not logistics',
      'High-volume impersonal service work - being unable to personalize or go deep will drain you',
    ],
    strengths: [
      'Explaining complex ideas in simple, accessible ways',
      'Building genuine trust and long-term relationships',
      'Creating frameworks and systems other people can follow',
      'Empathy and real follow-through with clients',
    ],
    weaknesses: [
      'Pricing your knowledge at its actual market value',
      'Selling without feeling pushy or salesy',
      'Building scalable systems beyond one-on-one work',
      'Setting firm boundaries with over-reliant clients',
    ],
    blindSpot:
      "You will over-deliver and undercharge because helping people feels like enough of a reward. It is not a sustainable business model. Set a price, set a scope, and hold the boundary - your generosity and your time both have limits even when your care for people does not.",
    contentStyle:
      'Educational posts, Q and A content, client transformation stories, frameworks and tips. Show the result your client achieved. Teach something genuinely useful for free, then sell the full system.',
    monetizationStyle:
      'One-on-one coaching packages, group programs, online courses, live workshops, masterclasses, memberships.',
    firstSteps: [
      'Write down the one thing people ask your advice about most often - that is your first offer',
      'Create a simple landing page for a $97 - $297 coaching package or workshop and share it this week',
      'Post one piece of educational content every day for 30 days and end every post with a clear call to action',
    ],
    tools: ['Stan Store', 'Canva', 'ChatGPT', 'Claude', 'Zoom', 'Flodesk', 'Notion'],
  },
}

// ── Scoring ──────────────────────────────────────────────────────────────────

function calculateResult(answers: Record<string, string>): ArchetypeKey {
  const scores: Scores = {
    creator: 0,
    service_pro: 0,
    digital_seller: 0,
    strategist: 0,
    brand_builder: 0,
    educator: 0,
  }

  for (const q of QUESTIONS) {
    const chosen = q.options.find(o => o.id === answers[q.id])
    if (!chosen) continue
    for (const [key, val] of Object.entries(chosen.scores)) {
      scores[key as ArchetypeKey] += val ?? 0
    }
  }

  const sorted = (Object.entries(scores) as [ArchetypeKey, number][]).sort((a, b) => b[1] - a[1])
  return sorted[0][0]
}

// ── Shared animation variants ─────────────────────────────────────────────

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 52 : -52, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as number[] } },
  exit: (d: number) => ({ x: d > 0 ? -52 : 52, opacity: 0, transition: { duration: 0.2 } }),
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function QuizPage() {
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'processing' | 'result'>('intro')
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<ArchetypeKey | null>(null)
  const advanceTimer = useRef<ReturnType<typeof setTimeout>>()

  const question = QUESTIONS[step]
  const selected = answers[question?.id]

  function pick(questionId: string, answerId: string) {
    setAnswers(prev => ({ ...prev, [questionId]: answerId }))

    // Auto-advance for all steps except the final one
    if (step < TOTAL - 1) {
      clearTimeout(advanceTimer.current)
      advanceTimer.current = setTimeout(() => {
        setDirection(1)
        setStep(s => s + 1)
      }, 360)
    }
  }

  function back() {
    clearTimeout(advanceTimer.current)
    if (step === 0) { setPhase('intro'); return }
    setDirection(-1)
    setStep(s => s - 1)
  }

  function finish() {
    clearTimeout(advanceTimer.current)
    const r = calculateResult(answers)
    setResult(r)
    setPhase('processing')
    setTimeout(() => setPhase('result'), 2600)
  }

  if (phase === 'intro') return <Intro onStart={() => setPhase('quiz')} />
  if (phase === 'processing') return <Processing />
  if (phase === 'result' && result) return <Result archetype={ARCHETYPES[result]} />

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header bar */}
      <div className="bg-white border-b border-[#F4F4F5] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#7C3AED] flex items-center justify-center">
            <Crown className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-[#18181B]">CEO Quiz</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#A1A1AA]">{step + 1} of {TOTAL}</span>
          <div className="w-20 h-1.5 bg-[#F4F4F5] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#7C3AED] rounded-full"
              animate={{ width: `${((step + 1) / TOTAL) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 flex flex-col justify-center px-5 py-8 max-w-lg mx-auto w-full">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-5"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED] mb-2">
                Question {step + 1}
              </p>
              <h2 className="text-2xl font-bold text-[#18181B] leading-tight">{question.question}</h2>
              {question.subtext && (
                <p className="text-sm text-[#71717A] mt-1.5 leading-relaxed">{question.subtext}</p>
              )}
            </div>

            <div className="space-y-2.5">
              {question.options.map(opt => {
                const isSelected = selected === opt.id
                return (
                  <motion.button
                    key={opt.id}
                    onClick={() => pick(question.id, opt.id)}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'w-full flex items-center gap-3.5 p-4 rounded-2xl border-2 text-left transition-all duration-150',
                      isSelected
                        ? 'border-[#7C3AED] bg-[#EDE9FE]'
                        : 'border-[#E4E4E7] bg-white hover:border-[#C4B5FD]'
                    )}
                  >
                    <span className="text-xl flex-shrink-0">{opt.emoji}</span>
                    <span className={cn(
                      'text-sm font-medium flex-1 leading-snug',
                      isSelected ? 'text-[#5B21B6]' : 'text-[#3F3F46]'
                    )}>
                      {opt.label}
                    </span>
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                      isSelected ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-[#D4D4D8]'
                    )}>
                      {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Nav row */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={back}
            className="flex items-center gap-2 text-sm font-medium text-[#A1A1AA] hover:text-[#71717A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {step === TOTAL - 1 && (
            <motion.button
              onClick={finish}
              disabled={!selected}
              whileTap={{ scale: 0.97 }}
              className="btn-primary py-3 px-8 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              See my result <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Intro Screen ──────────────────────────────────────────────────────────────

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-sm w-full space-y-6"
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#7C3AED] flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.25)]">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-none text-[#18181B]">Rinse & Repeat</p>
            <p className="text-[10px] font-semibold text-[#7C3AED] uppercase tracking-widest leading-none mt-0.5">CEO</p>
          </div>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-[#18181B] leading-tight mb-3">
            Find your actual<br />business match.
          </h1>
          <p className="text-[#71717A] leading-relaxed text-sm">
            Not what you think you should do. Not what sounds impressive. The business model that actually fits your personality, energy, and lifestyle - honestly.
          </p>
        </div>

        <div className="bg-[#18181B] rounded-2xl p-5 space-y-2.5">
          {[
            'Your entrepreneur archetype',
            'Top 3 business matches with real reasons',
            'What to avoid and exactly why',
            'Your blind spots (the honest part)',
            'Your first 3 steps to start',
          ].map(item => (
            <div key={item} className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-[#7C3AED]/30 flex items-center justify-center flex-shrink-0">
                <Check className="w-2.5 h-2.5 text-[#A78BFA]" strokeWidth={3} />
              </div>
              <span className="text-sm text-[#D4D4D8]">{item}</span>
            </div>
          ))}
        </div>

        <motion.button
          onClick={onStart}
          whileTap={{ scale: 0.97 }}
          className="btn-primary w-full py-4 text-base"
        >
          Start the quiz <ArrowRight className="w-5 h-5" />
        </motion.button>

        <p className="text-xs text-[#A1A1AA] text-center">
          Free - no account needed - takes about 3 minutes
        </p>
      </motion.div>
    </div>
  )
}

// ── Processing Screen ─────────────────────────────────────────────────────────

function Processing() {
  const [idx, setIdx] = useState(0)
  const msgs = [
    'Analysing your energy and personality...',
    'Matching you to realistic business models...',
    'Running fit scores...',
    'Building your result...',
  ]

  useEffect(() => {
    const t = setInterval(() => setIdx(i => Math.min(i + 1, msgs.length - 1)), 600)
    return () => clearInterval(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-5">
      <div className="text-center space-y-5">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 rounded-2xl bg-[#7C3AED] flex items-center justify-center mx-auto shadow-[0_0_32px_rgba(124,58,237,0.3)]"
        >
          <Sparkles className="w-7 h-7 text-white" />
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.p
            key={idx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm font-medium text-[#52525B]"
          >
            {msgs[idx]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Result Screen ─────────────────────────────────────────────────────────────

function Result({ archetype }: { archetype: Archetype; }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Sticky header */}
      <div className="bg-white border-b border-[#F4F4F5] px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#7C3AED] flex items-center justify-center">
            <Crown className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-[#18181B]">CEO Quiz</span>
        </Link>
        <Link
          href="/signup"
          className="text-xs font-semibold text-[#7C3AED] hover:underline flex items-center gap-1"
        >
          Save my result <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-5 py-6 space-y-4 pb-20">

        {/* Result hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#18181B] rounded-3xl p-6 sm:p-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/25 to-transparent pointer-events-none" />
          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED] mb-3">Your Result</p>
            <div className="flex items-start gap-4 mb-4">
              <span className="text-5xl leading-none flex-shrink-0">{archetype.emoji}</span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {archetype.name}
                </h1>
                <p className="text-[#A78BFA] font-medium mt-1 text-sm">{archetype.tagline}</p>
              </div>
            </div>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">{archetype.description}</p>
          </div>
        </motion.div>

        {/* Top matches */}
        <Card title="Your top 3 business matches" delay={0.05}>
          <div className="space-y-3">
            {archetype.topMatches.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 + i * 0.07 }}
                className="flex gap-3.5"
              >
                <span className="text-2xl flex-shrink-0 leading-none mt-0.5">{m.emoji}</span>
                <div>
                  <p className="font-semibold text-sm text-[#18181B]">{m.title}</p>
                  <p className="text-xs text-[#71717A] mt-0.5 leading-relaxed">{m.why}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Strengths + weaknesses */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card title="Your strengths" delay={0.1}>
            <ul className="space-y-1.5">
              {archetype.strengths.map(s => (
                <li key={s} className="flex items-start gap-2 text-sm text-[#3F3F46]">
                  <span className="text-[#16A34A] font-bold flex-shrink-0 mt-0.5">+</span>
                  {s}
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Where you will struggle" delay={0.12}>
            <ul className="space-y-1.5">
              {archetype.weaknesses.map(w => (
                <li key={w} className="flex items-start gap-2 text-sm text-[#3F3F46]">
                  <span className="text-[#F97316] font-bold flex-shrink-0 mt-0.5">-</span>
                  {w}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Blind spot */}
        <Card title="Your blind spot" delay={0.14}>
          <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-xl p-4">
            <p className="text-sm text-[#9A3412] leading-relaxed">{archetype.blindSpot}</p>
          </div>
        </Card>

        {/* What to avoid */}
        <Card title="Business models to avoid right now" delay={0.16}>
          <ul className="space-y-2">
            {archetype.avoid.map(a => (
              <li key={a} className="flex items-start gap-2.5 text-sm text-[#71717A]">
                <span className="text-[#DC2626] flex-shrink-0 font-bold mt-0.5">x</span>
                {a}
              </li>
            ))}
          </ul>
        </Card>

        {/* Content + monetization */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card title="Your content style" delay={0.18}>
            <p className="text-sm text-[#3F3F46] leading-relaxed">{archetype.contentStyle}</p>
          </Card>
          <Card title="Your monetization style" delay={0.2}>
            <p className="text-sm text-[#3F3F46] leading-relaxed">{archetype.monetizationStyle}</p>
          </Card>
        </div>

        {/* First 3 steps */}
        <Card title="Your first 3 steps" delay={0.22}>
          <div className="space-y-4">
            {archetype.firstSteps.map((s, i) => (
              <div key={i} className="flex gap-3.5">
                <div className="w-6 h-6 rounded-full bg-[#7C3AED] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-[#3F3F46] leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Tools */}
        <Card title="Tools recommended for your type" delay={0.24}>
          <div className="flex flex-wrap gap-2">
            {archetype.tools.map(tool => (
              <span
                key={tool}
                className="px-3 py-1.5 bg-[#EDE9FE] text-[#5B21B6] text-xs font-semibold rounded-full"
              >
                {tool}
              </span>
            ))}
          </div>
        </Card>

        {/* Email capture funnel */}
        <EmailCapture archetype={archetype} />

        {/* Share your result */}
        <ShareResult archetype={archetype} />

        {/* Retake */}
        <div className="text-center pt-2">
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-[#A1A1AA] hover:text-[#71717A] transition-colors underline underline-offset-2"
          >
            Retake the quiz
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Share result ──────────────────────────────────────────────────────────────

function ShareResult({ archetype }: { archetype: Archetype }) {
  const [copied, setCopied] = useState(false)

  const quizUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/quiz`
    : 'https://rinseandrepeat.vercel.app/quiz'

  const shareText = `I just found out I'm a ${archetype.name} 🎯\n\nFind out your entrepreneur type → ${quizUrl}`

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My CEO Entrepreneur Type', text: shareText, url: quizUrl })
      } catch { /* user dismissed */ }
    } else {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl border border-[#DDD6FE] bg-[#EDE9FE]/40 p-5 text-center"
    >
      <p className="text-sm font-semibold text-[#18181B] mb-1">
        Know a friend who needs this?
      </p>
      <p className="text-xs text-[#71717A] mb-4">
        Send them the quiz — it takes 3 minutes and it is actually useful.
      </p>
      <motion.button
        onClick={handleShare}
        whileTap={{ scale: 0.97 }}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-semibold hover:bg-[#5B21B6] transition-colors"
      >
        {copied
          ? <><Copy className="w-4 h-4" /> Copied!</>
          : <><Share2 className="w-4 h-4" /> Share this quiz</>
        }
      </motion.button>
    </motion.div>
  )
}

// ── Email capture funnel ──────────────────────────────────────────────────────
//

function EmailCapture({ archetype }: { archetype: Archetype }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    setErrorMsg('')

    try {
      await fetch('/api/quiz-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), archetype: archetype.key }),
      })
      // We treat this as success even if the API has a non-critical error
      // so the user always gets redirected to Stan Store
      setStatus('done')
    } catch {
      // Still proceed - don't block the funnel on a network glitch
      setStatus('done')
    }
  }

  if (status === 'done') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#18181B] rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/20 to-transparent pointer-events-none" />
        <div className="relative space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#7C3AED] flex items-center justify-center mx-auto shadow-[0_0_24px_rgba(124,58,237,0.35)]">
            <Check className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">You are in.</h3>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Your free resource is ready — a step-by-step guide to using Claude AI for your {archetype.name} business.
            </p>
          </div>
          <div className="space-y-3">
            <Link
              href="/guide"
              className="btn-primary w-full py-3.5 text-sm inline-flex items-center justify-center gap-2"
            >
              Get my free Claude guide <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={`/signup?email=${encodeURIComponent(email)}&from=quiz&type=${archetype.key}`}
              className="block text-xs text-[#52525B] hover:text-[#A1A1AA] transition-colors"
            >
              Or create your full CEO dashboard account →
            </Link>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.28 }}
      className="rounded-3xl overflow-hidden border border-[#DDD6FE]"
    >
      {/* Blurred preview */}
      <div className="bg-white p-6 select-none pointer-events-none" aria-hidden>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-4">
          Free — sent to your inbox
        </p>
        <div className="space-y-3 blur-sm opacity-40">
          {[
            'Your personalized 30-day action plan',
            'Week-by-week startup roadmap for your type',
            'AI tools and prompts matched to your business',
            'Content calendar template',
            'Monetization strategy breakdown',
          ].map(item => (
            <div key={item} className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-[#7C3AED]/30 flex-shrink-0" />
              <div className="h-3 bg-[#E4E4E7] rounded flex-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Email form overlay */}
      <div className="bg-white border-t border-[#F4F4F5] p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#EDE9FE] flex items-center justify-center flex-shrink-0">
            <Lock className="w-4.5 h-4.5 text-[#7C3AED]" />
          </div>
          <div>
            <h3 className="font-bold text-[#18181B] text-base leading-tight">
              Get your free {archetype.name} starter plan
            </h3>
            <p className="text-xs text-[#71717A] mt-0.5 leading-relaxed">
              Your 30-day action plan, content strategy, and tool list - free, no account needed.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="input-field pl-10 w-full"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-red-500">{errorMsg}</p>
          )}

          <motion.button
            type="submit"
            disabled={status === 'loading' || !email.trim()}
            whileTap={{ scale: 0.97 }}
            className="btn-primary w-full py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? (
              <span className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                Sending...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Send me the free plan <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </motion.button>

          <p className="text-[10px] text-[#A1A1AA] text-center">
            No spam. Unsubscribe any time.
          </p>
        </form>

        <div className="mt-4 pt-4 border-t border-[#F4F4F5] text-center">
          <p className="text-xs text-[#A1A1AA]">
            Want the full dashboard?{' '}
            <Link
              href={`/signup?from=quiz&type=${archetype.key}`}
              className="text-[#7C3AED] font-semibold hover:underline"
            >
              Create a free account
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ── Card wrapper ──────────────────────────────────────────────────────────────

function Card({
  title,
  children,
  delay = 0,
}: {
  title: string
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl border border-[#E4E4E7] p-5"
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA] mb-3">{title}</p>
      {children}
    </motion.div>
  )
}
