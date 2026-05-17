-- Run this in Supabase Dashboard > SQL Editor
-- Creates the quiz_leads table to store funnel emails

CREATE TABLE IF NOT EXISTS public.quiz_leads (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  email       text        NOT NULL,
  archetype   text        NOT NULL DEFAULT 'unknown',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  CONSTRAINT quiz_leads_email_key UNIQUE (email)
);

-- Index for fast email lookups
CREATE INDEX IF NOT EXISTS quiz_leads_email_idx ON public.quiz_leads (email);
CREATE INDEX IF NOT EXISTS quiz_leads_archetype_idx ON public.quiz_leads (archetype);
CREATE INDEX IF NOT EXISTS quiz_leads_created_idx ON public.quiz_leads (created_at DESC);

-- RLS: only the service role (your API) can read/write this table
ALTER TABLE public.quiz_leads ENABLE ROW LEVEL SECURITY;

-- No public access - all reads/writes go through the API route using the service role key
CREATE POLICY "service role only" ON public.quiz_leads
  USING (false)
  WITH CHECK (false);
