-- ===================================================
-- CRITICAL: Fix Addresses RLS Policies
-- ===================================================
-- The issue: WITH CHECK clause was missing, preventing UPDATE/INSERT

-- Drop the incomplete policy
DROP POLICY IF EXISTS "Users can manage own addresses" ON addresses;

-- Create the CORRECT comprehensive policy with WITH CHECK
CREATE POLICY "Users can manage own addresses" ON addresses 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Drop and recreate admin policy
DROP POLICY IF EXISTS "Admins can view all addresses" ON addresses;
DROP POLICY IF EXISTS "Admins can manage all addresses" ON addresses;
CREATE POLICY "Admins can manage all addresses" ON addresses 
  FOR ALL 
  USING (is_admin());

-- Verify RLS is enabled
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Test: This query should work if policy is correct
-- SELECT * FROM addresses WHERE user_id = auth.uid();
