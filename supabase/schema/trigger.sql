-- Fix script for user creation issues
-- Run this if the trigger is causing problems

-- Option 1: Temporarily disable the trigger to test
-- ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- Option 2: Drop and recreate the trigger function with better error handling
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  temp_username TEXT;
BEGIN
  -- Generate a unique temporary username for OAuth users
  temp_username := 'user_' || substr(NEW.id::text, 1, 8) || '_' || extract(epoch from now())::bigint;
  
  -- Try to insert profile, catch any errors
  BEGIN
    INSERT INTO public.profiles (id, username, theme, language, timezone, notification_preferences, display_name, avatar_url)
    VALUES (
      NEW.id, 
      temp_username,
      'dark',
      'en',
      'UTC',
      '{"email": true, "push": false}'::jsonb,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
      COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION
    WHEN others THEN
      -- Log the error but don't fail the user creation
      RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Option 3: If RLS is blocking, temporarily disable it for testing (NOT RECOMMENDED FOR PRODUCTION)
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Option 4: Add a policy that allows the trigger function to insert (if needed)
-- The SECURITY DEFINER should handle this, but if not:
-- DROP POLICY IF EXISTS "Trigger can insert profiles" ON profiles;
-- CREATE POLICY "Trigger can insert profiles"
--   ON profiles FOR INSERT
--   WITH CHECK (true);

