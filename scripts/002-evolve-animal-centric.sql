-- Animal-Centric Schema Evolution
-- This migration makes the database animal-centric while preserving backward compatibility
-- Run this AFTER 001-create-schema.sql
-- Uses ALTER TABLE only - NO data loss, NO table recreation

-- ============================================================
-- PHASE 1: Create foundational animal entities
-- ============================================================

-- Animals Table (NEW - foundational)
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

-- Insert base animal types
INSERT INTO animals (name, slug, description, position) VALUES
  ('Cat', 'cat', 'Feline companions', 1),
  ('Dog', 'dog', 'Canine companions', 2),
  ('Bird', 'bird', 'Avian companions', 3),
  ('Other', 'other', 'Other animals', 4),
  ('Universal', 'universal', 'Suitable for all animals', 5)
ON CONFLICT (slug) DO NOTHING;

-- Create index on animals
CREATE INDEX IF NOT EXISTS idx_animals_slug ON animals(slug);
CREATE INDEX IF NOT EXISTS idx_animals_active ON animals(is_active);

-- ============================================================
-- PHASE 2: Add animal relationships to products
-- ============================================================

-- Product-Animal Mapping Table (NEW - junction table for many-to-many)
CREATE TABLE IF NOT EXISTS product_animals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, animal_id)
);

CREATE INDEX IF NOT EXISTS idx_product_animals_product ON product_animals(product_id);
CREATE INDEX IF NOT EXISTS idx_product_animals_animal ON product_animals(animal_id);
CREATE INDEX IF NOT EXISTS idx_product_animals_primary ON product_animals(is_primary);

-- ============================================================
-- PHASE 3: Enhance categories with animal hierarchy
-- ============================================================

-- Category-Animal Mapping Table (NEW - for category-animal associations)
CREATE TABLE IF NOT EXISTS category_animals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, animal_id)
);

CREATE INDEX IF NOT EXISTS idx_category_animals_category ON category_animals(category_id);
CREATE INDEX IF NOT EXISTS idx_category_animals_animal ON category_animals(animal_id);

-- Add is_animal_specific flag to categories
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS is_animal_specific BOOLEAN DEFAULT false;

-- Create index for animal-specific filtering
CREATE INDEX IF NOT EXISTS idx_categories_animal_specific ON categories(is_animal_specific);

-- ============================================================
-- PHASE 4: Add animal tracking to products
-- ============================================================

-- Add animal-specific columns to products (nullable for backward compatibility)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_multi_animal BOOLEAN DEFAULT false;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS primary_animal_id UUID REFERENCES animals(id) ON DELETE SET NULL;

-- Create indexes for animal filtering
CREATE INDEX IF NOT EXISTS idx_products_multi_animal ON products(is_multi_animal);
CREATE INDEX IF NOT EXISTS idx_products_primary_animal ON products(primary_animal_id);

-- ============================================================
-- PHASE 5: Enhanced product filtering and discovery
-- ============================================================

-- Product-Category-Animal Bridge (for optimized queries)
-- This helps with filtering products by animal + category
CREATE TABLE IF NOT EXISTS product_category_animals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, category_id, animal_id)
);

CREATE INDEX IF NOT EXISTS idx_pca_product ON product_category_animals(product_id);
CREATE INDEX IF NOT EXISTS idx_pca_category_animal ON product_category_animals(category_id, animal_id);
CREATE INDEX IF NOT EXISTS idx_pca_animal ON product_category_animals(animal_id);

-- ============================================================
-- PHASE 6: Animal-specific product variants
-- ============================================================

-- Product Variants Table (NEW - for size, color by animal)
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  animal_id UUID REFERENCES animals(id) ON DELETE CASCADE,
  sku TEXT UNIQUE,
  size TEXT,
  color TEXT,
  weight TEXT,
  stock INTEGER DEFAULT 0,
  price INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_animal ON product_variants(animal_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);

-- ============================================================
-- PHASE 7: Data migration helpers
-- ============================================================

-- Function to migrate existing animal_type data from categories
CREATE OR REPLACE FUNCTION migrate_category_animal_types()
RETURNS void AS $$
DECLARE
  v_category RECORD;
  v_animal_id UUID;
BEGIN
  FOR v_category IN 
    SELECT id, animal_type FROM categories WHERE animal_type IS NOT NULL
  LOOP
    -- Get the animal_id for this animal_type
    SELECT id INTO v_animal_id FROM animals WHERE slug = v_category.animal_type;
    
    IF v_animal_id IS NOT NULL THEN
      -- Insert into category_animals table
      INSERT INTO category_animals (category_id, animal_id, is_primary)
      VALUES (v_category.id, v_animal_id, true)
      ON CONFLICT (category_id, animal_id) DO NOTHING;
      
      -- Mark category as animal-specific
      UPDATE categories SET is_animal_specific = true WHERE id = v_category.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to set primary animal for products based on category
CREATE OR REPLACE FUNCTION set_product_primary_animals()
RETURNS void AS $$
DECLARE
  v_product RECORD;
  v_primary_animal_id UUID;
BEGIN
  FOR v_product IN 
    SELECT DISTINCT p.id, p.category_id FROM products p WHERE p.primary_animal_id IS NULL
  LOOP
    -- Get the primary animal from the product's category
    SELECT a.id INTO v_primary_animal_id 
    FROM category_animals ca
    JOIN animals a ON ca.animal_id = a.id
    WHERE ca.category_id = v_product.category_id AND ca.is_primary = true
    LIMIT 1;
    
    IF v_primary_animal_id IS NOT NULL THEN
      UPDATE products SET primary_animal_id = v_primary_animal_id WHERE id = v_product.id;
    ELSE
      -- Default to universal if no specific animal in category
      SELECT id INTO v_primary_animal_id FROM animals WHERE slug = 'universal';
      UPDATE products SET primary_animal_id = v_primary_animal_id WHERE id = v_product.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- PHASE 8: Views for backward compatibility
-- ============================================================

-- View: All products with their primary animal info
CREATE OR REPLACE VIEW v_products_with_animals AS
SELECT 
  p.id,
  p.name,
  p.slug,
  p.price,
  p.stock,
  p.category_id,
  p.brand_id,
  a.id as primary_animal_id,
  a.name as primary_animal_name,
  a.slug as primary_animal_slug,
  (SELECT COUNT(*) FROM product_animals pa WHERE pa.product_id = p.id) as animal_count
FROM products p
LEFT JOIN animals a ON p.primary_animal_id = a.id;

-- View: Categories with their primary animal
CREATE OR REPLACE VIEW v_categories_with_animals AS
SELECT 
  c.id,
  c.name,
  c.slug,
  c.is_animal_specific,
  a.id as primary_animal_id,
  a.name as primary_animal_name,
  a.slug as primary_animal_slug,
  (SELECT COUNT(*) FROM category_animals ca WHERE ca.category_id = c.id) as animal_count
FROM categories c
LEFT JOIN category_animals ca ON c.id = ca.category_id AND ca.is_primary = true
LEFT JOIN animals a ON ca.animal_id = a.id;

-- View: Products organized by animal
CREATE OR REPLACE VIEW v_products_by_animal AS
SELECT 
  a.id as animal_id,
  a.name as animal_name,
  a.slug as animal_slug,
  p.id as product_id,
  p.name as product_name,
  p.price,
  p.stock,
  c.name as category_name
FROM animals a
LEFT JOIN product_animals pa ON a.id = pa.animal_id
LEFT JOIN products p ON pa.product_id = p.id
LEFT JOIN categories c ON p.category_id = c.id
WHERE a.is_active = true;

-- ============================================================
-- PHASE 9: Migration execution
-- ============================================================

-- Execute data migrations (run once)
-- Uncomment to run migration functions:
-- SELECT migrate_category_animal_types();
-- SELECT set_product_primary_animals();

-- ============================================================
-- DOCUMENTATION
-- ============================================================

/*
ANIMAL-CENTRIC SCHEMA EVOLUTION

Tables Added:
1. animals - Master list of animal types
2. product_animals - Links products to animals (many-to-many)
3. category_animals - Links categories to animals (many-to-many)
4. product_category_animals - Optimized bridge for product/category/animal filtering
5. product_variants - Animal-specific product variants (size, color, etc.)

Columns Added to Existing Tables:
- categories.is_animal_specific (BOOLEAN)
- products.is_multi_animal (BOOLEAN)
- products.primary_animal_id (UUID foreign key)

Views Created:
- v_products_with_animals - Products with animal metadata
- v_categories_with_animals - Categories with animal metadata
- v_products_by_animal - Products organized by animal

Functions Created:
- migrate_category_animal_types() - Migrates existing animal_type to animal references
- set_product_primary_animals() - Sets primary animals for products

Backward Compatibility:
- All new columns have defaults
- Existing animal_type field in categories is preserved
- All existing data remains intact
- Application can use both old and new queries simultaneously during transition

Recommended Migration Path:
1. Run this script
2. Populate junction tables based on your business rules
3. Update application queries to use new views and relationships
4. Eventually deprecate old animal_type field (optional, can keep permanently)

Benefits:
✓ Supports multi-animal products (e.g., 'safe for cats AND dogs')
✓ Hierarchical animal-category relationships
✓ Product variants per animal
✓ Better filtering and discovery
✓ Zero data loss or downtime
✓ Gradual migration path
*/
