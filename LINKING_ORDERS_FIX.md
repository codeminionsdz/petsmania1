# خطوات إصلاح مشكلة الطلبيات وتفعيل الربط

## 1️⃣ تطبيق RLS Policies الجديدة

يجب تشغيل أحد الـ SQL scripts التالية في قاعدة البيانات:

### Option A: تحديث الـ policies القديمة
قم بتشغيل أحد هذه الملفات:
- `scripts/002-rls-policies.sql` (تم تحديثه)
- أو `scripts/012-fix-guest-order-rls.sql` (تم تحديثه)

### Option B: تطبيق الإصلاح الجديد
قم بتشغيل:
- `scripts/017-fix-guest-order-linking.sql` (جديد)

**الأمر المستخدم في Supabase SQL Editor:**
```sql
-- تطبيق الـ policies الجديدة للسماح بربط الطلبيات
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
CREATE POLICY "Users can update own orders" ON orders 
  FOR UPDATE 
  USING (auth.uid() = user_id OR user_id IS NULL OR is_admin()) 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR is_admin());

CREATE POLICY "Users can link guest orders to own account" ON orders
  FOR UPDATE
  USING (user_id IS NULL)
  WITH CHECK (auth.uid() = user_id);
```

## 2️⃣ الملفات المعدلة

- ✅ `app/api/account/orders/link/route.ts` (جديد) - API endpoint للربط
- ✅ `app/account/orders/page.tsx` - تحسين الواجهة وإضافة حالات التحميل
- ✅ `scripts/002-rls-policies.sql` - إضافة UPDATE policy
- ✅ `scripts/012-fix-guest-order-rls.sql` - إضافة UPDATE policy
- ✅ `scripts/017-fix-guest-order-linking.sql` - الإصلاح الجديد

## 3️⃣ كيف يعمل الآن

### للمستخدمين الجدد:
1. يضعون طلبية كضيف (guest)
2. ينسجلون لاحقاً
3. **تُربط الطلبيات تلقائياً عند التسجيل**

### للمستخدمين الموجودين:
1. يذهبون لصفحة "طلباتي" (`/account/orders`)
2. يرون رسالة: "Found X previous orders as guest"
3. يضغطون على "Link X orders to my account"
4. ✅ تظهر الطلبيات فوراً

## 4️⃣ ملاحظات تقنية

**الـ API Endpoint:**
- URL: `POST /api/account/orders/link`
- يستخدم Admin Client لضمان عمل التحديث
- يتحقق من تسجيل المستخدم
- يحدّث فقط الطلبيات بـ `user_id = NULL`

**الـ RLS Policy:**
```sql
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL OR is_admin()) 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR is_admin())
```
- السماح للمستخدم بتحديث طلباته الخاصة
- السماح بتحديث الطلبيات بدون user_id (guest orders)
- السماح للـ admins بتحديث أي طلبية

## 5️⃣ الاختبار

### سيناريو 1: ربط يدوي
1. سجل حسابًا جديدًا أو قم بـ logout ثم login
2. اذهب لـ `/account/orders`
3. إذا كانت هناك طلبيات ضيف، سترى التنبيه
4. اضغط الزر → يجب أن تظهر رسالة النجاح ✅

### سيناريو 2: ربط تلقائي
1. ضع طلبية كضيف
2. سجل حسابًا جديدًا بنفس البريد الإلكتروني
3. اذهب لـ `/account/orders`
4. الطلبيات تظهر مباشرة (بدون تنبيه) ✅

### سيناريو 3: التشخيص
اذهب لـ `/api/account/orders/debug` لرؤية:
- جميع الطلبيات في النظام
- الطلبيات المرتبطة بالمستخدم
- الطلبيات الضيف بنفس البريد

## 6️⃣ troubleshooting

### المشكلة: الزر لا يعمل
- ✅ **الحل**: تأكد من تطبيق SQL policies الجديدة

### المشكلة: لا توجد رسالة "Found X previous orders"
- هذا يعني أن جميع الطلبيات مرتبطة بالفعل ✅

### المشكلة: رسالة خطأ "Failed to link orders"
1. افتح F12 وانظر إلى Console
2. شاهد الـ error message
3. تحقق من أن الـ user_id موجود وصحيح

