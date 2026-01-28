-- =====================================================
-- DIAGNOSTIC SCRIPT - Check why orders don't show
-- =====================================================

-- 1. Check if guest orders exist
SELECT 
  '1. GUEST ORDERS' as check_name,
  COUNT(*) as count,
  MAX(created_at) as latest
FROM orders
WHERE user_id IS NULL;

-- 2. Check if profiles exist
SELECT 
  '2. PROFILES' as check_name,
  COUNT(*) as count,
  email,
  phone
FROM profiles
GROUP BY email, phone
ORDER BY created_at DESC
LIMIT 5;

-- 3. Check if orders have been linked
SELECT 
  '3. USER ORDERS' as check_name,
  COUNT(*) as count,
  user_id
FROM orders
WHERE user_id IS NOT NULL
GROUP BY user_id;

-- 4. Check phone number matching
-- This query helps identify if phone numbers are the problem
SELECT 
  o.id as order_id,
  o.guest_phone,
  o.user_id,
  p.phone as profile_phone,
  o.guest_phone = p.phone as phone_matches,
  o.created_at
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
WHERE o.guest_phone IS NOT NULL
  AND o.guest_phone != ''
ORDER BY o.created_at DESC
LIMIT 10;

-- 5. Check unlinked guest orders with phone numbers
SELECT 
  '5. UNLINKED GUEST ORDERS' as check_name,
  id,
  guest_phone,
  guest_email,
  status,
  created_at
FROM orders
WHERE user_id IS NULL
  AND (guest_phone IS NOT NULL OR guest_email IS NOT NULL)
ORDER BY created_at DESC
LIMIT 10;

-- 6. Check addresses for the user
SELECT 
  '6. USER ADDRESSES' as check_name,
  user_id,
  COUNT(*) as address_count
FROM addresses
GROUP BY user_id
LIMIT 10;

-- 7. Check RLS policies status
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  SUBSTRING(qual, 1, 100) as select_condition,
  SUBSTRING(with_check, 1, 100) as insert_condition
FROM pg_policies
WHERE tablename IN ('orders', 'order_items', 'addresses', 'profiles')
ORDER BY tablename, policyname;

-- 8. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_class
WHERE tablename IN ('orders', 'order_items', 'addresses', 'profiles')
  AND schemaname = 'public';

-- 9. Sample order details
SELECT 
  id,
  guest_phone,
  guest_email,
  user_id,
  status,
  total,
  shipping_address,
  created_at
FROM orders
ORDER BY created_at DESC
LIMIT 5;

-- 10. Check if order_items exist
SELECT 
  '10. ORDER ITEMS COUNT' as check_name,
  COUNT(*) as total_items,
  COUNT(DISTINCT order_id) as orders_with_items
FROM order_items;
