-- Fix RLS policies to allow admins to delete products that are in user carts or wishlists

-- Cart Items: Allow admins to manage all cart items
DROP POLICY IF EXISTS "Users can manage own cart" ON cart_items;
CREATE POLICY "Users can manage own cart or admins can manage all" ON cart_items
  FOR ALL
  USING (auth.uid() = user_id OR is_admin());

-- Wishlist Items: Allow admins to manage all wishlist items
DROP POLICY IF EXISTS "Users can manage own wishlist" ON wishlist_items;
CREATE POLICY "Users can manage own wishlist or admins can manage all" ON wishlist_items
  FOR ALL
  USING (auth.uid() = user_id OR is_admin());

-- Order Items: Allow admins to update order items (for SET NULL on product delete)
DROP POLICY IF EXISTS "Order items can be updated by admins" ON order_items;
CREATE POLICY "Order items can be updated by admins" ON order_items FOR UPDATE USING (is_admin());
