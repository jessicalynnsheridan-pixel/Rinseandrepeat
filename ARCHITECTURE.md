# Rinse & Repeat CEO — Complete App Architecture

## Overview

A Next.js 14 web app (mobile-first, PWA-ready) targeting beginner women entrepreneurs 18-35.
Aesthetic: luxury startup meets wellness app — Notion × Linear × Duolingo energy.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR, RSC, API routes in one project |
| Styling | Tailwind CSS + custom design tokens | Fast, consistent, utility-first |
| Animations | Framer Motion | Spring physics, page transitions, micro-interactions |
| Backend/DB | Supabase (Postgres + Auth + Storage) | Real-time, RLS, instant API |
| Payments | Stripe Subscriptions | Industry standard, webhooks, portal |
| AI | OpenAI GPT-4 (streaming) | Best-in-class, streamed responses |
| State | Zustand (client) + React Query (server) | Minimal boilerplate |
| Icons | Lucide React | Consistent, tree-shakeable |

---

## Folder Structure

```
rinse-and-repeat-ceo/
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout, fonts, Toaster
│   │   ├── page.tsx                 # Landing page (public)
│   │   ├── globals.css              # Design tokens, utility classes
│   │   │
│   │   ├── onboarding/
│   │   │   └── page.tsx             # Multi-step onboarding wizard
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx             # CEO dashboard (protected)
│   │   │
│   │   ├── roadmaps/
│   │   │   ├── page.tsx             # Roadmap explorer
│   │   │   └── [slug]/page.tsx      # Individual roadmap + milestones
│   │   │
│   │   ├── vault/
│   │   │   └── page.tsx             # Resource vault with filters
│   │   │
│   │   ├── ai-assistant/
│   │   │   └── page.tsx             # Full AI chat interface
│   │   │
│   │   ├── habits/
│   │   │   └── page.tsx             # Habit tracker calendar view
│   │   │
│   │   ├── revenue/
│   │   │   └── page.tsx             # Revenue logging + charts
│   │   │
│   │   ├── community/
│   │   │   └── page.tsx             # Feed, wins, accountability
│   │   │
│   │   ├── pricing/
│   │   │   └── page.tsx             # Pricing + upgrade flow
│   │   │
│   │   ├── settings/
│   │   │   └── page.tsx             # Profile, billing, notifications
│   │   │
│   │   └── api/
│   │       ├── ai/chat/route.ts     # OpenAI streaming endpoint
│   │       ├── stripe/
│   │       │   ├── checkout/route.ts
│   │       │   ├── webhook/route.ts
│   │       │   └── portal/route.ts
│   │       └── tasks/route.ts       # Daily task generation
│   │
│   ├── components/
│   │   ├── ui/                      # Primitives (Button, Card, Badge, etc.)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Input.tsx
│   │   │
│   │   ├── navigation/
│   │   │   ├── Sidebar.tsx          # Desktop left nav
│   │   │   ├── MobileNav.tsx        # Bottom tab bar (mobile)
│   │   │   └── TopBar.tsx           # Mobile top header
│   │   │
│   │   ├── dashboard/
│   │   │   ├── TodayTask.tsx
│   │   │   ├── StreakTracker.tsx
│   │   │   ├── WeeklyGoals.tsx
│   │   │   ├── RevenueTracker.tsx
│   │   │   ├── HabitsCard.tsx
│   │   │   └── MotivationCard.tsx
│   │   │
│   │   ├── roadmap/
│   │   │   ├── RoadmapCard.tsx
│   │   │   ├── MilestoneList.tsx
│   │   │   └── PhaseProgress.tsx
│   │   │
│   │   ├── vault/
│   │   │   └── ResourceCard.tsx
│   │   │
│   │   ├── ai/
│   │   │   ├── ChatInterface.tsx
│   │   │   └── MessageBubble.tsx
│   │   │
│   │   └── landing/
│   │       ├── Hero.tsx
│   │       ├── Features.tsx
│   │       └── Pricing.tsx
│   │
│   ├── lib/
│   │   ├── supabase.ts              # Browser, server, admin clients
│   │   ├── stripe.ts                # Stripe instance + helpers
│   │   └── utils.ts                 # cn(), formatCurrency(), etc.
│   │
│   ├── types/
│   │   └── index.ts                 # All TypeScript interfaces
│   │
│   ├── store/
│   │   ├── useProfileStore.ts       # User profile state (Zustand)
│   │   └── useDashboardStore.ts     # Dashboard ephemeral state
│   │
│   └── hooks/
│       ├── useProfile.ts            # React Query profile hook
│       ├── useStreak.ts             # Streak calculation hook
│       └── useAI.ts                 # Streaming AI hook
│
├── supabase/
│   ├── schema.sql                   # Full database schema + RLS
│   └── seed.sql                     # Roadmap content, resources
│
├── public/
│   ├── icons/                       # PWA icons
│   └── og/                          # Open Graph images
│
├── tailwind.config.ts               # Custom design tokens
├── next.config.js
└── .env.local                       # Environment variables
```

---

## Database Schema (Key Tables)

```
profiles          → Extended user data, XP, streaks, subscription tier
roadmaps          → Seeded content (6 paths)
milestones        → Steps within each roadmap
user_roadmaps     → Which roadmaps a user has enrolled in
user_milestones   → Progress per milestone
resources         → Vault items (PDFs, templates, etc.)
user_resources    → Downloads + favorites
habits            → User-defined + system habits
habit_logs        → Daily completion tracking
weekly_goals      → Weekly goal checklist
daily_tasks       → Daily CEO task (curated + AI-generated)
community_posts   → Feed posts (wins, questions, updates)
community_reactions → Likes, fire, clap, heart
community_comments  → Thread replies
user_achievements → Earned badges/milestones
subscriptions     → Stripe subscription state
ai_conversations  → Chat history per user
revenue_logs      → Monthly revenue tracking
```

---

## Onboarding Flow (5 steps)

```
Step 1: Name          → Personalize greeting
Step 2: Business type → Filter roadmaps + content
Step 3: Stage         → Beginner vs scaling content
Step 4: Goals         → Multi-select (8 options)
Step 5: Roadmap pick  → First roadmap enrolled
       ↓
Celebration screen → "You're ready, [Name]!"
       ↓
/dashboard (streak starts, first daily task assigned)
```

---

## Subscription Plans

| Plan | Price | Key Limits |
|---|---|---|
| Starter (free) | $0 | 1 roadmap, 10 vault resources, 10 AI queries/mo |
| Founder (pro) | $19/mo | All roadmaps, 200+ vault, 100 AI queries/mo |
| CEO | $49/mo | Everything + unlimited AI, coaching, supplier directory |

Stripe integration:
- 7-day free trial on paid plans
- Checkout Sessions API
- Customer Portal for self-service upgrades/cancellations
- Webhooks for real-time subscription state sync

---

## Gamification System

### XP & Levels

| Level | XP Required | Icon |
|---|---|---|
| Intern | 0 | 🌱 |
| Founder | 500 | 🚀 |
| CEO | 2,000 | 💎 |
| Empire Builder | 5,000 | 👑 |

XP sources:
- Complete daily task: +25 XP
- Complete milestone: +50 XP  
- Habit logged: +10 XP
- Weekly goal completed: +30 XP
- AI query made: +5 XP
- Community post: +15 XP
- Revenue logged: +20 XP
- Streak milestone (7/14/30/90 days): +100/200/500/1000 XP

### Streak System
- Maintained by logging any task, habit, or milestone per day
- `update_user_streak()` Postgres function called on activity
- Streak breaks if `last_active_date < CURRENT_DATE - 1`
- Streak freeze feature (2/month for Pro, 5/month for CEO)

### Achievements / Badges

| Badge | Trigger |
|---|---|
| 🔥 First Flame | 3-day streak |
| ⚡ Spark | Complete first task |
| 🎯 Goal Setter | Set first weekly goal |
| 💰 First Dollar | Log first revenue |
| 🚀 Launched | Complete roadmap Launch phase |
| 👑 CEO | Reach CEO level (2000 XP) |
| 💎 Diamond Hands | 30-day streak |
| 🏆 Empire | Reach Empire Builder level |
| 📚 Scholar | Download 25 vault resources |
| 🤖 Power User | Send 100 AI messages |

### Weekly Leaderboard (Community)
- Opt-in XP leaderboard
- Top 10 displayed in community section
- Resets Monday 00:00 UTC

---

## AI Business Assistant

Architecture:
1. User sends message → `POST /api/ai/chat`
2. Server validates auth + checks monthly quota
3. Streams GPT-4 response via SSE
4. Saves conversation to `ai_conversations` table
5. Awards +5 XP per query

System prompt personalizes advice based on:
- User's business type
- Current roadmap stage
- Goals from onboarding

Quota limits:
- Free: 10/month
- Pro: 100/month  
- CEO: unlimited

Suggested prompts (context-aware, change based on roadmap phase):
- Foundation phase → "What should I name my brand?"
- Launch phase → "Write my product description for [item]"
- Growth phase → "Give me a TikTok content strategy for Q4"
- Scale phase → "How do I hire my first team member?"

---

## Design System

### Colors
```
Backgrounds:  cream-50 (#FAFAF8) • cream-100 (#F5F3EF)
Text:         ink-900 (#1A1A18) • ink-500 (#6B6B67) • ink-300 (#AEAEAA)
Accent:       gold-500 (#C4A264) • gold-100 (#FBF4E8)
Success:      #5BA878
Warning:      #E5974A
Borders:      ink-100 (#E8E7E3)
```

### Typography
- Display (headlines): Plus Jakarta Sans 700/800
- Body: Inter 400/500
- Labels: Inter 600 (uppercase, tracked)

### Spacing & Radius
- Cards: rounded-2xl (16px) with 1px border + subtle shadow
- Buttons: rounded-xl (12px)
- Inputs: rounded-xl with gold focus ring
- Full pages use max-w-6xl with px-6 padding

### Motion Principles
- Page entrance: fadeUp (y: 24→0, opacity 0→1, 0.5s)
- Card hover: translateY(-2px) + shadow upgrade
- Step transitions: slide in/out (x: ±60)
- Progress bars: width animation with spring easing
- Streak badge: bounceGentle infinite loop
- XP pop: scaleIn with spring bounce

---

## Mobile Strategy

The app is built mobile-first:

- Sidebar hidden on mobile → bottom tab bar (`MobileNav.tsx`)
- Single-column grid on < lg breakpoint
- Touch-friendly tap targets (min 44px)
- Safe area insets for iOS notch/home indicator
- PWA manifest for "Add to Home Screen"
- Optimistic UI updates for instant feedback
- Offline-friendly: cache daily task and roadmap data

Future: React Native (Expo) wrapper for native iOS/Android distribution using the same Supabase backend.

---

## Future Scaling Roadmap

### Phase 1 (Launch — 0 to 1K users)
- [x] Core dashboard + roadmaps + vault
- [x] AI assistant
- [x] Habit tracker
- [x] Stripe subscriptions
- [ ] Email onboarding sequence (7 days)
- [ ] Push notifications (daily task reminder)
- [ ] Affiliate/referral program

### Phase 2 (Growth — 1K to 10K users)
- [ ] Native iOS/Android app (Expo)
- [ ] Live group coaching integration (Cal.com + Zoom)
- [ ] Roadmap completion certificates (shareable)
- [ ] Marketplace for community templates
- [ ] Advanced revenue analytics dashboard
- [ ] Accountability partner matching
- [ ] Weekly email digest (wins + tips)

### Phase 3 (Scale — 10K+ users)
- [ ] Custom AI business plan generator
- [ ] B2B offering (teams, agencies)
- [ ] Cohort-based courses (live 30-day programs)
- [ ] White-label for business coaches
- [ ] Physical planner (print-on-demand)
- [ ] Affiliate partner directory
- [ ] In-app marketplace (sell your templates to community)

### Tech Scaling
- Add Redis (Upstash) for rate limiting and caching
- CDN for vault file delivery (Cloudflare R2)
- Background jobs (Inngest/QStash) for: streak recalculation, daily task generation, email sends
- Analytics (PostHog) for funnel optimization
- A/B testing on onboarding and pricing pages

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRO_MONTHLY_PRICE_ID=
STRIPE_PRO_YEARLY_PRICE_ID=
STRIPE_CEO_MONTHLY_PRICE_ID=
STRIPE_CEO_YEARLY_PRICE_ID=

# OpenAI
OPENAI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://rinseandrepeatceo.com
```

---

## Key User Flows

### New User
1. Land on homepage → click "Start for Free"
2. Onboarding (5 steps, ~2 min)
3. Dashboard loads with first CEO task assigned
4. Notification: "Complete your first task to start your streak!"
5. User completes task → +25 XP → celebration animation
6. Streak begins → day 1

### Daily Returning User  
1. Open app → dashboard loads
2. See streak badge ("Day 8! 🔥")
3. Today's CEO Task is front and center
4. Log habits (check off with satisfying animation)
5. Check roadmap → next milestone unlocked
6. Optional: ask AI assistant a question
7. Optional: post a win in community

### Upgrade Flow
1. User hits free limit (vault resource locked)
2. See "Upgrade to Founder" CTA with feature list
3. Click → Stripe Checkout (7-day trial)
4. Return to app → immediate access unlocked
5. +200 XP awarded for upgrading
