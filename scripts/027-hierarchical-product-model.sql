-- Migration: Refactor to hierarchical product model
-- Supports: animal (mandatory) -> category -> subcategory -> brand (optional)
-- Non-breaking: Existing products continue to work with backward compatibility

-- ============================================================================
-- 1. EXPAND ANIMAL TYPE AND MAKE IT MORE FLEXIBLE
-- ============================================================================

-- Create animals table for future expansion (can add more animal properties)
CREATE TABLE IF NOT EXISTS animals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial animals
INSERT INTO animals (name, slug, description, icon, color, position)
VALUES
  ('Cat', 'cat', 'Products for cats', '🐱', '#FF6B6B', 1),
  ('Dog', 'dog', 'Products for dogs', '🐕', '#4ECDC4', 2),
  ('Bird', 'bird', 'Products for birds', '🐦', '#FFE66D', 3),
  ('Other', 'other', 'Products for other pets', '🐾', '#95E1D3', 4)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. ENHANCE CATEGORIES WITH HIERARCHY AND ANIMAL RELATIONSHIP
-- ============================================================================

-- Add columns to categories table for hierarchical support
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS animal_type VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 999;

-- Create index for efficient category hierarchy queries
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_animal_type ON categories(animal_type);
CREATE INDEX IF NOT EXISTS idx_categories_level ON categories(level);

-- ============================================================================
-- 3. ADD ANIMAL_LINK TO PRODUCTS TABLE (IF NOT EXISTS)
-- ============================================================================

-- Add animal_id to products (foreign key to animals table)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS animal_id UUID REFERENCES animals(id),
ADD COLUMN IF NOT EXISTS subcategory_id UUID;

-- Create index for animal queries
CREATE INDEX IF NOT EXISTS idx_products_animal_id ON products(animal_id);

-- ============================================================================
-- 4. CREATE SUBCATEGORIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image TEXT,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  animal_type VARCHAR(20),
  display_order INTEGER DEFAULT 999,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- Create indexes for subcategory queries
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_animal_type ON subcategories(animal_type);
CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON subcategories(slug);

-- ============================================================================
-- 5. CREATE BRAND ANIMAL ASSOCIATIONS (MANY-TO-MANY)
-- ============================================================================

CREATE TABLE IF NOT EXISTS brand_animals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  animal_type VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, animal_type)
);

-- Create index for efficient brand-animal queries
CREATE INDEX IF NOT EXISTS idx_brand_animals_brand_id ON brand_animals(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_animals_animal_type ON brand_animals(animal_type);

-- ============================================================================
-- 6. CREATE VIEWS FOR EASIER QUERYING
-- ============================================================================

-- View: Get product with full hierarchy information
CREATE OR REPLACE VIEW products_with_hierarchy AS
SELECT
  p.id,
  p.name,
  p.slug,
  p.description,
  p.short_description,
  p.price,
  p.original_price,
  p.discount,
  p.stock,
  p.sku,
  p.featured,
  p.tags,
  -- Animal information
  a.id AS animal_id,
  a.name AS animal_name,
  a.slug AS animal_slug,
  a.icon AS animal_icon,
  a.color AS animal_color,
  -- Category information
  c.id AS category_id,
  c.name AS category_name,
  c.slug AS category_slug,
  -- Subcategory information
  sc.id AS subcategory_id,
  sc.name AS subcategory_name,
  sc.slug AS subcategory_slug,
  -- Brand information
  b.id AS brand_id,
  b.name AS brand_name,
  b.slug AS brand_slug,
  p.created_at,
  p.updated_at
FROM products p
LEFT JOIN animals a ON p.animal_id = a.id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
LEFT JOIN brands b ON p.brand_id = b.id;

-- View: Get all products for a specific animal
CREATE OR REPLACE VIEW products_by_animal AS
SELECT *
FROM products_with_hierarchy
WHERE animal_id IS NOT NULL;

-- View: Get categories with their parent and animal info
CREATE OR REPLACE VIEW categories_with_details AS
SELECT
  c.id,
  c.name,
  c.slug,
  c.description,
  c.image,
  c.parent_id,
  c.animal_type,
  c.level,
  c.display_order,
  c.product_count,
  parent.name AS parent_name,
  parent.slug AS parent_slug,
  COUNT(DISTINCT p.id) AS active_product_count
FROM categories c
LEFT JOIN categories parent ON c.parent_id = parent.id
LEFT JOIN products p ON p.category_id = c.id AND p.stock > 0
WHERE c.is_active = true
GROUP BY c.id, parent.id;

-- ============================================================================
-- 7. MIGRATION HELPER FUNCTION
-- ============================================================================

-- Function to map existing products to animals based on animal_type ENUM
CREATE OR REPLACE FUNCTION migrate_products_to_new_model()
RETURNS TABLE(processed INTEGER, errors TEXT[]) AS $$
DECLARE
  v_animal_id UUID;
  v_animal_name VARCHAR(20);
  v_count INTEGER := 0;
  v_errors TEXT[] := '{}';
  v_animal_cursor CURSOR FOR SELECT id, name FROM animals WHERE is_active = true;
BEGIN
  -- Iterate through animals and update products that match
  OPEN v_animal_cursor;
  LOOP
    FETCH v_animal_cursor INTO v_animal_id, v_animal_name;
    EXIT WHEN NOT FOUND;
    
    UPDATE products
    SET animal_id = v_animal_id
    WHERE animal_type = v_animal_name
    AND animal_id IS NULL;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
  END LOOP;
  CLOSE v_animal_cursor;
  
  RETURN QUERY SELECT v_count, v_errors;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. VALIDATION CONSTRAINTS
-- ============================================================================

-- Note: Check constraints have been simplified to avoid circular references.
-- Ensure animal_id is set when needed (optional - can be enforced at application level)
-- ALTER TABLE products ADD CONSTRAINT chk_animal_required CHECK (animal_id IS NOT NULL);

-- Category and subcategory validation is handled at application level to avoid
-- complex circular constraint checks that can cause performance issues.

-- ============================================================================
-- 9. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_products_animal_category ON products(animal_id, category_id);
CREATE INDEX IF NOT EXISTS idx_products_animal_subcategory ON products(animal_id, subcategory_id);
CREATE INDEX IF NOT EXISTS idx_products_full_hierarchy ON products(animal_id, category_id, subcategory_id);

-- ============================================================================
-- 10. VERIFICATION QUERIES
-- ============================================================================

-- Check that all essential tables exist
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_name IN ('animals', 'products', 'categories', 'subcategories', 'brand_animals')
-- AND table_schema = 'public';

-- Check products table has new columns
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'products' AND column_name IN ('animal_id', 'subcategory_id');

-- Check constraint integrity
-- SELECT con.conname, pg_get_constraintdef(con.oid)
-- FROM pg_constraint con
-- JOIN pg_class rel ON rel.oid = con.conrelid
-- WHERE rel.relname = 'products' AND con.contype = 'c';
