-- Add INSERT policy for profiles to allow users to create their own profiles
-- This is required for profile creation during registration to work

DO $$
DECLARE 
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'profiles'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON profiles';
    END LOOP;
END $$;

-- Allow users to view their own profile
CREATE POLICY "Profiles: users view own" ON profiles FOR SELECT
  USING (auth.uid() = id OR is_admin());

-- Allow users to insert their own profile
CREATE POLICY "Profiles: users insert own" ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR is_admin());

-- Allow users to update their own profile
CREATE POLICY "Profiles: users update own" ON profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin())
  WITH CHECK (auth.uid() = id OR is_admin());

-- Allow admins to manage all profiles
CREATE POLICY "Profiles: admins manage all" ON profiles FOR ALL
  USING (is_admin());

COMMIT;
