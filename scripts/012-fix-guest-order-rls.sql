-- Fix RLS policies to allow viewing guest orders (where user_id IS NULL)

-- Orders: Users can see own orders, admins can see all, anyone can see guest orders
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL OR is_admin());

-- Allow users to update their own orders (for linking guest orders)
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
CREATE POLICY "Users can update own orders" ON orders FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL OR is_admin()) 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR is_admin());

-- Order Items: Users can see own order items, admins can see all, anyone can see order items for guest orders
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR orders.user_id IS NULL OR is_admin())));
