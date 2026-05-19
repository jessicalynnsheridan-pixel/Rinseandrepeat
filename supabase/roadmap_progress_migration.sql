-- ─────────────────────────────────────────────────────────────────────────────
-- roadmap_progress_migration.sql
-- Run this in your Supabase SQL editor once.
-- ─────────────────────────────────────────────────────────────────────────────

-- Stores per-user, per-roadmap progress as JSONB so it works with the
-- hardcoded milestone IDs in the client without needing a full milestones table.
CREATE TABLE IF NOT EXISTS roadmap_progress (
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  slug          TEXT NOT NULL,
  completed_ids JSONB NOT NULL DEFAULT '[]'::jsonb,  -- array of milestone ID strings
  checklists    JSONB NOT NULL DEFAULT '{}'::jsonb,  -- { milestoneId: { itemIndex: bool } }
  enrolled_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, slug)
);

-- RLS: users can only read/write their own rows
ALTER TABLE roadmap_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roadmap_progress_self"
  ON roadmap_progress
  FOR ALL
  USING (auth.uid() = user_id);

-- Auto-update updated_at on upsert
CREATE OR REPLACE FUNCTION touch_roadmap_progress()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER roadmap_progress_updated_at
  BEFORE UPDATE ON roadmap_progress
  FOR EACH ROW EXECUTE FUNCTION touch_roadmap_progress();
