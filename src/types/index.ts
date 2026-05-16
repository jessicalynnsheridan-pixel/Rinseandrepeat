// ──────────────────────────────────────────
// User & Auth
// ──────────────────────────────────────────
export type SubscriptionTier = 'free' | 'pro' | 'ceo'
export type BusinessStage = 'idea' | 'building' | 'launched' | 'scaling'
export type UserLevel = 'intern' | 'founder' | 'ceo' | 'empire'

export type BusinessType =
  | 'shopify'
  | 'medspa'
  | 'digital'
  | 'affiliate'
  | 'creator'
  | 'service'

export interface Profile {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  bio: string | null
  business_type: BusinessType | null
  business_stage: BusinessStage | null
  revenue_goal: number | null
  current_revenue: number
  subscription_tier: SubscriptionTier
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  xp_points: number
  level: UserLevel
  streak_current: number
  streak_best: number
  last_active_date: string | null
  onboarding_completed: boolean
  goals: string[]
  created_at: string
  updated_at: string
}

// ──────────────────────────────────────────
// Roadmaps
// ──────────────────────────────────────────
export type RoadmapCategory = BusinessType
export type MilestonePhase = 'foundation' | 'launch' | 'growth' | 'scale'
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export interface Roadmap {
  id: string
  slug: string
  title: string
  description: string | null
  category: RoadmapCategory
  tier_required: SubscriptionTier
  icon: string
  cover_image_url: string | null
  total_milestones: number
  estimated_weeks: number | null
  difficulty: DifficultyLevel
  is_active: boolean
  created_at: string
}

export interface ChecklistItem {
  id: string
  text: string
  completed?: boolean
}

export interface Milestone {
  id: string
  roadmap_id: string
  title: string
  description: string | null
  order_index: number
  phase: MilestonePhase
  is_locked: boolean
  xp_reward: number
  checklist_items: ChecklistItem[]
  lesson_content: string | null
  resources: string[]
  created_at: string
}

export interface UserRoadmap {
  id: string
  user_id: string
  roadmap_id: string
  is_active: boolean
  started_at: string
  completed_at: string | null
  progress_percentage?: number
  roadmap?: Roadmap
}

export interface UserMilestone {
  id: string
  user_id: string
  milestone_id: string
  is_completed: boolean
  completed_at: string | null
  checklist_progress: Record<string, boolean>
  notes: string | null
  milestone?: Milestone
}

// ──────────────────────────────────────────
// Resources / Vault
// ──────────────────────────────────────────
export type ResourceCategory =
  | 'pdf'
  | 'template'
  | 'checklist'
  | 'script'
  | 'prompt'
  | 'guide'
  | 'email'
  | 'supplier'
  | 'automation'
  | 'branding'

export interface Resource {
  id: string
  title: string
  description: string | null
  category: ResourceCategory
  business_type: BusinessType[]
  tier_required: SubscriptionTier
  file_url: string | null
  preview_url: string | null
  tags: string[]
  download_count: number
  is_featured: boolean
  is_active: boolean
  created_at: string
}

// ──────────────────────────────────────────
// Habits
// ──────────────────────────────────────────
export type HabitCategory =
  | 'content'
  | 'outreach'
  | 'learning'
  | 'fitness'
  | 'mindset'
  | 'business'

export type HabitFrequency = 'daily' | 'weekdays' | 'weekly'

export interface Habit {
  id: string
  user_id: string | null
  title: string
  description: string | null
  category: HabitCategory
  icon: string
  color: string
  frequency: HabitFrequency
  target_count: number
  is_system: boolean
  is_active: boolean
  created_at: string
}

export interface HabitLog {
  id: string
  user_id: string
  habit_id: string
  logged_date: string
  count: number
  notes: string | null
  created_at: string
}

export interface HabitWithProgress extends Habit {
  today_completed: boolean
  week_completions: number
  streak: number
}

// ──────────────────────────────────────────
// Goals & Tasks
// ──────────────────────────────────────────
export interface WeeklyGoal {
  id: string
  user_id: string
  title: string
  week_start: string
  is_completed: boolean
  completed_at: string | null
  category: string | null
  created_at: string
}

export interface DailyTask {
  id: string
  user_id: string
  title: string
  description: string | null
  task_date: string
  is_completed: boolean
  completed_at: string | null
  xp_reward: number
  source: 'system' | 'roadmap' | 'ai' | 'user'
  created_at: string
}

// ──────────────────────────────────────────
// Community
// ──────────────────────────────────────────
export type PostType = 'win' | 'question' | 'update' | 'accountability'
export type ReactionType = 'like' | 'fire' | 'clap' | 'heart'

export interface CommunityPost {
  id: string
  user_id: string
  content: string
  post_type: PostType
  media_urls: string[]
  likes_count: number
  comments_count: number
  is_pinned: boolean
  is_active: boolean
  created_at: string
  author?: Profile
  user_reaction?: ReactionType | null
}

// ──────────────────────────────────────────
// Gamification
// ──────────────────────────────────────────
export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  xp_reward: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
  achievement?: Achievement
}

// ──────────────────────────────────────────
// Subscription / Billing
// ──────────────────────────────────────────
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  plan_id: SubscriptionTier
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

// ──────────────────────────────────────────
// AI Assistant
// ──────────────────────────────────────────
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

// ──────────────────────────────────────────
// Revenue
// ──────────────────────────────────────────
export interface RevenueLog {
  id: string
  user_id: string
  amount: number
  source: string | null
  notes: string | null
  logged_date: string
  created_at: string
}

// ──────────────────────────────────────────
// Onboarding
// ──────────────────────────────────────────
export interface OnboardingData {
  full_name: string
  business_type: BusinessType | null
  business_stage: BusinessStage | null
  goals: string[]
  selected_roadmap: string | null
  revenue_goal: number | null
}

// ──────────────────────────────────────────
// Subscription Plans
// ──────────────────────────────────────────
export interface SubscriptionPlan {
  id: SubscriptionTier
  name: string
  price_monthly: number
  price_yearly: number
  stripe_price_id_monthly: string
  stripe_price_id_yearly: string
  features: string[]
  highlighted: boolean
  badge?: string
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Starter',
    price_monthly: 0,
    price_yearly: 0,
    stripe_price_id_monthly: '',
    stripe_price_id_yearly: '',
    features: [
      '1 Startup Roadmap',
      'CEO Dashboard',
      'Basic Habit Tracker',
      '10 Vault Resources',
      'Community Access',
    ],
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Founder',
    price_monthly: 19,
    price_yearly: 179,
    stripe_price_id_monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || '',
    stripe_price_id_yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || '',
    features: [
      'All 6 Startup Roadmaps',
      'Full Resource Vault (200+ resources)',
      'AI Business Assistant (100 queries/mo)',
      'Revenue Tracker',
      'Advanced Habit Tracker',
      'Weekly Goal Setting',
      'Priority Community Badge',
    ],
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    id: 'ceo',
    name: 'CEO',
    price_monthly: 49,
    price_yearly: 449,
    stripe_price_id_monthly: process.env.NEXT_PUBLIC_STRIPE_CEO_MONTHLY_PRICE_ID || '',
    stripe_price_id_yearly: process.env.NEXT_PUBLIC_STRIPE_CEO_YEARLY_PRICE_ID || '',
    features: [
      'Everything in Founder',
      'Unlimited AI Queries',
      'Custom AI Business Plan',
      'Live Group Coaching Access',
      'Exclusive CEO Templates',
      'Supplier & Vendor Directory',
      'White-glove Onboarding Call',
      'CEO Private Community Channel',
    ],
    highlighted: false,
    badge: 'Best Value',
  },
]

// ──────────────────────────────────────────
// Business Type Metadata
// ──────────────────────────────────────────
export const BUSINESS_TYPES: Record<
  BusinessType,
  { label: string; icon: string; description: string; color: string }
> = {
  shopify: {
    label: 'Shopify Brand',
    icon: '🛍️',
    description: 'Build and scale an e-commerce brand',
    color: '#96BF48',
  },
  medspa: {
    label: 'Med Spa / Wellness',
    icon: '💆‍♀️',
    description: 'Open and grow a beauty or wellness business',
    color: '#E8B4B8',
  },
  digital: {
    label: 'Digital Products',
    icon: '💻',
    description: 'Create and sell digital courses, ebooks, tools',
    color: '#6C63FF',
  },
  affiliate: {
    label: 'Affiliate Marketing',
    icon: '🔗',
    description: 'Build passive income through recommendations',
    color: '#FF6B6B',
  },
  creator: {
    label: 'Content Creator',
    icon: '🎥',
    description: 'Grow an audience and monetize your content',
    color: '#FFA94D',
  },
  service: {
    label: 'Service Business',
    icon: '✨',
    description: 'Launch a consulting, freelance, or agency business',
    color: '#C4A264',
  },
}

export const LEVEL_THRESHOLDS: Record<UserLevel, number> = {
  intern: 0,
  founder: 500,
  ceo: 2000,
  empire: 5000,
}

export const LEVEL_METADATA: Record<
  UserLevel,
  { label: string; icon: string; color: string; nextLevel: UserLevel | null }
> = {
  intern: { label: 'Intern', icon: '🌱', color: '#6B6B67', nextLevel: 'founder' },
  founder: { label: 'Founder', icon: '🚀', color: '#C4A264', nextLevel: 'ceo' },
  ceo: { label: 'CEO', icon: '💎', color: '#6C63FF', nextLevel: 'empire' },
  empire: { label: 'Empire Builder', icon: '👑', color: '#FF6B6B', nextLevel: null },
}
