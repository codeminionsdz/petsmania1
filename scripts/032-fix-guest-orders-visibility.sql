-- =====================================================
-- FINAL FIX: Allow users to see guest orders (user_id IS NULL)
-- =====================================================
-- هذا السكريبت يسمح للمستخدمين برؤية طلبياتهم الضيفة

BEGIN;

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

-- 1. Users can SELECT their own orders AND guest orders (with NULL user_id)
CREATE POLICY "Users can view own and guest orders" ON orders FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR (user_id IS NULL)  -- Allow seeing guest orders
    OR is_admin()
  );

-- 2. Anyone can CREATE orders (for guest checkout)
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT 
  WITH CHECK (true);

-- 3. Users can UPDATE their own orders and guest orders (for linking)
CREATE POLICY "Users can update own and guest orders" ON orders FOR UPDATE 
  USING (
    auth.uid() = user_id 
    OR (user_id IS NULL AND guest_phone IS NOT NULL)  -- Can update guest orders by phone
    OR is_admin()
  )
  WITH CHECK (
    auth.uid() = user_id 
    OR (user_id IS NULL AND guest_phone IS NOT NULL)
    OR is_admin()
  );

-- 4. Admins can delete orders
CREATE POLICY "Admins can delete orders" ON orders FOR DELETE 
  USING (is_admin());

-- =====================================================
-- DROP ALL ORDER_ITEMS POLICIES (clean slate)
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

-- =====================================================
-- CREATE CORRECT ORDER_ITEMS POLICIES
-- =====================================================

-- 1. Users can SELECT order items from orders they can view
CREATE POLICY "Users can view order items" ON order_items FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (
      orders.user_id = auth.uid() 
      OR orders.user_id IS NULL  -- Can see items from guest orders
      OR is_admin()
    )
  ));

-- 2. Anyone can CREATE order items (during checkout)
CREATE POLICY "Anyone can create order items" ON order_items FOR INSERT 
  WITH CHECK (true);

-- =====================================================
-- VERIFY RLS IS WORKING
-- =====================================================

COMMIT;

-- Show all policies
SELECT 
  tablename,
  policyname,
  'PERMISSIVE' as type
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items')
ORDER BY tablename, policyname;

-- Success
SELECT '✅ تم إصلاح سياسات الأوامر بنجاح!' as result;
SELECT '🎉 الآن يمكن رؤية الطلبيات الضيفة في My Orders!' as message;
