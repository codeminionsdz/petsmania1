# 🚀 حل مشكلة إضافة وتعديل العناوين

## ✅ الخطوات المطلوبة

### 1️⃣ تطبيق RLS Policy الجديد

افتح **Supabase Dashboard** → **SQL Editor** وشغّل هذا الكود:

```sql
-- Fix addresses RLS policies
DROP POLICY IF EXISTS "Users can manage own addresses" ON addresses;

CREATE POLICY "Users can manage own addresses" ON addresses 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all addresses" ON addresses;

CREATE POLICY "Admins can manage all addresses" ON addresses 
  FOR ALL 
  USING (is_admin());
```

**انتظر رسالة النجاح** ✅

---

## ✅ الملفات المعدلة

- ✅ `app/api/account/addresses/route.ts` (جديد) - API endpoint للعناوين
- ✅ `app/account/addresses/page.tsx` - تحديث الـ form وإضافة handler
- ✅ `scripts/018-fix-addresses-rls.sql` - الإصلاح الجديد

---

## ✅ الآن يمكنك الاختبار

1. اذهب لـ `/account/addresses`
2. اضغط "Add Address"
3. ملأ جميع الحقول المطلوبة
4. اضغط "Save Address"
5. يجب أن تظهر العنوان الجديد ✅

---

## 🐛 إذا واجهت مشاكل

### المشكلة: الزر لا يعمل
**الحل**: افتح F12 وانظر للـ Console للأخطاء

### المشكلة: "Missing required fields"
**الحل**: تأكد من ملء جميع الحقول المطلوبة (الاسم والهاتف والعنوان والولاية)

### المشكلة: "Unauthorized"
**الحل**: تأكد من أنك مسجل الدخول

