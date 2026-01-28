-- ===================================================
-- Fix: Allow admins to view and manage orders and addresses
-- ===================================================

-- ===================================================
-- ORDERS TABLE - Add Admin Policies
-- ===================================================

-- Drop existing admin policies for orders
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;

-- Create single policy for admins to manage all orders (covers all operations)
CREATE POLICY "Admins can manage all orders" ON orders
  FOR ALL
  USING (is_admin());

-- ===================================================
-- ORDER ITEMS TABLE - Add Admin Policies
-- ===================================================

-- Drop existing admin policies for order_items
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
DROP POLICY IF EXISTS "Admins can manage all order items" ON order_items;

-- Create single policy for admins to manage all order items
CREATE POLICY "Admins can manage all order items" ON order_items
  FOR ALL
  USING (is_admin());

-- ===================================================
-- ADDRESSES TABLE - Fix/Add Admin Policies
-- ===================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own addresses" ON addresses;
DROP POLICY IF EXISTS "Admins can view all addresses" ON addresses;
DROP POLICY IF EXISTS "Admins can manage all addresses" ON addresses;

-- Create user policy for their own addresses
CREATE POLICY "Users can manage own addresses" ON addresses
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create admin policy for all addresses
CREATE POLICY "Admins can manage all addresses" ON addresses
  FOR ALL
  USING (is_admin());

-- ===================================================
-- Verify tables have RLS enabled
-- ===================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- ===================================================
-- Display all policies for verification
-- ===================================================
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items', 'addresses')
ORDER BY tablename, policyname;
