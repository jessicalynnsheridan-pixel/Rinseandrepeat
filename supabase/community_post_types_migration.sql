-- ══════════════════════════════════════════════════════════════════════════
-- Run in Supabase Dashboard → SQL Editor
-- Adds 'tip' and 'resource' to the community_posts CHECK constraint
-- so any legacy data or future additions with those types don't break.
-- Also adds selected_roadmap column to profiles if missing.
-- ══════════════════════════════════════════════════════════════════════════

-- 1. Drop the old CHECK constraint and recreate with all valid types
ALTER TABLE community_posts
  DROP CONSTRAINT IF EXISTS community_posts_post_type_check;

ALTER TABLE community_posts
  ADD CONSTRAINT community_posts_post_type_check
  CHECK (post_type IN ('win', 'question', 'update', 'accountability', 'tip', 'resource'));

-- 2. Ensure selected_roadmap column exists on profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS selected_roadmap TEXT;
