-- ══════════════════════════════════════════════════════════════════════════
-- FIX: "Database error saving new user" on signup
--
-- Root cause: handle_new_user() fires in the auth schema context.
-- Without SET search_path = public, Postgres can't find the profiles table.
-- Also added EXCEPTION handler so auth never hard-fails even if insert fails.
-- ══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user error for %: %', NEW.id, SQLERRM;
  RETURN NEW; -- always return NEW so auth.signUp never fails from this trigger
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Re-attach trigger (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
