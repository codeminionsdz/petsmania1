-- Fix RLS policies to allow guest order creation (user_id IS NULL)
-- This script allows the server-side API to create guest orders

-- Note: Service role key bypasses RLS, but we set these policies for safety
-- and to ensure the browser-side code can also read guest orders

-- Drop existing order policies
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage orders" ON orders;

-- View policy: anyone can see guest orders (user_id IS NULL) or own orders
CREATE POLICY "View guest and own orders" ON orders FOR SELECT 
  USING (user_id IS NULL OR auth.uid() = user_id OR is_admin());

-- Insert policy: this applies to authenticated users and API calls
-- For guest orders (user_id IS NULL), the API uses service role so it bypasses RLS anyway
CREATE POLICY "Create orders" ON orders FOR INSERT 
  WITH CHECK (true);

-- Update policy: own orders or guest orders can be updated
CREATE POLICY "Update orders" ON orders FOR UPDATE 
  USING (user_id IS NULL OR auth.uid() = user_id OR is_admin()) 
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id OR is_admin());

-- Delete policy: admins only
CREATE POLICY "Delete orders" ON orders FOR DELETE 
  USING (is_admin());

-- Order Items policies
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Order items can be created with orders" ON order_items;

CREATE POLICY "View accessible order items" ON order_items FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id IS NULL OR orders.user_id = auth.uid() OR is_admin())
  ));

CREATE POLICY "Create order items" ON order_items FOR INSERT 
  WITH CHECK (true);
