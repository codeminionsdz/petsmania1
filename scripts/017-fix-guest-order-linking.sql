-- ===================================================
-- Fix: Allow users to update their own orders (link guest orders)
-- ===================================================
-- This policy allows users to link guest orders to their account
-- Run this after the existing RLS policy scripts

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can update own orders" ON orders;

-- Create policy allowing users to update their own orders and guest orders
CREATE POLICY "Users can update own orders" ON orders 
  FOR UPDATE 
  USING (auth.uid() = user_id OR user_id IS NULL OR is_admin()) 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR is_admin());

-- Also allow guest orders to be linked (update WHERE user_id IS NULL to set user_id)
CREATE POLICY "Users can link guest orders to own account" ON orders
  FOR UPDATE
  USING (user_id IS NULL)
  WITH CHECK (auth.uid() = user_id);

COMMENT ON POLICY "Users can update own orders" ON orders IS 'Allows users to update their own orders and admins to update any order';
COMMENT ON POLICY "Users can link guest orders to own account" ON orders IS 'Allows users to link guest orders (with no user_id) to their account by setting user_id';
