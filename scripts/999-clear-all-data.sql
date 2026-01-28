-- ===================================================
-- CLEAR ALL DATA - Reset Database to Empty State
-- حذف جميع البيانات - إعادة قاعدة البيانات إلى حالة فارغة
-- ===================================================
-- Use this script to remove all demo/test data and start fresh
-- Keep the schema structure intact, only delete data

-- Delete all data in correct order (respecting foreign keys)
DELETE FROM product_images;
DELETE FROM order_items;
DELETE FROM cart_items;
DELETE FROM wishlist_items;
DELETE FROM orders;
DELETE FROM addresses;
DELETE FROM products;
DELETE FROM brands;
DELETE FROM categories;
DELETE FROM promo_codes;
DELETE FROM wilayas;
-- Don't delete profiles as they are linked to auth.users

-- Reset sequences if needed
-- Categories and other tables will auto-generate new UUIDs

-- Verify deletion
DO $$
DECLARE
    product_count INTEGER;
    brand_count INTEGER;
    category_count INTEGER;
    order_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO product_count FROM products;
    SELECT COUNT(*) INTO brand_count FROM brands;
    SELECT COUNT(*) INTO category_count FROM categories;
    SELECT COUNT(*) INTO order_count FROM orders;
    
    RAISE NOTICE '✅ Database cleared successfully:';
    RAISE NOTICE '   - Products: %', product_count;
    RAISE NOTICE '   - Brands: %', brand_count;
    RAISE NOTICE '   - Categories: %', category_count;
    RAISE NOTICE '   - Orders: %', order_count;
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Ready to add data from Admin Panel!';
END $$;
