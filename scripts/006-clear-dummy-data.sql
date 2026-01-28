-- ===================================================
-- حذف جميع البيانات الوهمية من قاعدة البيانات
-- Clear All Dummy Data from Database
-- ===================================================

-- حذف جميع صور المنتجات
DELETE FROM product_images;

-- حذف جميع عناصر الطلبات
DELETE FROM order_items;

-- حذف جميع الطلبات
DELETE FROM orders;

-- حذف جميع العناوين
DELETE FROM addresses;

-- حذف جميع المنتجات
DELETE FROM products;

-- حذف جميع الماركات
DELETE FROM brands;

-- حذف جميع الفئات الفرعية والرئيسية
DELETE FROM categories;

-- حذف جميع أكواد الترويج
DELETE FROM promo_codes;

-- حذف جميع مستخدمي النظام (اختياري - احذف التعليق إذا أردت حذف المستخدمين أيضاً)
-- DELETE FROM users;

-- إعادة تعيين تسلسل الأرقام التلقائية (إذا كانت موجودة)
-- ALTER SEQUENCE IF EXISTS products_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS orders_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS categories_id_seq RESTART WITH 1;

-- ملاحظة: تم الإبقاء على:
-- ✅ الولايات الجزائرية (48 ولاية)
-- ✅ بنية قاعدة البيانات

NOTIFY pgrst, 'reload schema';
