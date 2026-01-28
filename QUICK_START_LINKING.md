# 🚀 خطوات التفعيل السريعة

## ✅ الخطوة الوحيدة المطلوبة

### تطبيق RLS Policy الجديد

افتح **Supabase Dashboard** → **SQL Editor** وشغّل هذا الكود:

```sql
-- Enable UPDATE policy for orders table
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
CREATE POLICY "Users can update own orders" ON orders 
  FOR UPDATE 
  USING (auth.uid() = user_id OR user_id IS NULL OR is_admin()) 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR is_admin());
```

**انتظر رسالة النجاح** ✅

---

## ✅ الآن يمكنك الاختبار

### اختبر الربط اليدوي:
1. تأكد من أن لديك حساب مسجل
2. اذهب لـ `/account/orders`
3. إذا رأيت "Found X previous orders as guest"
4. اضغط الزر "Link X orders to my account"
5. يجب أن تظهر الطلبيات ✅

### اختبر الربط التلقائي:
1. اذهب لـ `/checkout` وضع طلبية **كضيف** (بدون تسجيل)
2. سجل حسابًا جديدًا **بنفس البريد الإلكتروني**
3. اذهب لـ `/account/orders`
4. الطلبيات تظهر مباشرة ✅

---

## 📝 ملفات تم تعديلها

- `app/api/account/orders/link/route.ts` ← جديد
- `app/account/orders/page.tsx` ← محدّث
- `app/register/page.tsx` ← محدّث
- `scripts/002-rls-policies.sql` ← محدّث
- `scripts/012-fix-guest-order-rls.sql` ← محدّث

---

## 🐛 إذا واجهت مشاكل

### المشكلة: الزر لا يعمل بعد التحديث
**الحل**: اذهب لـ `/api/account/orders/debug` لرؤية التفاصيل

### المشكلة: "Failed to link orders"
**الحل**: افتح F12 وانظر للـ Console للتفاصيل

### المشكلة: الطلبيات لا تزال لا تظهر
**الحل**: شغّل SQL policy مرة أخرى تأكد من النجاح

---

**هذا كل شيء! 🎉**
