-- Buzzword Votes Table Schema
-- Run this in Supabase SQL Editor to create the votes tracking table

-- Create the buzzword_votes table to track user votes
CREATE TABLE IF NOT EXISTS buzzword_votes (
  id BIGSERIAL PRIMARY KEY,
  buzzword_id BIGINT NOT NULL REFERENCES buzzwords(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- Ensure one vote per user per buzzword
  UNIQUE(buzzword_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_buzzword_votes_buzzword_id ON buzzword_votes(buzzword_id);
CREATE INDEX IF NOT EXISTS idx_buzzword_votes_user_id ON buzzword_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_buzzword_votes_buzzword_user ON buzzword_votes(buzzword_id, user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE buzzword_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Drop existing policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Users can read all votes" ON buzzword_votes;
DROP POLICY IF EXISTS "Users can insert own votes" ON buzzword_votes;
DROP POLICY IF EXISTS "Users can update own votes" ON buzzword_votes;
DROP POLICY IF EXISTS "Users can delete own votes" ON buzzword_votes;

-- Allow anyone to read votes (needed to show vote counts)
CREATE POLICY "Users can read all votes"
  ON buzzword_votes FOR SELECT
  USING (true);

-- Allow authenticated users to insert their own votes
CREATE POLICY "Users can insert own votes"
  ON buzzword_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own votes
CREATE POLICY "Users can update own votes"
  ON buzzword_votes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own votes
CREATE POLICY "Users can delete own votes"
  ON buzzword_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update buzzword upvotes count based on votes
-- This function calculates the actual upvotes count from the votes table
CREATE OR REPLACE FUNCTION update_buzzword_upvotes_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate upvotes count for the affected buzzword
  UPDATE buzzwords
  SET upvotes = (
    SELECT COALESCE(SUM(CASE WHEN vote_type = 'upvote' THEN 1 ELSE -1 END), 0)
    FROM buzzword_votes
    WHERE buzzword_id = COALESCE(NEW.buzzword_id, OLD.buzzword_id)
  )
  WHERE id = COALESCE(NEW.buzzword_id, OLD.buzzword_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update upvotes count when votes change
DROP TRIGGER IF EXISTS trigger_update_buzzword_upvotes ON buzzword_votes;
CREATE TRIGGER trigger_update_buzzword_upvotes
  AFTER INSERT OR UPDATE OR DELETE ON buzzword_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_buzzword_upvotes_count();

-- Function to get user vote for a buzzword
CREATE OR REPLACE FUNCTION get_user_vote(p_buzzword_id BIGINT, p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_vote_type TEXT;
BEGIN
  SELECT vote_type INTO v_vote_type
  FROM buzzword_votes
  WHERE buzzword_id = p_buzzword_id AND user_id = p_user_id;
  
  RETURN v_vote_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

