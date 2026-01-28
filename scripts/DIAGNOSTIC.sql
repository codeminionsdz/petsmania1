-- =====================================================
-- DIAGNOSTIC SCRIPT - Debug RLS Issues
-- Run this to identify exactly what's wrong
-- =====================================================

-- =====================================================
-- SECTION 1: Check Policies Exist
-- =====================================================
SELECT 'SECTION 1: Policies Status' as section;

SELECT 
  tablename,
  policyname,
  permissive,
  qual as "USING Clause",
  CASE WHEN qual IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items', 'addresses')
ORDER BY tablename, policyname;

-- =====================================================
-- SECTION 2: Check is_admin() Function
-- =====================================================
SELECT 'SECTION 2: is_admin() Function' as section;

-- Check if function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'is_admin' 
AND routine_schema = 'public';

-- Try calling it
SELECT 'is_admin() result:' as test, is_admin() as result;

-- =====================================================
-- SECTION 3: Check Your User
-- =====================================================
SELECT 'SECTION 3: Current User Info' as section;

SELECT 
  'Current User ID:' as info, 
  auth.uid()::text as value

UNION ALL

SELECT 
  'Your Role:' as info,
  COALESCE(role, 'NOT FOUND') as value
FROM profiles 
WHERE id = auth.uid();

-- =====================================================
-- SECTION 4: Check RLS is Actually Enabled
-- =====================================================
SELECT 'SECTION 4: RLS Enabled Status' as section;

SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('orders', 'order_items', 'addresses')
AND schemaname = 'public'
ORDER BY tablename;

-- =====================================================
-- SECTION 5: Count Data (Should see results)
-- =====================================================
SELECT 'SECTION 5: Data Available' as section;

SELECT 'Orders:' as table_name, COUNT(*)::text as count FROM orders
UNION ALL
SELECT 'Addresses:', COUNT(*)::text FROM addresses
UNION ALL
SELECT 'Order Items:', COUNT(*)::text FROM order_items;

-- =====================================================
-- SECTION 6: Try These Queries (Admin Perspective)
-- =====================================================
SELECT 'SECTION 6: Admin Access Test' as section;

-- Should work if admin access works:
SELECT 'All Orders (no WHERE):' as query, COUNT(*)::text as result FROM orders
UNION ALL
SELECT 'All Addresses (no WHERE):', COUNT(*)::text FROM addresses;

-- Should work with is_admin() check:
SELECT 'Orders WHERE is_admin:' as query, COUNT(*)::text as result 
FROM orders 
WHERE is_admin() = true
UNION ALL
SELECT 'Addresses WHERE is_admin:', COUNT(*)::text 
FROM addresses 
WHERE is_admin() = true;

-- =====================================================
-- SECTION 7: Policy Details
-- =====================================================
SELECT 'SECTION 7: Full Policy Definitions' as section;

-- Get the full policy SQL
SELECT 
  schemaname,
  tablename,
  policyname,
  qual as "USING Condition",
  with_check as "WITH CHECK Condition"
FROM pg_policies
WHERE tablename IN ('orders', 'addresses')
ORDER BY tablename, policyname;

-- =====================================================
-- HOW TO READ RESULTS:
-- =====================================================
-- ✅ Good if you see:
-- - 5 policies total (2 orders, 3 addresses)
-- - is_admin() function exists
-- - Your role = 'admin'
-- - RLS enabled = true
-- - Data counts > 0
-- - Policies have USING clause populated

-- ❌ Bad if you see:
-- - No policies OR less than 5
-- - is_admin() not found
-- - Your role = NULL or 'user'
-- - RLS enabled = false
-- - Data counts = 0
-- - USING clause is empty/NULL
