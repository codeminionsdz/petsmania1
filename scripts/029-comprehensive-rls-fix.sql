-- =====================================================
-- COMPREHENSIVE FIX: RLS Policies for Data Saving & Linking
-- =====================================================
-- Run this script once to fix all data saving issues
-- This enables: Profiles, Addresses, Orders, and auto-linking

-- =====================================================
-- PROFILES TABLE - Enable INSERT, UPDATE, SELECT
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT 
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE 
  USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage profiles" ON profiles FOR ALL 
  USING (is_admin());

-- =====================================================
-- ADDRESSES TABLE - Enable INSERT, UPDATE, SELECT, DELETE
-- =====================================================

DROP POLICY IF EXISTS "Users can manage own addresses" ON addresses;
DROP POLICY IF EXISTS "Admins can view all addresses" ON addresses;
DROP POLICY IF EXISTS "Admins can manage all addresses" ON addresses;

CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all addresses" ON addresses FOR ALL 
  USING (is_admin());

-- =====================================================
-- ORDERS TABLE - Enable linking and viewing
-- =====================================================

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
DROP POLICY IF EXISTS "Create orders" ON orders;
DROP POLICY IF EXISTS "View own and guest orders" ON orders;
DROP POLICY IF EXISTS "Update own and guest orders" ON orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON orders;
DROP POLICY IF EXISTS "Create guest orders" ON orders;

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
-- ORDER ITEMS TABLE - Enable viewing
-- =====================================================

DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Order items can be created with orders" ON order_items;

CREATE POLICY "Users can view own order items" ON order_items FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id = auth.uid() OR orders.user_id IS NULL OR is_admin())
  ));

CREATE POLICY "Order items can be created with orders" ON order_items FOR INSERT 
  WITH CHECK (true);

-- =====================================================
-- Verification - Show what was applied
-- =====================================================

SELECT 
  tablename,
  COUNT(*) as policy_count,
  STRING_AGG(policyname, ', ') as policies
FROM pg_policies 
WHERE tablename IN ('profiles', 'addresses', 'orders', 'order_items')
GROUP BY tablename
ORDER BY tablename;

-- Final message
SELECT '✅ جميع السياسات تم تطبيقها بنجاح!' as result;
SELECT '🎉 يمكنك الآن:' as info;
SELECT '1. ✅ حفظ بيانات الحساب' as step1;
SELECT '2. ✅ إضافة عناوين شحن' as step2;
SELECT '3. ✅ ربط الطلبيات القديمة' as step3;
SELECT '4. ✅ عرض جميع الطلبيات' as step4;
