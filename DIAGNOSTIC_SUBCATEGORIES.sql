-- Diagnostic query to check subcategories
-- Run this in Supabase SQL Editor to see what's in your database

-- Check 1: Count categories with parent_id (subcategories)
SELECT 
  COUNT(*) as total_subcategories,
  COUNT(DISTINCT parent_id) as parent_categories_count
FROM categories
WHERE parent_id IS NOT NULL;

-- Check 2: Show all subcategories (categories with parent_id)
SELECT 
  c.id,
  c.name,
  c.slug,
  c.parent_id,
  c.animal_type,
  p.name as parent_name,
  p.slug as parent_slug,
  p.animal_type as parent_animal_type
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id
WHERE c.parent_id IS NOT NULL
ORDER BY p.name, c.name;

-- Check 3: Show all main categories (parent categories, where parent_id IS NULL)
SELECT 
  id,
  name,
  slug,
  animal_type,
  parent_id
FROM categories
WHERE parent_id IS NULL
ORDER BY name;

-- Check 4: Check subcategories table (if it exists)
SELECT 
  COUNT(*) as total_in_subcategories_table
FROM subcategories
WHERE is_active = true;

-- Check 5: Show sample from subcategories table
SELECT 
  id,
  name,
  slug,
  category_id,
  animal_type
FROM subcategories
LIMIT 10;
