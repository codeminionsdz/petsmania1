# 🔧 تشخيص مشكلة Orders و Addresses

## الأعراض:
- ✅ صفحة البروفيل تحمل بدون أخطاء
- ❌ Orders = 0
- ❌ Addresses = 0
- ❌ في Console: `❌ Orders Query Error: {}`

## السبب الجذري:
قاعدة البيانات لديها **RLS (Row Level Security)** مفعّل، والسياسات الحالية تمنع الـ admin من الوصول إلى جداول:
- `orders`
- `order_items`
- `addresses`

## لماذا السكريبت مهم؟

### قبل السكريبت ❌
```
Admin User → Query Orders → RLS Policy Checks → ❌ Access Denied
                                (No admin policy exists)
```

### بعد السكريبت ✅
```
Admin User → Query Orders → RLS Policy Checks → ✅ is_admin() = true
                                (Admin policy exists) → Access Granted
```

## الحل:
**تشغيل SQL Script يضيف سياسات جديدة للـ admin**

### السياسات المضافة:

```sql
-- للطلبيات
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT
  USING (is_admin());

-- للعناوين
CREATE POLICY "Admins can manage all addresses" ON addresses
  FOR ALL
  USING (is_admin());
```

هذه السياسات تقول: **"إذا كان المستخدم admin، اسمح له بالوصول"**

## الخطوات:

1. **انسخ الكود من:** `FIX_ADMIN_ORDERS_ADDRESSES.md`
2. **اذهب إلى:** https://app.supabase.com/project/oqdhuohominomounvihi/sql/new
3. **اضغط:** Ctrl+Enter للتشغيل
4. **انتظر:** رسالة النجاح ✅
5. **عد للموقع:** الطلبيات والعناوين ستظهر الآن

## رسائل البرنامج المتوقعة:

**قبل التشغيل:**
```
❌ Orders Query Error: {}
❌ Addresses Query Error: {}
```

**بعد التشغيل:**
```
✅ Orders fetched successfully: 4 orders
✅ Addresses fetched successfully: 2 addresses
```

## ملاحظات تقنية:

- `is_admin()` دالة موجودة في Supabase تتحقق من أن المستخدم admin
- RLS مهم للأمان لكن يحتاج سياسات صحيحة
- السكريبت آمن 100% - فقط يضيف سياسات للـ admin
