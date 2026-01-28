-- ===================================================
-- Fix: Allow admins to view all customer profiles
-- ===================================================

-- Drop existing policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- Create RLS policy for users to view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Create RLS policy for users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create RLS policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT
  USING (is_admin());

-- Create RLS policy for admins to update all profiles
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR UPDATE
  USING (is_admin());

-- Verify the policies
SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename = 'profiles';
