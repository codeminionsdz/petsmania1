-- ===================================================
-- COMPREHENSIVE FIX: Admin Access to Orders and Addresses
-- This script handles ALL possible policy conflicts
-- ===================================================

-- Step 1: DROP ALL EXISTING ADMIN POLICIES
-- This ensures no conflicts with old policies

DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;
DROP POLICY IF EXISTS "Admin viewing" ON orders;
DROP POLICY IF EXISTS "admin-all" ON orders;

DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
DROP POLICY IF EXISTS "Admins can manage all order items" ON order_items;
DROP POLICY IF EXISTS "Admin viewing" ON order_items;
DROP POLICY IF EXISTS "admin-all" ON order_items;

DROP POLICY IF EXISTS "Admins can view all addresses" ON addresses;
DROP POLICY IF EXISTS "Admins can manage all addresses" ON addresses;
DROP POLICY IF EXISTS "Admins can manage own addresses" ON addresses;
DROP POLICY IF EXISTS "Admin viewing" ON addresses;
DROP POLICY IF EXISTS "admin-all" ON addresses;

-- Step 2: CREATE CLEAN POLICIES

-- ORDERS: Simple policy for admin to do everything
CREATE POLICY "admin-orders" ON orders
  FOR ALL
  USING (is_admin());

-- ORDER ITEMS: Simple policy for admin to do everything
CREATE POLICY "admin-order-items" ON order_items
  FOR ALL
  USING (is_admin());

-- ADDRESSES: Users can manage their own
CREATE POLICY "user-addresses" ON addresses
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ADDRESSES: Admins can manage all
CREATE POLICY "admin-addresses" ON addresses
  FOR ALL
  USING (is_admin());

-- Step 3: Enable RLS (important!)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Step 4: VERIFY - Show all current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  CASE WHEN qual IS NOT NULL THEN qual ELSE 'N/A' END as using_clause
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items', 'addresses')
ORDER BY tablename, policyname;
