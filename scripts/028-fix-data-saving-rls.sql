-- =====================================================
-- FIX: Enable users to save/update profile and address data
-- =====================================================
-- This script fixes RLS policies that were preventing users from saving data

-- =====================================================
-- PROFILES TABLE - Fix INSERT and UPDATE
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON profiles;

-- Users can SELECT their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT 
  USING (auth.uid() = id OR is_admin());

-- Users can INSERT their own profile (during registration)
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Users can UPDATE their own profile
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE 
  USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id);

-- Admins can do everything
CREATE POLICY "Admins can manage profiles" ON profiles FOR ALL 
  USING (is_admin());

-- =====================================================
-- ADDRESSES TABLE - Fix INSERT and UPDATE
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own addresses" ON addresses;
DROP POLICY IF EXISTS "Admins can view all addresses" ON addresses;
DROP POLICY IF EXISTS "Admins can manage all addresses" ON addresses;

-- Users can SELECT, INSERT, UPDATE, DELETE their own addresses
CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY "Admins can manage all addresses" ON addresses FOR ALL 
  USING (is_admin());

-- =====================================================
-- ORDERS TABLE - Fix to allow linking and viewing
-- =====================================================

-- Drop ALL existing policies for orders (clean slate)
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
DROP POLICY IF EXISTS "Create orders" ON orders;
DROP POLICY IF EXISTS "View own and guest orders" ON orders;
DROP POLICY IF EXISTS "Update own and guest orders" ON orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON orders;
DROP POLICY IF EXISTS "Create guest orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;

-- Users can SELECT orders where they are the owner OR where it's a guest order OR if they're admin
CREATE POLICY "View own and guest orders" ON orders FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL OR is_admin());

-- Anyone can CREATE orders (for guest checkout)
CREATE POLICY "Create guest orders" ON orders FOR INSERT 
  WITH CHECK (true);

-- Users can UPDATE their own orders (for linking guest orders)
CREATE POLICY "Update own and guest orders" ON orders FOR UPDATE 
  USING (auth.uid() = user_id OR user_id IS NULL OR is_admin()) 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR is_admin());

-- Admins can delete orders
CREATE POLICY "Admins can delete orders" ON orders FOR DELETE 
  USING (is_admin());

-- =====================================================
-- Verify policies are in place
-- =====================================================
SELECT 
  tablename,
  policyname,
  CASE WHEN qual IS NOT NULL THEN 'USING exists' ELSE 'No USING' END as using_status,
  CASE WHEN with_check IS NOT NULL THEN 'WITH CHECK exists' ELSE 'No WITH CHECK' END as check_status
FROM pg_policies 
WHERE tablename IN ('profiles', 'addresses', 'orders')
ORDER BY tablename, policyname;
