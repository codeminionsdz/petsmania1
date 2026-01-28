-- ===================================================
-- Fix: Ensure addresses table RLS policies allow INSERT
-- ===================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Users can manage own addresses" ON addresses;

-- Create comprehensive policy for addresses
-- Allow users to SELECT, INSERT, UPDATE, DELETE their own addresses
CREATE POLICY "Users can manage own addresses" ON addresses 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Also allow admins to manage all addresses
DROP POLICY IF EXISTS "Admins can manage all addresses" ON addresses;
CREATE POLICY "Admins can manage all addresses" ON addresses 
  FOR ALL 
  USING (is_admin());

COMMENT ON POLICY "Users can manage own addresses" ON addresses IS 'Users can create, read, update, and delete their own addresses';
COMMENT ON POLICY "Admins can manage all addresses" ON addresses IS 'Admins can manage all addresses';
