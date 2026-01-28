-- =====================================================
-- CRITICAL FIX: Make sure RLS policies are correct
-- Run this to ensure guest orders are visible
-- =====================================================

BEGIN;

-- =====================================================
-- CHECK RLS IS ENABLED
-- =====================================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- DROP ALL ORDERS POLICIES (clean slate)
-- =====================================================

DO $$ 
DECLARE 
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'orders'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON orders';
    END LOOP;
END $$;

-- =====================================================
-- CREATE CORRECT ORDERS POLICIES
-- =====================================================

-- 1. SELECT: Users can see their own orders + ALL guest orders
-- This is important! Guest orders must be visible to everyone
CREATE POLICY "Orders: users view own and guest orders" ON orders FOR SELECT 
  USING (
    auth.uid() = user_id          -- Own authenticated orders
    OR user_id IS NULL             -- Guest orders visible to everyone
    OR is_admin()                  -- Admins see everything
  );

-- 2. INSERT: Anyone can create orders (guest checkout)
CREATE POLICY "Orders: anyone can create" ON orders FOR INSERT 
  WITH CHECK (true);

-- 3. UPDATE: Users can update their orders + guest can link their orders
CREATE POLICY "Orders: users update own and guest can link" ON orders FOR UPDATE 
  USING (
    auth.uid() = user_id                                    -- Own orders
    OR (user_id IS NULL AND guest_phone IS NOT NULL)        -- Guest can link by phone
    OR is_admin()
  )
  WITH CHECK (
    auth.uid() = user_id 
    OR (user_id IS NULL AND guest_phone IS NOT NULL)
    OR is_admin()
  );

-- 4. DELETE: Admins only
CREATE POLICY "Orders: admins delete" ON orders FOR DELETE 
  USING (is_admin());

-- =====================================================
-- ORDER ITEMS POLICIES
-- =====================================================

DO $$ 
DECLARE 
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'order_items'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON order_items';
    END LOOP;
END $$;

CREATE POLICY "Order Items: users view items from accessible orders" ON order_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (
        auth.uid() = orders.user_id
        OR orders.user_id IS NULL
        OR is_admin()
      )
    )
  );

CREATE POLICY "Order Items: users insert items into their orders" ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (
        auth.uid() = orders.user_id
        OR (orders.user_id IS NULL AND orders.guest_phone IS NOT NULL)
        OR is_admin()
      )
    )
  );

-- =====================================================
-- ADDRESSES POLICIES
-- =====================================================

DO $$ 
DECLARE 
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'addresses'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON addresses';
    END LOOP;
END $$;

CREATE POLICY "Addresses: users view own" ON addresses FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Addresses: users create own" ON addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id OR is_admin());

CREATE POLICY "Addresses: users update own" ON addresses FOR UPDATE
  USING (auth.uid() = user_id OR is_admin())
  WITH CHECK (auth.uid() = user_id OR is_admin());

CREATE POLICY "Addresses: users delete own" ON addresses FOR DELETE
  USING (auth.uid() = user_id OR is_admin());

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

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

CREATE POLICY "Profiles: users view own" ON profiles FOR SELECT
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "Profiles: users update own" ON profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin())
  WITH CHECK (auth.uid() = id OR is_admin());

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify policies are in place
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('orders', 'order_items', 'addresses', 'profiles')
ORDER BY tablename, policyname;

-- Check guest orders exist
SELECT 
  id,
  guest_phone,
  guest_email,
  user_id,
  status,
  created_at
FROM orders
WHERE user_id IS NULL
ORDER BY created_at DESC
LIMIT 5;

-- Check profiles
SELECT 
  id,
  email,
  phone,
  first_name,
  last_name
FROM profiles
LIMIT 5;
