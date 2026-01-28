-- UPDATE RLS POLICIES TO ALLOW GUEST ORDER ACCESS
-- Run this in Supabase SQL Editor

-- First, let's verify current policies
-- SELECT * FROM pg_policies WHERE tablename = 'orders';

-- Drop and recreate the order viewing policy to allow guest access
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders 
  FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR user_id IS NULL 
    OR is_admin()
  );

-- Drop and recreate the order items policy to allow guest access
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items" ON order_items 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (
        orders.user_id = auth.uid() 
        OR orders.user_id IS NULL 
        OR is_admin()
      )
    )
  );

-- Note: These policies now allow anyone to view orders where user_id IS NULL (guest orders)
-- This is intentional to allow guests to track their orders using their order ID
