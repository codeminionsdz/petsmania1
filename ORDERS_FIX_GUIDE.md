# حل مشكلة الطلبيات لا تظهر في صفحة My Orders

## المشكلة
الطلبيات مسجلة في قاعدة البيانات (تظهر في dashboard الإدارة) لكن لا تظهر للمستخدم في صفحة "طلباتي".

## السبب الجذري
هناك 3 حالات:

### 1. **الطلبيات التي تم إنشاؤها قبل التسجيل (Guest Orders)**
- عندما يضع المستخدم طلبية **دون تسجيل** → تُحفظ مع `user_id = NULL` و `guest_email`
- عندما يسجل لاحقاً → user_id جديد، لكن الطلبيات القديمة لا تزال بدون user_id
- **الحل**: الآن عند التسجيل، نربط تلقائياً جميع الطلبيات التي لها نفس البريد الإلكتروني

### 2. **الطلبيات المنشأة من Dashboard الإدارة**
- الإدارة قد تنشئ طلبيات للمستخدمين
- يجب التأكد من أن `user_id` صحيح (من auth system)

### 3. **مشاكل في RLS Policy**
- تحقق من أن المستخدم لديه صلاحيات للعرض

## الحل المطبق

### 1️⃣ تحديث صفحة التسجيل
**الملف**: `app/register/page.tsx`

عند التسجيل، نربط جميع الطلبيات السابقة (guest orders) بـ user_id الجديد:
```typescript
// Link any guest orders to the new user account
const { error: updateError } = await supabase
  .from("orders")
  .update({ user_id: data.user.id })
  .ilike("guest_email", formData.email)
  .is("user_id", null)
```

### 2️⃣ تحسين صفحة الطلبيات
**الملف**: `app/account/orders/page.tsx`

- جلب الطلبيات من API موثوق
- عرض تنبيه إذا وجدنا طلبيات ضيف لم تُربط بعد
- إمكانية ربطها يدويًا بزر "Link orders to my account"

### 3️⃣ تحسين API الطلبيات
**الملف**: `app/api/account/orders/route.ts`

- تحسين error handling والـ logging
- إرجاع معلومات أكمل عن order_items

### 4️⃣ إضافة endpoint تشخيص
**الملف**: `app/api/account/orders/debug/route.ts`

للمساعدة في تشخيص المشاكل:
```
GET /api/account/orders/debug
```

يظهر:
- جميع الطلبيات في النظام
- الطلبيات المرتبطة بالمستخدم
- الطلبيات الضيف بنفس البريد

## خطوات الاختبار

### السيناريو 1: تسجيل جديد
1. اذهب إلى `/register`
2. سجل حساباً جديداً
3. اذهب إلى `/account/orders`
4. يجب أن تظهر أي طلبيات سابقة بنفس البريد الإلكتروني

### السيناريو 2: طلبيات موجودة لم تُربط
1. اذهب إلى `/account/orders`
2. إذا رأيت تنبيه أزرق "Found X previous orders as guest"
3. اضغط "Link X orders to my account"
4. ستُحدّث الصفحة وتظهر الطلبيات

### السيناريو 3: التشخيص
1. اذهب إلى `/api/account/orders/debug`
2. ستظهر JSON بجميع معلومات الطلبيات
3. تحقق من:
   - `user_orders_count` - عدد الطلبيات المرتبطة
   - `guest_orders_count` - عدد الطلبيات الضيف بنفس البريد

## الملفات المعدلة

- ✅ `app/register/page.tsx` - إضافة ربط الطلبيات القديمة
- ✅ `app/account/orders/page.tsx` - تحسين العرض والـ linking
- ✅ `app/api/account/orders/route.ts` - تحسين الجلب
- ✅ `app/api/account/orders/debug/route.ts` - endpoint تشخيص جديد

## ملاحظات مهمة

- الـ RLS policies صحيحة ولا تحتاج تعديل
- Demo orders trigger في `scripts/016-create-demo-orders-trigger.sql` (اختياري)
- المستخدمون المسجلون سابقاً يحتاجون لـ link يدوي (زر في صفحة الطلبيات)
