# Deploying Rinse & Repeat CEO to Vercel

## 1. Get your OpenAI API Key (5 min)

1. Go to platform.openai.com → Sign up or sign in
2. Click your avatar → **API Keys** → **Create new secret key**
3. Copy the key — it starts with `sk-proj-...`
4. Add credit to your account (Settings → Billing) — $5–10 is plenty to start
5. Paste the key into `.env.local` as `OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE`

## 2. Set up Supabase Email (2 min)

In your Supabase dashboard (supabase.com → your project):
1. Go to **Authentication → URL Configuration**
2. Set **Site URL** to your Vercel domain (e.g. `https://rinseandrepeatceo.vercel.app`)
3. Add the same URL to **Redirect URLs**
4. Optionally: **Authentication → Email** → turn off "Confirm email" to skip verification in early beta

## 3. Deploy to Vercel (10 min)

### Option A — GitHub (recommended)
1. Push this repo to GitHub (`git init && git add . && git commit -m "init" && git remote add origin YOUR_REPO && git push`)
2. Go to vercel.com → New Project → Import from GitHub
3. Select the repo → Framework: **Next.js** (auto-detected)
4. Add ALL environment variables (see below)
5. Click Deploy

### Option B — Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

## 4. Environment Variables for Vercel

Add these in Vercel → Project Settings → Environment Variables:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://gkccmuyincervcljhgtl.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (from .env.local) |
| `SUPABASE_SERVICE_ROLE_KEY` | (from .env.local) |
| `OPENAI_API_KEY` | `sk-proj-YOUR_KEY` |
| `NEXT_PUBLIC_APP_URL` | `https://YOUR_VERCEL_DOMAIN.vercel.app` |

Leave Stripe keys blank for now — add them when you're ready to charge.

## 5. Set up the Supabase database (5 min)

1. Go to supabase.com → your project → **SQL Editor**
2. Paste the contents of `supabase/schema.sql`
3. Click **Run** — this creates all tables, RLS policies, and functions

## 6. You're live!

Your app will be at: `https://YOUR_PROJECT.vercel.app`

Test the full flow:
- [ ] Visit `/signup` → create an account
- [ ] Complete onboarding
- [ ] Open dashboard — your real profile should show
- [ ] Try the AI Assistant (if OpenAI key is set)
- [ ] Check vault, habits, calculators

---

## Adding Stripe later

When ready to charge customers:
1. Create products in Stripe Dashboard → Products
2. Copy the Price IDs and add to Vercel env vars
3. Set Stripe webhook endpoint: `https://YOUR_DOMAIN/api/stripe/webhook`
4. Add `STRIPE_WEBHOOK_SECRET` from the webhook settings
