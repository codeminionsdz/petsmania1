-- Phase 1: Add Animal Awareness to Categories
-- This migration establishes the foundation for animal-centric navigation
-- without breaking existing functionality

-- Step 1: Add primary_animal_type column to categories for quick filtering
ALTER TABLE categories ADD COLUMN IF NOT EXISTS primary_animal_type VARCHAR(20) DEFAULT NULL;

-- Step 2: Create junction table for many-to-many category-animal relationships
-- This allows a category to apply to multiple animals if needed
CREATE TABLE IF NOT EXISTS category_animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  animal_type VARCHAR(20) NOT NULL CHECK (animal_type IN ('cat', 'dog', 'bird', 'other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, animal_type)
);

-- Step 3: Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_categories_primary_animal ON categories(primary_animal_type);
CREATE INDEX IF NOT EXISTS idx_category_animals_animal_type ON category_animals(animal_type);
CREATE INDEX IF NOT EXISTS idx_category_animals_category_id ON category_animals(category_id);

-- Step 4: Create a view for convenient category-animal lookups
CREATE OR REPLACE VIEW categories_by_animal AS
SELECT DISTINCT
  c.id,
  c.name,
  c.slug,
  c.description,
  c.image,
  c.parent_id,
  c.product_count,
  COALESCE(ca.animal_type, c.primary_animal_type) as animal_type
FROM categories c
LEFT JOIN category_animals ca ON c.id = ca.category_id
WHERE COALESCE(ca.animal_type, c.primary_animal_type) IS NOT NULL
OR c.primary_animal_type IS NOT NULL;

-- Step 5: Add comment documenting the migration
COMMENT ON TABLE category_animals IS 'Junction table mapping categories to animals. Allows categories to apply to multiple animal types.';
COMMENT ON COLUMN categories.primary_animal_type IS 'Primary animal type for this category. Use for quick filtering. For multiple animals, use category_animals table.';
COMMENT ON VIEW categories_by_animal IS 'Convenient view returning all categories with their associated animals for direct queries.';

-- Step 6: Verify the migration
-- This query shows the structure is ready
SELECT 
  'categories' as table_name,
  COUNT(*) as record_count
FROM categories
UNION ALL
SELECT 
  'category_animals' as table_name,
  COUNT(*) as record_count
FROM category_animals;
