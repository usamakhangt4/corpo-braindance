-- Idempotent repair script for the auth.users profile trigger.
-- Prefer running the versioned migration in supabase/migrations on existing projects.

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

  INSERT INTO public.profiles (
    id,
    username,
    theme,
    language,
    timezone,
    notification_preferences,
    display_name,
    avatar_url
  )
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
