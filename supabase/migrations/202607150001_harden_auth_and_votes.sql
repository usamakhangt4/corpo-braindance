-- Harden authentication helpers, vote privacy, and buzzword integrity.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_format') THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_username_format
      CHECK (username ~ '^[a-zA-Z0-9_]{3,30}$') NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'buzzwords_phrase_length') THEN
    ALTER TABLE public.buzzwords
      ADD CONSTRAINT buzzwords_phrase_length
      CHECK (char_length(phrase) BETWEEN 1 AND 200) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'buzzwords_meaning_length') THEN
    ALTER TABLE public.buzzwords
      ADD CONSTRAINT buzzwords_meaning_length
      CHECK (char_length(meaning) BETWEEN 1 AND 1000) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'buzzwords_department_value') THEN
    ALTER TABLE public.buzzwords
      ADD CONSTRAINT buzzwords_department_value
      CHECK (department IN ('CEO', 'SALES', 'TECH')) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'buzzwords_synergy_score_range') THEN
    ALTER TABLE public.buzzwords
      ADD CONSTRAINT buzzwords_synergy_score_range
      CHECK (synergy_score BETWEEN 0 AND 100) NOT VALID;
  END IF;
END;
$$;

DROP POLICY IF EXISTS "Authenticated users can update upvotes" ON public.buzzwords;
REVOKE UPDATE ON TABLE public.buzzwords FROM authenticated;

DROP POLICY IF EXISTS "Users can read all votes" ON public.buzzword_votes;
DROP POLICY IF EXISTS "Users can read own votes" ON public.buzzword_votes;
CREATE POLICY "Users can read own votes"
  ON public.buzzword_votes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

REVOKE UPDATE ON TABLE public.buzzword_votes FROM authenticated;
GRANT UPDATE (vote_type, updated_at) ON TABLE public.buzzword_votes TO authenticated;

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

CREATE OR REPLACE FUNCTION public.update_buzzword_upvotes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.buzzword_id IS DISTINCT FROM NEW.buzzword_id THEN
    UPDATE public.buzzwords
    SET upvotes = (
      SELECT COALESCE(SUM(CASE WHEN vote_type = 'upvote' THEN 1 ELSE -1 END), 0)
      FROM public.buzzword_votes
      WHERE buzzword_id = OLD.buzzword_id
    )
    WHERE id = OLD.buzzword_id;
  END IF;

  UPDATE public.buzzwords
  SET upvotes = (
    SELECT COALESCE(SUM(CASE WHEN vote_type = 'upvote' THEN 1 ELSE -1 END), 0)
    FROM public.buzzword_votes
    WHERE buzzword_id = CASE WHEN TG_OP = 'DELETE' THEN OLD.buzzword_id ELSE NEW.buzzword_id END
  )
  WHERE id = CASE WHEN TG_OP = 'DELETE' THEN OLD.buzzword_id ELSE NEW.buzzword_id END;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_buzzword_upvotes_count() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_buzzword_upvotes_count() FROM anon, authenticated;

DROP FUNCTION IF EXISTS public.get_user_vote(BIGINT, UUID);
