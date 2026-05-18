-- Run this in Supabase Dashboard → SQL Editor

-- Stores pending plan upgrades for users who bought on Stan Store
-- before creating their app account
CREATE TABLE IF NOT EXISTS pending_upgrades (
  email TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('pro', 'ceo')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only service role can read/write this table
ALTER TABLE pending_upgrades ENABLE ROW LEVEL SECURITY;

-- No user-facing RLS needed — only accessed via admin client in webhook
