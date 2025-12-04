-- Buzzwords Table Schema
-- Run this in Supabase SQL Editor to create the table

-- Create the buzzwords table
-- Note: If table already exists without user_id, run SUPABASE_MIGRATION_ADD_USER_ID.sql first
CREATE TABLE IF NOT EXISTS buzzwords (
  id BIGSERIAL PRIMARY KEY,
  phrase TEXT NOT NULL,
  meaning TEXT NOT NULL,
  department TEXT NOT NULL,
  synergy_score INTEGER NOT NULL,
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

-- Allow only authenticated users to update upvotes (for voting)
CREATE POLICY "Authenticated users can update upvotes"
  ON buzzwords FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Optional: Allow authenticated users to update their own entries
-- Uncomment if you want users to edit their submissions
-- CREATE POLICY IF NOT EXISTS "Users can update own buzzwords"
--   ON buzzwords FOR UPDATE
--   USING (auth.uid()::text = user_id::text)
--   WITH CHECK (auth.uid()::text = user_id::text);

