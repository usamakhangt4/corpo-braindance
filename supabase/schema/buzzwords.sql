-- Buzzwords Table Schema
-- Run this in Supabase SQL Editor to create the table

-- Create the buzzwords table
-- Note: If table already exists without user_id, run SUPABASE_MIGRATION_ADD_USER_ID.sql first
CREATE TABLE IF NOT EXISTS buzzwords (
  id BIGSERIAL PRIMARY KEY,
  phrase TEXT NOT NULL CHECK (char_length(phrase) BETWEEN 1 AND 200),
  meaning TEXT NOT NULL CHECK (char_length(meaning) BETWEEN 1 AND 1000),
  department TEXT NOT NULL CHECK (department IN ('CEO', 'SALES', 'TECH')),
  synergy_score INTEGER NOT NULL CHECK (synergy_score BETWEEN 0 AND 100),
  upvotes INTEGER DEFAULT 0 NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add user_id column if table exists but column doesn't (for existing tables)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'buzzwords')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buzzwords' AND column_name = 'user_id')
  THEN
    ALTER TABLE buzzwords ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_buzzwords_user_id ON buzzwords(user_id);
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_buzzwords_upvotes ON buzzwords(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_buzzwords_created_at ON buzzwords(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_buzzwords_department ON buzzwords(department);

-- Enable Row Level Security (RLS)
ALTER TABLE buzzwords ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Drop existing policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Anyone can read buzzwords" ON buzzwords;
DROP POLICY IF EXISTS "Authenticated users can insert buzzwords" ON buzzwords;
DROP POLICY IF EXISTS "Authenticated users can update upvotes" ON buzzwords;

-- Allow anyone to read buzzwords
CREATE POLICY "Anyone can read buzzwords"
  ON buzzwords FOR SELECT
  USING (true);

-- Allow authenticated users to insert buzzwords (must include their user_id)
CREATE POLICY "Authenticated users can insert buzzwords"
  ON buzzwords FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Vote totals are maintained only by the SECURITY DEFINER trigger in votes.sql.
-- RLS policies cannot restrict UPDATE to a column, so remove the table privilege.
REVOKE UPDATE ON TABLE public.buzzwords FROM authenticated;

