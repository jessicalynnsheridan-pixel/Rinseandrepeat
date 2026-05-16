import { useEffect, useRef, useState, useCallback } from 'react'

export type FieldType = 'text' | 'textarea' | 'brainstorm'

export interface WorkspaceField {
  id: string
  label: string
  placeholder: string
  type: FieldType
  hint?: string
}

export type WorkspaceData = Record<string, string | string[]>

// ── Field templates per milestone ID ──────────────────────────
export const WORKSPACE_TEMPLATES: Record<string, WorkspaceField[]> = {
  // ── Shopify ─────────────────────────────────────
  s1: [
    {
      id: 'niche_ideas',
      label: 'Niche Ideas',
      type: 'brainstorm',
      placeholder: 'Type an idea + Enter',
      hint: 'Start with what you buy, love, or get asked about most',
    },
    {
      id: 'target_audience',
      label: 'Who is your customer?',
      type: 'textarea',
      placeholder: "She's a 26-year-old woman who loves... she struggles with... she dreams of...",
    },
    {
      id: 'competitor_notes',
      label: 'Competitor Observations',
      type: 'textarea',
      placeholder: "Who's already doing this? What do you like or dislike? What gap do you see?",
    },
    {
      id: 'final_niche',
      label: 'My Chosen Niche',
      type: 'text',
      placeholder: "I am building a brand for...",
      hint: 'One clear sentence. You can always refine.',
    },
  ],
  s2: [
    {
      id: 'business_name',
      label: 'Business / LLC Name',
      type: 'text',
      placeholder: 'The legal name you plan to register',
    },
    {
      id: 'state',
      label: 'State of Registration',
      type: 'text',
      placeholder: 'e.g. Texas, Florida, California...',
    },
    {
      id: 'bank_options',
      label: "Banks I'm Considering",
      type: 'brainstorm',
      placeholder: 'Add a bank name...',
      hint: 'Chase, Mercury, Relay, and Found are popular with founders',
    },
    {
      id: 'legal_notes',
      label: 'Questions & Notes',
      type: 'textarea',
      placeholder: "Anything you're unsure about or want to research...",
    },
  ],
  s3: [
    {
      id: 'store_url',
      label: 'My Store URL',
      type: 'text',
      placeholder: 'yourstore.myshopify.com',
    },
    {
      id: 'theme_inspiration',
      label: 'Theme & Design Inspiration',
      type: 'textarea',
      placeholder: 'Describe the vibe — stores you love, colors, clean vs bold, minimal vs maximalist...',
    },
    {
      id: 'color_ideas',
      label: 'Brand Color Ideas',
      type: 'brainstorm',
      placeholder: 'Add a color or hex code...',
    },
    {
      id: 'domain_ideas',
      label: 'Domain Name Ideas',
      type: 'brainstorm',
      placeholder: 'Add a domain idea...',
      hint: 'Check availability on Namecheap or Google Domains',
    },
  ],
  s4: [
    {
      id: 'product_ideas',
      label: 'Product Ideas',
      type: 'brainstorm',
      placeholder: 'Add a product you want to sell...',
    },
    {
      id: 'supplier_options',
      label: 'Supplier Options',
      type: 'brainstorm',
      placeholder: 'Add supplier name or link...',
      hint: 'Check Alibaba, CJ Dropshipping, Faire, or niche-specific wholesalers',
    },
    {
      id: 'sample_notes',
      label: 'Sample Testing Notes',
      type: 'textarea',
      placeholder: 'Quality observations, packaging thoughts, what to improve...',
    },
    {
      id: 'final_supplier',
      label: 'Final Supplier Choice',
      type: 'text',
      placeholder: "I'm going with...",
    },
  ],
  s5: [
    {
      id: 'brand_name_ideas',
      label: 'Brand Name Ideas',
      type: 'brainstorm',
      placeholder: 'Add a name idea...',
      hint: 'Say it out loud — does it feel right?',
    },
    {
      id: 'tagline_ideas',
      label: 'Tagline Ideas',
      type: 'brainstorm',
      placeholder: 'Add a tagline...',
    },
    {
      id: 'brand_mission',
      label: 'Brand Mission',
      type: 'textarea',
      placeholder: 'We exist to help [customer] achieve [outcome] by [how you do it]...',
    },
    {
      id: 'brand_voice_notes',
      label: 'Brand Voice & Vibe',
      type: 'textarea',
      placeholder: '3 words that describe how your brand sounds: bold, warm, luxurious... What brands do you admire?',
    },
  ],
  l1: [
    {
      id: 'pricing_strategy',
      label: 'Pricing Strategy',
      type: 'textarea',
      placeholder: 'My costs are $X, I want a Y% margin, so my price is $Z... How does this compare to competitors?',
    },
    {
      id: 'listing_notes',
      label: 'Listing Copy Notes',
      type: 'textarea',
      placeholder: 'Key benefits to highlight, keywords to use, tone of voice for descriptions...',
    },
    {
      id: 'photo_ideas',
      label: 'Photo & Creative Ideas',
      type: 'brainstorm',
      placeholder: 'Flat lay, lifestyle, close-up, model shots...',
    },
  ],
  l2: [
    {
      id: 'handles',
      label: 'Username Ideas',
      type: 'brainstorm',
      placeholder: 'Add a handle idea...',
      hint: 'Keep it consistent across platforms',
    },
    {
      id: 'bio_draft',
      label: 'Bio Draft',
      type: 'textarea',
      placeholder: 'Write your Instagram/TikTok bio here. What do you do, who do you serve, and what should they do?',
    },
    {
      id: 'first_content_ideas',
      label: 'First 9 Content Ideas',
      type: 'brainstorm',
      placeholder: 'Add a post idea...',
      hint: 'Your first 9 posts are your storefront — make them count',
    },
  ],
  l3: [
    {
      id: 'launch_date',
      label: 'Target Launch Date',
      type: 'text',
      placeholder: 'e.g. June 1st, 2025',
    },
    {
      id: 'launch_promo',
      label: 'Launch Offer',
      type: 'text',
      placeholder: 'e.g. 15% off first order, free shipping, bonus gift...',
    },
    {
      id: 'launch_content_plan',
      label: 'Launch Week Content Plan',
      type: 'textarea',
      placeholder: 'Day 1: announce, Day 2: product reveal, Day 3: behind the scenes...',
    },
    {
      id: 'people_to_tell',
      label: 'People To Tell',
      type: 'brainstorm',
      placeholder: 'Add a name or group...',
      hint: 'Your first sale will come from someone you already know',
    },
  ],
  g1: [
    {
      id: 'ad_audience',
      label: 'Target Audience Notes',
      type: 'textarea',
      placeholder: "Age, interests, behaviors, lookalikes... who are you targeting first?",
    },
    {
      id: 'ad_creative_ideas',
      label: 'Ad Creative Ideas',
      type: 'brainstorm',
      placeholder: 'Add a concept or hook...',
      hint: 'Test one image, one video, and one UGC-style creative',
    },
    {
      id: 'ad_budget_plan',
      label: 'Budget Plan',
      type: 'text',
      placeholder: 'Starting with $__ /day for __ weeks before evaluating',
    },
  ],
  g2: [
    {
      id: 'lead_magnet',
      label: 'Lead Magnet Idea',
      type: 'text',
      placeholder: 'What will you offer in exchange for their email? (discount, freebie, guide...)',
    },
    {
      id: 'welcome_email_draft',
      label: 'Welcome Email Draft',
      type: 'textarea',
      placeholder: 'Hey [name]! Welcome to [brand]. I started this brand because...',
    },
    {
      id: 'email_sequence_ideas',
      label: 'Sequence Ideas',
      type: 'brainstorm',
      placeholder: 'Add an email idea...',
      hint: 'Think: welcome, brand story, social proof, best seller, limited offer',
    },
  ],
  sc1: [
    {
      id: 'revenue_plan',
      label: 'Path to $5K',
      type: 'textarea',
      placeholder: 'To hit $5K I need to sell X units at $Y each. My plan is...',
    },
    {
      id: 'top_products',
      label: 'Top Performing Products',
      type: 'brainstorm',
      placeholder: 'Add your best sellers...',
    },
    {
      id: 'influencer_list',
      label: 'Micro-Influencer Prospects',
      type: 'brainstorm',
      placeholder: 'Add a handle or name...',
      hint: '1K-50K followers, high engagement, your exact niche',
    },
  ],

  // ── Digital Product ──────────────────────────────────────────
  d1: [
    {
      id: 'skills_list',
      label: 'Things I Know Well',
      type: 'brainstorm',
      placeholder: 'Add a skill, knowledge area, or life experience...',
      hint: 'What do friends ask you for help with?',
    },
    {
      id: 'product_ideas',
      label: 'Product Ideas',
      type: 'brainstorm',
      placeholder: 'Template, ebook, course, tracker, toolkit...',
    },
    {
      id: 'validation_notes',
      label: 'Validation Notes',
      type: 'textarea',
      placeholder: 'What did people say when you asked? Search results, comments, DMs that confirm demand...',
    },
  ],
  d2: [
    {
      id: 'product_name',
      label: 'Product Name',
      type: 'text',
      placeholder: 'e.g. The $10K Shopify Launch Playbook',
    },
    {
      id: 'product_outline',
      label: 'Product Outline',
      type: 'textarea',
      placeholder: 'Section 1: ...\nSection 2: ...\nSection 3: ...',
    },
    {
      id: 'pricing_notes',
      label: 'Pricing Decision',
      type: 'text',
      placeholder: "I'm pricing this at $__ because...",
    },
  ],
  d3: [
    {
      id: 'stan_url',
      label: 'My Stan Store URL',
      type: 'text',
      placeholder: 'stan.store/yourusername',
    },
    {
      id: 'product_description',
      label: 'Product Description Draft',
      type: 'textarea',
      placeholder: "This [product type] is for [who] who want to [outcome]. Inside you'll get...",
    },
  ],
  dl1: [
    {
      id: 'launch_date',
      label: 'Launch Date',
      type: 'text',
      placeholder: 'e.g. Monday, June 2nd',
    },
    {
      id: 'launch_posts',
      label: 'Launch Content Ideas',
      type: 'brainstorm',
      placeholder: 'Add a post/reel idea...',
      hint: 'Tease → Reveal → Social proof → Last chance',
    },
    {
      id: 'launch_bonus',
      label: 'Launch Bonus',
      type: 'text',
      placeholder: "What early buyers get: e.g. a bonus template, 1:1 call, extra module...",
    },
  ],

  // ── Creator ──────────────────────────────────────────────────
  c1: [
    {
      id: 'content_topics',
      label: 'Content Topics I Love',
      type: 'brainstorm',
      placeholder: 'Add a topic...',
      hint: 'What could you post about for a year without getting bored?',
    },
    {
      id: 'unique_angle',
      label: 'My Unique Angle',
      type: 'textarea',
      placeholder: 'What makes my take on this topic different? What life experience do I bring?',
    },
    {
      id: 'mission_statement',
      label: 'Content Mission',
      type: 'text',
      placeholder: 'I help [who] do/become [what] through [content type]',
    },
  ],
  c2: [
    {
      id: 'username_ideas',
      label: 'Username Ideas',
      type: 'brainstorm',
      placeholder: 'Add a handle...',
    },
    {
      id: 'bio_draft',
      label: 'Bio Draft',
      type: 'textarea',
      placeholder: 'Hook → what you do → who you help → call to action',
    },
    {
      id: 'content_pillars',
      label: 'Content Pillars (3-4 topics)',
      type: 'brainstorm',
      placeholder: 'Add a pillar...',
      hint: 'These are the categories your content always falls into',
    },
  ],

  // ── Service ──────────────────────────────────────────────────
  sv1: [
    {
      id: 'skills',
      label: 'My Marketable Skills',
      type: 'brainstorm',
      placeholder: 'Add a skill...',
    },
    {
      id: 'service_offer',
      label: 'My Service Offer (1 sentence)',
      type: 'text',
      placeholder: 'I help [who] achieve [result] through [service] in [timeframe]',
      hint: 'The more specific, the easier it is to sell',
    },
    {
      id: 'ideal_client',
      label: 'Ideal Client Description',
      type: 'textarea',
      placeholder: 'She runs a... she struggles with... her budget is... she values...',
    },
    {
      id: 'pricing_thoughts',
      label: 'Pricing Thoughts',
      type: 'text',
      placeholder: 'Starting rate: $__. Goal rate in 6 months: $__',
    },
  ],
  sv2: [
    {
      id: 'warm_leads',
      label: 'People Who Might Need This',
      type: 'brainstorm',
      placeholder: 'Add a name...',
      hint: 'Think: ex-colleagues, business owner friends, local businesses, Instagram connections',
    },
    {
      id: 'pitch_draft',
      label: 'Outreach Message Draft',
      type: 'textarea',
      placeholder: "Hey [name], I noticed you... I help businesses like yours... would you be open to a quick call?",
    },
    {
      id: 'first_offer',
      label: 'First Client Offer',
      type: 'text',
      placeholder: 'e.g. First project at $500 in exchange for a video testimonial',
    },
  ],

  // ── Affiliate ────────────────────────────────────────────────
  a1: [
    {
      id: 'products_i_use',
      label: 'Products I Already Use & Love',
      type: 'brainstorm',
      placeholder: 'Add a product...',
    },
    {
      id: 'affiliate_programs',
      label: 'Affiliate Programs to Apply For',
      type: 'brainstorm',
      placeholder: 'e.g. Amazon, LTK, ShareASale, Shopify Affiliates...',
    },
    {
      id: 'content_strategy',
      label: 'Content Strategy',
      type: 'textarea',
      placeholder: 'How will you promote these products? What platform, what type of content, how often?',
    },
  ],

  // ── Med Spa ──────────────────────────────────────────────────
  m1: [
    {
      id: 'license_requirements',
      label: 'Licensing Requirements (My State)',
      type: 'textarea',
      placeholder: 'What licenses do I need? What courses? What are the costs and timelines?',
    },
    {
      id: 'insurance_notes',
      label: 'Insurance Notes',
      type: 'text',
      placeholder: 'e.g. Professional liability + general liability — quotes from...',
    },
    {
      id: 'business_questions',
      label: 'Open Questions',
      type: 'brainstorm',
      placeholder: 'Add a question to research...',
    },
  ],
}

// ── Generic fallback for milestones without templates ──────────
export const DEFAULT_WORKSPACE: WorkspaceField[] = [
  {
    id: 'notes',
    label: 'My Notes',
    type: 'textarea',
    placeholder: 'Jot down ideas, decisions, questions, and insights as you work through this step...',
  },
  {
    id: 'ideas',
    label: 'Ideas & Brainstorm',
    type: 'brainstorm',
    placeholder: 'Add an idea...',
  },
]

// ── localStorage hook with debounced auto-save ─────────────────
export function useWorkspace(milestoneId: string) {
  const [data, setData] = useState<WorkspaceData>({})
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`ws_${milestoneId}`)
      if (raw) setData(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [milestoneId])

  const update = useCallback((fieldId: string, value: string | string[]) => {
    setData(prev => {
      const next = { ...prev, [fieldId]: value }

      if (timerRef.current) clearTimeout(timerRef.current)
      setSaveState('saving')
      timerRef.current = setTimeout(() => {
        try {
          localStorage.setItem(`ws_${milestoneId}`, JSON.stringify(next))
        } catch {
          // storage full or private mode
        }
        setSaveState('saved')
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
        saveTimerRef.current = setTimeout(() => setSaveState('idle'), 2000)
      }, 700)

      return next
    })
  }, [milestoneId])

  return { data, update, saveState }
}
