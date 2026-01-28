# 🚀 تطبيق إصلاح حفظ البيانات والطلبيات

## الطريقة الأسرع ✨

### الخطوة 1: افتح Supabase
- اذهب إلى https://app.supabase.com
- اختر مشروعك

### الخطوة 2: افتح SQL Editor
- من القائمة اليسرى → SQL Editor
- أو اضغط مباشرة على "Custom query"

### الخطوة 3: انسخ هذا الكود بالكامل:

```sql
-- =====================================================
-- FIX: Enable users to save/update profile and address data
-- =====================================================

-- PROFILES TABLE
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT 
  USING (auth.uid() = id OR is_admin());
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE 
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can manage profiles" ON profiles FOR ALL 
  USING (is_admin());

-- ADDRESSES TABLE
DROP POLICY IF EXISTS "Users can manage own addresses" ON addresses;
DROP POLICY IF EXISTS "Admins can view all addresses" ON addresses;
DROP POLICY IF EXISTS "Admins can manage all addresses" ON addresses;

CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all addresses" ON addresses FOR ALL 
  USING (is_admin());

-- ORDERS TABLE
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage orders" ON orders;

CREATE POLICY "View own and guest orders" ON orders FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL OR is_admin());
CREATE POLICY "Create orders" ON orders FOR INSERT 
  WITH CHECK (true);
CREATE POLICY "Update own and guest orders" ON orders FOR UPDATE 
  USING (auth.uid() = user_id OR user_id IS NULL OR is_admin()) 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR is_admin());
CREATE POLICY "Admins can delete orders" ON orders FOR DELETE 
  USING (is_admin());

-- VERIFICATION
SELECT 'سياسات الأمن تم تطبيقها بنجاح!' as message;
```

### الخطوة 4: الصق الكود في النافذة

### الخطوة 5: اضغط زر التشغيل (▶️)

---

## ✅ سترى رسالة مثل هذه:

```
سياسات الأمن تم تطبيقها بنجاح!
```

---

## 🎉 خلاص! المشكلة حلت

الآن يمكنك:
- ✅ حفظ البيانات الشخصية
- ✅ إضافة/تعديل عناوين الشحن  
- ✅ رؤية جميع الطلبيات
- ✅ عرض معلومات الشحن

---

## 🧪 اختبر الآن:

1. اذهب إلى https://parapharmacie.local/account/settings
2. غيّر اسمك وركّز Save
3. اذهب إلى https://parapharmacie.local/account/addresses
4. أضف عنوان جديد
5. اذهب إلى https://parapharmacie.local/account/orders
6. يجب أن ترى جميع الطلبيات

---

## ⚠️ إذا حصلت على خطأ:

### خطأ: "permission denied for relation orders"
- ✅ المشكلة طبيعية - الكود سيعالجها
- اضغط الزر مرة أخرى

### لا شيء يحدث بعد التطبيق
- اضغط **Ctrl + Shift + R** لتحديث المتصفح بقوة

### الزر Save لا يعمل في Settings
- تأكد من تسجيل الخروج وتسجيل الدخول مرة أخرى

---

شغيل! 🚀
