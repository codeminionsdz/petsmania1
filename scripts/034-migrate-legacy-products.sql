-- Migration: Migrate legacy products to assign "other" animal
-- Purpose: Ensure all products have an animal assigned
-- Rules:
--   1. Products without animal_id → set to "other"
--   2. Never delete or overwrite existing data
--   3. Only update NULL animal_id values
--   4. Preserve all other product data
--   5. Log what was changed

-- ============================================================================
-- STEP 1: VERIFY "other" ANIMAL EXISTS
-- ============================================================================
-- Before running migration, ensure the "other" animal type exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM animals WHERE slug = 'other') THEN
    INSERT INTO animals (name, slug, description, icon, color, position)
    VALUES ('Other', 'other', 'Products for other pets', '🐾', '#6B7280', 4);
    RAISE NOTICE '[MIGRATION] Created "other" animal type';
  ELSE
    RAISE NOTICE '[MIGRATION] "other" animal type already exists';
  END IF;
END $$;

-- ============================================================================
-- STEP 2: CHECK FOR LEGACY PRODUCTS WITHOUT ANIMAL
-- ============================================================================
-- Show diagnostic information before making changes
DO $$
DECLARE
  v_legacy_count INT;
  v_other_id UUID;
BEGIN
  -- Count products without primary_animal_id
  SELECT COUNT(*) INTO v_legacy_count FROM products WHERE primary_animal_id IS NULL;
  
  -- Get the UUID for "other" animal
  SELECT id INTO v_other_id FROM animals WHERE slug = 'other';
  
  IF v_legacy_count > 0 THEN
    RAISE NOTICE '[MIGRATION] Found % products without primary_animal_id', v_legacy_count;
    RAISE NOTICE '[MIGRATION] Will assign all to animal: % (UUID: %)', 'other', v_other_id;
  ELSE
    RAISE NOTICE '[MIGRATION] No legacy products found - all products already have primary_animal_id';
  END IF;
END $$;

-- ============================================================================
-- STEP 3: MIGRATE LEGACY PRODUCTS
-- ============================================================================
-- Update products that have NULL primary_animal_id to "other"
-- This will NOT touch products that already have an animal assigned
UPDATE products
SET 
  primary_animal_id = (SELECT id FROM animals WHERE slug = 'other'),
  updated_at = NOW()
WHERE 
  primary_animal_id IS NULL;

-- ============================================================================
-- STEP 4: VERIFY MIGRATION RESULTS
-- ============================================================================
-- Log the results
DO $$
DECLARE
  v_migrated_count INT;
  v_assigned_to_other INT;
  v_still_null INT;
BEGIN
  -- Count products now assigned to "other"
  SELECT COUNT(*) INTO v_assigned_to_other 
  FROM products 
  WHERE primary_animal_id = (SELECT id FROM animals WHERE slug = 'other');
  
  -- Check if any products still have NULL primary_animal_id (should be 0)
  SELECT COUNT(*) INTO v_still_null 
  FROM products 
  WHERE primary_animal_id IS NULL;
  
  RAISE NOTICE '[MIGRATION RESULTS]';
  RAISE NOTICE '  ✓ Products with "other" animal: %', v_assigned_to_other;
  RAISE NOTICE '  ✓ Products with NULL animal: % (should be 0)', v_still_null;
  
  IF v_still_null = 0 THEN
    RAISE NOTICE '[MIGRATION STATUS] ✓ SUCCESS - All products now have an animal assigned';
  ELSE
    RAISE WARNING '[MIGRATION STATUS] ⚠ WARNING - Found % products still without animal', v_still_null;
  END IF;
END $$;

-- ============================================================================
-- STEP 5: VERIFY DATA INTEGRITY
-- ============================================================================
-- Check that no other product data was modified
DO $$
DECLARE
  v_total_products INT;
  v_with_animal INT;
  v_with_category INT;
  v_with_brand INT;
  v_animal_pct NUMERIC;
  v_category_pct NUMERIC;
  v_brand_pct NUMERIC;
BEGIN
  SELECT COUNT(*) INTO v_total_products FROM products;
  SELECT COUNT(*) INTO v_with_animal FROM products WHERE primary_animal_id IS NOT NULL;
  SELECT COUNT(*) INTO v_with_category FROM products WHERE category_id IS NOT NULL;
  SELECT COUNT(*) INTO v_with_brand FROM products WHERE brand_id IS NOT NULL;
  
  RAISE NOTICE '[DATA INTEGRITY CHECK]';
  RAISE NOTICE '  Total products: %', v_total_products;
  
  -- Only calculate percentages if there are products
  IF v_total_products > 0 THEN
    v_animal_pct := (v_with_animal::NUMERIC / v_total_products * 100);
    v_category_pct := (v_with_category::NUMERIC / v_total_products * 100);
    v_brand_pct := (v_with_brand::NUMERIC / v_total_products * 100);
    
    RAISE NOTICE '  Products with primary_animal_id: % / % (%.1f%%)', v_with_animal, v_total_products, v_animal_pct;
    RAISE NOTICE '  Products with category_id: % / % (%.1f%%)', v_with_category, v_total_products, v_category_pct;
    RAISE NOTICE '  Products with brand_id: % / % (%.1f%%)', v_with_brand, v_total_products, v_brand_pct;
  ELSE
    RAISE NOTICE '  No products found in database';
  END IF;
END $$;

-- ============================================================================
-- OPTIONAL: SHOW DETAILED PRODUCT BREAKDOWN BY ANIMAL
-- ============================================================================
-- Uncomment to see which animals each product is assigned to
-- SELECT 
--   a.name AS animal,
--   COUNT(p.id) AS product_count
-- FROM animals a
-- LEFT JOIN products p ON p.animal_id = a.id
-- GROUP BY a.id, a.name
-- ORDER BY product_count DESC;

-- ============================================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ============================================================================
-- If you need to reverse this migration and restore products to NULL primary_animal_id:
-- UPDATE products SET primary_animal_id = NULL WHERE primary_animal_id = (SELECT id FROM animals WHERE slug = 'other');
