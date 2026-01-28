# ✅ حل مشكلة تعديل العناوين

## 🎯 المشكلة:
زر "Edit" لا يعمل - لا يمكن تعديل العناوين الموجودة

## ✅ الحل المطبق:

### 1️⃣ تطبيق RLS Policy
شغّل هذا الكود في Supabase SQL Editor:

```sql
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

**انتظر ✅**

---

## 📝 الملفات المعدلة:

- ✅ `app/account/addresses/page.tsx` - إضافة دوال التعديل
- ✅ `app/api/account/addresses/[id]/route.ts` (جديد) - API للتحديث والحذف

---

## ✅ الميزات الجديدة:

### تعديل العنوان:
1. اضغط زر "Edit" على أي عنوان
2. عدّل البيانات المطلوبة
3. اضغط "Update Address"
4. ✅ تم التحديث

### حذف العنوان:
1. اضغط زر "Delete" على أي عنوان
2. اضغط "OK" للتأكيد
3. ✅ تم الحذف

---

## 🧪 اختبر الآن:

1. اذهب لـ `/account/addresses`
2. اضغط "Edit" على أي عنوان
3. عدّل البيانات واضغط "Update Address"
4. ✅ يجب أن يتحدث العنوان

