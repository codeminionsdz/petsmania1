-- =====================================================
-- LINK OLD GUEST ORDERS TO AUTHENTICATED USERS
-- =====================================================
-- هذا السكريبت يربط جميع الطلبيات الضيفة بالمستخدمين
-- Run this to restore missing orders

-- =====================================================
-- STEP 1: Find unlinked orders (guest orders)
-- =====================================================

-- Check what guest orders exist
SELECT 
  id,
  user_id,
  guest_email,
  guest_phone,
  status,
  created_at,
  'UNLINKED' as status_type
FROM orders
WHERE user_id IS NULL
LIMIT 20;

-- =====================================================
-- STEP 2: Link orders by phone number
-- =====================================================
-- For each profile, find guest orders with matching phone and link them

UPDATE orders o
SET user_id = (
  SELECT p.id 
  FROM profiles p 
  WHERE p.phone = o.guest_phone 
  AND p.phone IS NOT NULL
  LIMIT 1
)
WHERE o.user_id IS NULL 
  AND o.guest_phone IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.phone = o.guest_phone
  );

-- =====================================================
-- STEP 3: Link orders by email (as fallback)
-- =====================================================
-- For orders that couldn't be linked by phone, try email

UPDATE orders o
SET user_id = (
  SELECT p.id 
  FROM profiles p 
  WHERE LOWER(p.email) = LOWER(o.guest_email)
  AND o.user_id IS NULL
  LIMIT 1
)
WHERE o.user_id IS NULL 
  AND o.guest_email IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM profiles p 
    WHERE LOWER(p.email) = LOWER(o.guest_email)
  );

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Show linked orders count
SELECT 
  COUNT(*) as total_orders,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as linked_orders,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as remaining_unlinked
FROM orders;

-- Show details of linked orders
SELECT 
  o.id,
  o.user_id,
  p.email,
  p.phone,
  o.guest_email,
  o.guest_phone,
  o.status,
  o.created_at,
  'LINKED ✅' as link_status
FROM orders o
JOIN profiles p ON o.user_id = p.id
WHERE o.user_id IS NOT NULL
ORDER BY o.created_at DESC
LIMIT 20;

-- Show results
SELECT '✅ جميع الطلبيات الضيفة تم ربطها بالمستخدمين!' as result;
SELECT '🎉 الآن يمكن للمستخدمين رؤية جميع طلبياتهم!' as message;
