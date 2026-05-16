-- ═══════════════════════════════════════════════════════════════
-- Rinse & Repeat CEO — Supabase Database Schema
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ──────────────────────────────────────────
CREATE TABLE profiles (
  id                     UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name              TEXT,
  username               TEXT UNIQUE,
  avatar_url             TEXT,
  bio                    TEXT,
  business_type          TEXT CHECK (business_type IN ('shopify','medspa','digital','affiliate','creator','service')),
  business_stage         TEXT CHECK (business_stage IN ('idea','building','launched','scaling')),
  revenue_goal           DECIMAL(10,2),
  current_revenue        DECIMAL(10,2) DEFAULT 0,
  subscription_tier      TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free','pro','ceo')),
  stripe_customer_id     TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  xp_points              INTEGER DEFAULT 0 CHECK (xp_points >= 0),
  level                  TEXT DEFAULT 'intern' CHECK (level IN ('intern','founder','ceo','empire')),
  streak_current         INTEGER DEFAULT 0 CHECK (streak_current >= 0),
  streak_best            INTEGER DEFAULT 0 CHECK (streak_best >= 0),
  last_active_date       DATE,
  onboarding_completed   BOOLEAN DEFAULT FALSE,
  goals                  TEXT[] DEFAULT '{}',
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ──────────────────────────────────────────
-- ROADMAPS (seeded content)
-- ──────────────────────────────────────────
CREATE TABLE roadmaps (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug             TEXT UNIQUE NOT NULL,
  title            TEXT NOT NULL,
  description      TEXT,
  category         TEXT NOT NULL CHECK (category IN ('shopify','medspa','digital','affiliate','creator','service')),
  tier_required    TEXT DEFAULT 'free' CHECK (tier_required IN ('free','pro','ceo')),
  icon             TEXT DEFAULT '📋',
  cover_image_url  TEXT,
  total_milestones INTEGER DEFAULT 0,
  estimated_weeks  INTEGER,
  difficulty       TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner','intermediate','advanced')),
  order_index      INTEGER DEFAULT 0,
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- MILESTONES
-- ──────────────────────────────────────────
CREATE TABLE milestones (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  roadmap_id       UUID REFERENCES roadmaps(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  order_index      INTEGER NOT NULL,
  phase            TEXT CHECK (phase IN ('foundation','launch','growth','scale')),
  is_locked        BOOLEAN DEFAULT FALSE,
  xp_reward        INTEGER DEFAULT 50 CHECK (xp_reward >= 0),
  checklist_items  JSONB DEFAULT '[]',
  lesson_content   TEXT,
  resources        JSONB DEFAULT '[]',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX milestones_roadmap_idx ON milestones(roadmap_id, order_index);

-- ──────────────────────────────────────────
-- USER ROADMAP ENROLLMENTS
-- ──────────────────────────────────────────
CREATE TABLE user_roadmaps (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  roadmap_id   UUID REFERENCES roadmaps(id) ON DELETE CASCADE,
  is_active    BOOLEAN DEFAULT TRUE,
  started_at   TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, roadmap_id)
);

CREATE INDEX user_roadmaps_user_idx ON user_roadmaps(user_id);

-- ──────────────────────────────────────────
-- USER MILESTONE PROGRESS
-- ──────────────────────────────────────────
CREATE TABLE user_milestones (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID REFERENCES profiles(id) ON DELETE CASCADE,
  milestone_id        UUID REFERENCES milestones(id) ON DELETE CASCADE,
  is_completed        BOOLEAN DEFAULT FALSE,
  completed_at        TIMESTAMPTZ,
  checklist_progress  JSONB DEFAULT '{}',
  notes               TEXT,
  UNIQUE(user_id, milestone_id)
);

CREATE INDEX user_milestones_user_idx ON user_milestones(user_id);

-- ──────────────────────────────────────────
-- RESOURCE VAULT
-- ──────────────────────────────────────────
CREATE TABLE resources (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title          TEXT NOT NULL,
  description    TEXT,
  category       TEXT NOT NULL CHECK (category IN ('pdf','template','checklist','script','prompt','guide','email','supplier','automation','branding')),
  business_type  TEXT[] DEFAULT '{}',
  tier_required  TEXT DEFAULT 'free' CHECK (tier_required IN ('free','pro','ceo')),
  file_url       TEXT,
  preview_url    TEXT,
  tags           TEXT[] DEFAULT '{}',
  download_count INTEGER DEFAULT 0,
  is_featured    BOOLEAN DEFAULT FALSE,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX resources_category_idx ON resources(category);
CREATE INDEX resources_tier_idx ON resources(tier_required);

-- ──────────────────────────────────────────
-- USER SAVED RESOURCES
-- ──────────────────────────────────────────
CREATE TABLE user_resources (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id   UUID REFERENCES resources(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  is_favorited  BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, resource_id)
);

-- ──────────────────────────────────────────
-- HABITS
-- ──────────────────────────────────────────
CREATE TABLE habits (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  category     TEXT NOT NULL CHECK (category IN ('content','outreach','learning','fitness','mindset','business')),
  icon         TEXT DEFAULT '✅',
  color        TEXT DEFAULT '#C4A264',
  frequency    TEXT DEFAULT 'daily' CHECK (frequency IN ('daily','weekdays','weekly')),
  target_count INTEGER DEFAULT 1 CHECK (target_count > 0),
  is_system    BOOLEAN DEFAULT FALSE,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- HABIT LOGS
-- ──────────────────────────────────────────
CREATE TABLE habit_logs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  habit_id    UUID REFERENCES habits(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL,
  count       INTEGER DEFAULT 1 CHECK (count > 0),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, habit_id, logged_date)
);

CREATE INDEX habit_logs_user_date_idx ON habit_logs(user_id, logged_date);

-- ──────────────────────────────────────────
-- WEEKLY GOALS
-- ──────────────────────────────────────────
CREATE TABLE weekly_goals (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  week_start   DATE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  category     TEXT,
  order_index  INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX weekly_goals_user_week_idx ON weekly_goals(user_id, week_start);

-- ──────────────────────────────────────────
-- DAILY TASKS
-- ──────────────────────────────────────────
CREATE TABLE daily_tasks (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  task_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  xp_reward    INTEGER DEFAULT 25 CHECK (xp_reward >= 0),
  source       TEXT DEFAULT 'system' CHECK (source IN ('system','roadmap','ai','user')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX daily_tasks_user_date_idx ON daily_tasks(user_id, task_date);

-- ──────────────────────────────────────────
-- COMMUNITY POSTS
-- ──────────────────────────────────────────
CREATE TABLE community_posts (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content        TEXT NOT NULL,
  post_type      TEXT DEFAULT 'update' CHECK (post_type IN ('win','question','update','accountability')),
  media_urls     TEXT[] DEFAULT '{}',
  likes_count    INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_pinned      BOOLEAN DEFAULT FALSE,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX community_posts_created_idx ON community_posts(created_at DESC) WHERE is_active = TRUE;

-- ──────────────────────────────────────────
-- COMMUNITY REACTIONS
-- ──────────────────────────────────────────
CREATE TABLE community_reactions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id       UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like','fire','clap','heart')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id, reaction_type)
);

-- ──────────────────────────────────────────
-- COMMUNITY COMMENTS
-- ──────────────────────────────────────────
CREATE TABLE community_comments (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id     UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- USER ACHIEVEMENTS / BADGES
-- ──────────────────────────────────────────
CREATE TABLE user_achievements (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  earned_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ──────────────────────────────────────────
-- SUBSCRIPTIONS (Stripe)
-- ──────────────────────────────────────────
CREATE TABLE subscriptions (
  id                     UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id     TEXT,
  plan_id                TEXT NOT NULL CHECK (plan_id IN ('free','pro','ceo')),
  status                 TEXT NOT NULL CHECK (status IN ('active','canceled','past_due','trialing','incomplete')),
  current_period_start   TIMESTAMPTZ,
  current_period_end     TIMESTAMPTZ,
  cancel_at_period_end   BOOLEAN DEFAULT FALSE,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────
-- AI CONVERSATIONS
-- ──────────────────────────────────────────
CREATE TABLE ai_conversations (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  messages   JSONB DEFAULT '[]',
  title      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER ai_conversations_updated_at
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────
-- REVENUE LOGS
-- ──────────────────────────────────────────
CREATE TABLE revenue_logs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount      DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  source      TEXT,
  notes       TEXT,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX revenue_logs_user_date_idx ON revenue_logs(user_id, logged_date);

-- ──────────────────────────────────────────
-- STREAK HELPER FUNCTION
-- ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_last_date DATE;
  v_today DATE := CURRENT_DATE;
  v_new_streak INTEGER;
BEGIN
  SELECT last_active_date INTO v_last_date FROM profiles WHERE id = p_user_id;

  IF v_last_date = v_today THEN
    RETURN; -- Already updated today
  ELSIF v_last_date = v_today - 1 THEN
    -- Consecutive day
    UPDATE profiles
    SET
      streak_current = streak_current + 1,
      streak_best = GREATEST(streak_best, streak_current + 1),
      last_active_date = v_today
    WHERE id = p_user_id;
  ELSE
    -- Streak broken
    UPDATE profiles
    SET streak_current = 1, last_active_date = v_today
    WHERE id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ──────────────────────────────────────────
-- XP AWARD FUNCTION
-- ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION award_xp(p_user_id UUID, p_xp INTEGER)
RETURNS VOID AS $$
DECLARE
  v_new_xp INTEGER;
  v_new_level TEXT;
BEGIN
  UPDATE profiles
  SET xp_points = xp_points + p_xp
  WHERE id = p_user_id
  RETURNING xp_points INTO v_new_xp;

  -- Update level
  v_new_level := CASE
    WHEN v_new_xp >= 5000 THEN 'empire'
    WHEN v_new_xp >= 2000 THEN 'ceo'
    WHEN v_new_xp >= 500  THEN 'founder'
    ELSE 'intern'
  END;

  UPDATE profiles SET level = v_new_level WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ──────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY "profiles_self_read"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (TRUE); -- public usernames etc.

-- User-owned data: full access to own rows
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['user_roadmaps','user_milestones','user_resources','habits','habit_logs','weekly_goals','daily_tasks','user_achievements','ai_conversations','revenue_logs']
  LOOP
    EXECUTE format('CREATE POLICY "%s_self" ON %s FOR ALL USING (auth.uid() = user_id)', t, t);
  END LOOP;
END $$;

-- Community: read all, write own
CREATE POLICY "posts_read_all"  ON community_posts FOR SELECT USING (is_active = TRUE);
CREATE POLICY "posts_write_own" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update_own" ON community_posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "reactions_all"     ON community_reactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "comments_read_all" ON community_comments FOR SELECT USING (is_active = TRUE);
CREATE POLICY "comments_write_own" ON community_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Roadmaps & resources: public read
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roadmaps_public" ON roadmaps FOR SELECT USING (is_active = TRUE);
CREATE POLICY "milestones_public" ON milestones FOR SELECT USING (TRUE);
CREATE POLICY "resources_public" ON resources FOR SELECT USING (is_active = TRUE);
