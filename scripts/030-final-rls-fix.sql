-- =====================================================
-- FINAL CLEAN FIX: RLS Policies for Complete System
-- =====================================================
-- هذا السكريبت يحل جميع المشاكل بدون أخطاء
-- Run this one time to fix everything!

BEGIN;

-- =====================================================
-- STEP 1: PROFILES TABLE
-- =====================================================

-- Drop all existing policies on profiles
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

-- Create fresh policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT 
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE 
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage profiles" ON profiles FOR ALL 
  USING (is_admin());

-- =====================================================
-- STEP 2: ADDRESSES TABLE
-- =====================================================

-- Drop all existing policies on addresses
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

-- Create fresh policies
CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all addresses" ON addresses FOR ALL 
  USING (is_admin());

-- =====================================================
-- STEP 3: ORDERS TABLE
-- =====================================================

-- Drop all existing policies on orders
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

-- Create fresh policies
CREATE POLICY "View own and guest orders" ON orders FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL OR is_admin());

CREATE POLICY "Create guest orders" ON orders FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Update own and guest orders" ON orders FOR UPDATE 
  USING (auth.uid() = user_id OR user_id IS NULL OR is_admin()) 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR is_admin());

CREATE POLICY "Admins can delete orders" ON orders FOR DELETE 
  USING (is_admin());

-- =====================================================
-- STEP 4: ORDER ITEMS TABLE
-- =====================================================

-- Drop all existing policies on order_items
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

-- Create fresh policies
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id = auth.uid() OR orders.user_id IS NULL OR is_admin())
  ));

CREATE POLICY "Anyone can create order items" ON order_items FOR INSERT 
  WITH CHECK (true);

-- =====================================================
-- VERIFICATION
-- =====================================================

COMMIT;

-- Show what was applied
SELECT 
  tablename,
  COUNT(*) as policy_count,
  STRING_AGG(policyname, ' | ') as policies
FROM pg_policies 
WHERE tablename IN ('profiles', 'addresses', 'orders', 'order_items')
GROUP BY tablename
ORDER BY tablename;

-- Success message
SELECT '✅ تم تطبيق جميع السياسات بنجاح!' as result;
SELECT '🎉 النظام جاهز للعمل!' as status;
