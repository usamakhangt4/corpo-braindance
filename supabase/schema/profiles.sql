-- Profiles Table Schema
-- Run this in Supabase SQL Editor to create the profiles table

-- Create the profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL CHECK (username ~ '^[a-zA-Z0-9_]{3,30}$'),
  
  -- Profile Information
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  
  -- Preferences
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  
  -- Notifications (stored as JSONB for flexibility)
  notification_preferences JSONB DEFAULT '{"email": true, "push": false}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles(display_name);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Drop existing policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Anyone can read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Users can read all profiles (for username display)
CREATE POLICY "Anyone can read profiles"
  ON profiles FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  profile_username TEXT;
BEGIN
  profile_username := NEW.raw_user_meta_data->>'username';

  IF profile_username IS NULL OR profile_username !~ '^[a-zA-Z0-9_]{3,30}$' THEN
    profile_username := 'user_' || substr(NEW.id::text, 1, 8) || '_' || extract(epoch from now())::bigint;
  END IF;
  
  INSERT INTO public.profiles (id, username, theme, language, timezone, notification_preferences, display_name, avatar_url)
  VALUES (
    NEW.id, 
    profile_username,
    'dark',
    'en',
    'UTC',
    '{"email": true, "push": false}'::jsonb,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check if username exists
CREATE OR REPLACE FUNCTION public.username_exists(check_username TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE username = check_username
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.username_exists(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.username_exists(TEXT) TO anon, authenticated;

-- Function to get email by username (for username-based signin)
CREATE OR REPLACE FUNCTION public.get_email_by_username(check_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT au.email INTO user_email
  FROM public.profiles p
  JOIN auth.users au ON p.id = au.id
  WHERE p.username = check_username;
  
  RETURN user_email;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_email_by_username(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_email_by_username(TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_email_by_username(TEXT) TO service_role;

