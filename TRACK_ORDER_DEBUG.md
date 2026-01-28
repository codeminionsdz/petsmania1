# خطوات الاختبار لتتبع الطلبية

## 1. تحضير البيانات
استخدم SQL script لإضافة طلبية اختبار:
- الملف: `scripts/014-test-guest-order.sql`
- البريد: `test@example.com`

## 2. الخطوات:
1. اذهب إلى صفحة Checkout
2. ملأ النموذج ببريد إلكتروني تجريبي: `test@example.com`
3. أكمل الطلب
4. ستظهر صفحة النجاح
5. انقر على "Track Order"
6. يجب أن ترى الطلبيات

## 3. تصحيح الأخطاء:
افتح Console (F12) وتحقق من الـ logs:
- "Fetching orders with email: ..." - البريد الذي يتم البحث عنه
- "Fetching from URL: ..." - الـ URL الكامل
- "Guest orders found: ..." - عدد الطلبيات المعثور عليها

## 4. الملفات المعدلة:
- `app/api/account/orders/route.ts` - استخدام admin client + ilike
- `app/checkout/page.tsx` - استخراج البريد من FormData
- `app/checkout/success/page.tsx` - تمرير البريد مع encodeURIComponent
- `app/account/orders/page.tsx` - معالجة البريد من URL + logging
- `proxy.ts` - السماح بالوصول للضيوف
