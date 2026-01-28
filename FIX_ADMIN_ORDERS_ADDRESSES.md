# ✅ حل مشكلة عدم ظهور الطلبيات والعناوين

## 🚨 المشكلة الحالية
- الطلبيات والعناوين موجودة في قاعدة البيانات لكن لا تظهر (تظهر 0)
- الخطأ: `❌ Orders Query Error: {}` أو `❌ Addresses Query Error: {}`
- السبب: **سياسات RLS تمنع الوصول لأن السكريبت لم يتم تنفيذه بعد**

## ⚡ الحل الفوري (خطوة واحدة):

### تشغيل SQL Script على Supabase

**الخطوة 1:** افتح رابط Supabase SQL Editor:
```
https://app.supabase.com/project/oqdhuohominomounvihi/sql/new
```

**الخطوة 2:** انسخ هذا الكود بالكامل:

```sql
-- Drop ALL admin policies first (clean slate)
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
DROP POLICY IF EXISTS "Admins can manage all order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all addresses" ON addresses;
DROP POLICY IF EXISTS "Admins can manage all addresses" ON addresses;
DROP POLICY IF EXISTS "Users can manage own addresses" ON addresses;

-- Create fresh policies
CREATE POLICY "admin-orders" ON orders FOR ALL USING (is_admin());
CREATE POLICY "admin-order-items" ON order_items FOR ALL USING (is_admin());
CREATE POLICY "user-addresses" ON addresses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admin-addresses" ON addresses FOR ALL USING (is_admin());

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
```

**الخطوة 3:** اضغط `Ctrl + Enter` أو زر **Run**

**الخطوة 4:** انتظر ✅ "Success. No rows returned"

**الخطوة 5:** عد إلى الموقع والصفحة ستعمل الآن! 🎉

## ✅ النتيجة المتوقعة

**في Console (F12):**
```
✅ Orders fetched successfully: 4 orders
✅ Addresses fetched successfully: 2 addresses
```

**في الصفحة:**
- Orders عدد > 0
- Addresses عدد > 0

---

**ملاحظة مهمة:** إذا رأيت نفس الخطأ مرة أخرى، استخدم السكريبت من `scripts/025-comprehensive-admin-rls-fix.sql`

**الخطوة 3:** اضغط `Ctrl + Enter` أو زر **Run** (أعلى اليمين)

**الخطوة 4:** انتظر الرسالة ✅ "Success. No rows returned"

**الخطوة 5:** عد إلى الموقع والصفحة ستعمل الآن! 🎉
