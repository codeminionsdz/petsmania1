-- =====================================================
-- ULTIMATE FIX: Complete RLS Reset for Admin Access
-- Use this if all other scripts fail
-- =====================================================

-- =====================================================
-- STEP 1: DISABLE RLS TEMPORARILY (for cleanup)
-- =====================================================
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE addresses DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: DROP ALL POLICIES (clean slate)
-- =====================================================
DO $$ 
DECLARE 
    policy_record RECORD;
BEGIN
    -- Drop all policies on orders
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'orders'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON orders';
    END LOOP;
    
    -- Drop all policies on order_items
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'order_items'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON order_items';
    END LOOP;
    
    -- Drop all policies on addresses
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'addresses'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON addresses';
    END LOOP;
END $$;

-- =====================================================
-- STEP 3: RE-ENABLE RLS
-- =====================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: CREATE FRESH POLICIES - ORDERS
-- =====================================================
-- Admin can view own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admin can do everything
CREATE POLICY "Admins can manage all orders" ON orders
  FOR ALL
  USING (is_admin());

-- =====================================================
-- STEP 5: CREATE FRESH POLICIES - ORDER ITEMS
-- =====================================================
-- Admin can do everything
CREATE POLICY "Admins can manage all order items" ON order_items
  FOR ALL
  USING (is_admin());

-- =====================================================
-- STEP 6: CREATE FRESH POLICIES - ADDRESSES
-- =====================================================
-- Users can manage their own addresses
CREATE POLICY "Users can manage own addresses" ON addresses
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY "Admins can manage all addresses" ON addresses
  FOR ALL
  USING (is_admin());

-- =====================================================
-- STEP 7: VERIFY
-- =====================================================
SELECT 
  tablename,
  policyname,
  CASE WHEN qual IS NOT NULL THEN 'USING clause exists' ELSE 'No USING clause' END as status
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items', 'addresses')
ORDER BY tablename, policyname;
