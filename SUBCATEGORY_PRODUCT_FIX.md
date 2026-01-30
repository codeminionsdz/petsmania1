# صياغة الحل - منتجات الفئات الفرعية (Subcategories)

## المشكلة
عند إنشاء منتج واختيار فئة فرعية (subcategory)، المنتج لا يظهر في صفحة الفئة الفرعية. بدلاً من ذلك، يظهر "0 منتجات".

## الأسباب
تم تحديد سببين رئيسيين:

### السبب 1: فلتر البحث في `getProductsByCategory()`
الدالة `getProductsByCategory()` في `lib/data.ts` كانت تبحث فقط عن `category_id`:
```typescript
.in("category_id", categoryIds)  // ❌ لا تبحث عن subcategory_id
```

**الحل:** تم تعديل الاستعلام ليبحث عن المنتجات حيث:
- `category_id` يطابق أي من معرفات الفئات المطلوبة، **أو**
- `subcategory_id` يطابق أي من معرفات الفئات المطلوبة (في حالة المنتجات المخصصة للفئات الفرعية)

```typescript
// الصيغة الجديدة:
const categoryFilter = categoryIds.map((id) => `category_id.eq.${id}`).join(",")
const subcategoryFilter = categoryIds.map((id) => `subcategory_id.eq.${id}`).join(",")
const combinedFilter = `${categoryFilter},${subcategoryFilter}`
query = query.or(combinedFilter)
```

### السبب 2: عداد المنتجات (Product Count) لا يتحدث للفئات الفرعية
في قاعدة البيانات، هناك عمود `product_count` في جدول `categories` يتم تحديثه تلقائياً بواسطة trigger.

الـ trigger القديم `update_category_product_count()` كان يتعامل فقط مع `category_id`:
```sql
-- ❌ القديم
UPDATE categories SET product_count = product_count + 1 WHERE id = NEW.category_id;
```

عندما ينشئ المستخدم منتج مع `subcategory_id`، الـ trigger **لم يقم** بتحديث `product_count` للفئة الفرعية.

**الحل:** تم تحديث الـ trigger ليعالج كلا الحالتين:
```sql
-- ✅ الجديد
IF NEW.category_id IS NOT NULL THEN
  UPDATE categories SET product_count = product_count + 1 WHERE id = NEW.category_id;
END IF;
IF NEW.subcategory_id IS NOT NULL THEN
  UPDATE categories SET product_count = product_count + 1 WHERE id = NEW.subcategory_id;
END IF;
```

## الملفات المعدلة

### 1. `scripts/001-create-schema.sql`
تم تحديث دالة `update_category_product_count()` لمعالجة:
- INSERT: إضافة 1 لكل من `category_id` و `subcategory_id`
- DELETE: طرح 1 من كل منهما
- UPDATE: التعامل مع التغييرات في كلا الحقلين

### 2. `lib/data.ts` - دالة `getProductsByCategory()`
- إضافة logging للتتبع
- تغيير فلتر البحث من `.in()` إلى `.or()` للبحث عن `category_id` أو `subcategory_id`

### 3. `app/admin/products/new/page.tsx`
- إضافة logging عند إرسال البيانات للـ API
- إضافة logging عند استجابة الـ API

### 4. `app/categories/[slug]/page.tsx`
- إضافة logging عند تحميل الفئة والمنتجات

### 5. `scripts/035-fix-subcategory-product-count.sql` (جديد)
Migration script لتطبيق:
- تحديث الـ trigger الجديد
- إعادة حساب `product_count` لجميع الفئات بناءً على المنتجات الفعلية

## كيفية التطبيق

### الخطوة 1: تطبيق الـ Migration
1. اذهب إلى Supabase Dashboard
2. افتح SQL Editor
3. انسخ محتوى `scripts/035-fix-subcategory-product-count.sql`
4. نفذ الـ Query

**أو**:
```bash
# استخدم supabase CLI
supabase db push
```

### الخطوة 2: التحقق
بعد تطبيق الـ Migration:
1. أنشئ منتج جديد
2. اختر: حيوان → فئة → فئة فرعية
3. انتقل إلى صفحة الفئة الفرعية
4. يجب أن يظهر المنتج الجديد
5. يجب أن يظهر العدد الصحيح من المنتجات

## الآثار الجانبية
لا توجد آثار جانبية معروفة. التغييرات:
- ✅ متوافقة مع المنتجات الموجودة
- ✅ تحافظ على عداد المنتجات للفئات الرئيسية
- ✅ تدعم المنتجات بدون `subcategory_id`
- ✅ تدعم الفئات بدون منتجات

## التحقق من الـ Logs
عند إنشاء منتج جديد، يمكنك التحقق من:

1. **في المتصفح (Console)**:
```
[NewProductPage] Full product data to be sent: {animalId, categoryId, subcategoryId, brandId, ...}
[NewProductPage] API response status: 201
[NewProductPage] Product created successfully: {...}
```

2. **في صفحة الفئة (Server logs)**:
```
[CategoryPage] Loading category with slug: griffoirs
[CategoryPage] Category loaded: {id: 'xxx', name: 'Griffoirs', parentId: 'yyy'}
[getProductsByCategory] Category found: {id: 'xxx', parent_id: 'yyy'}
[getProductsByCategory] Query returned: {count: 1, dataLength: 1}
```

## الاختبار الكامل
1. ✅ أنشئ منتج مع فئة رئيسية فقط (بدون فئة فرعية)
2. ✅ أنشئ منتج مع فئة رئيسية + فئة فرعية
3. ✅ تحقق من ظهور المنتجات في كلا النوعين
4. ✅ تحقق من عداد المنتجات الصحيح

## الملفات ذات الصلة
- `scripts/001-create-schema.sql` - تعريف الـ triggers
- `lib/data.ts` - دوال جلب المنتجات
- `lib/types.ts` - أنواع البيانات (Product, Category)
- `app/api/admin/products/route.ts` - API endpoint لإنشاء المنتجات
- `app/categories/[slug]/page.tsx` - صفحة عرض الفئة
