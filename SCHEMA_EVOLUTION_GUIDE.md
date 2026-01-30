# Animal-Centric Schema Evolution Guide

## Overview

This guide documents the gradual evolution of the database schema from a generic e-commerce structure to an **animal-centric model** that supports multi-animal products, hierarchical category-animal relationships, and animal-specific variants.

**Key Principle**: Zero data loss, zero downtime, 100% backward compatible.

---

## Why Animal-Centric?

Currently, the schema has a basic `animal_type` field in categories but:
- ❌ Products can't specify which animals they're for
- ❌ Products can't be suitable for multiple animals (cat + dog)
- ❌ No animal-specific variants (e.g., different sizes per animal)
- ❌ Filtering and discovery is limited

With the evolution:
- ✅ Products explicitly linked to animals
- ✅ Multi-animal support (cross-animal purchases)
- ✅ Animal-specific variants and pricing
- ✅ Rich filtering and discovery
- ✅ Future-proof for new animal types

---

## Architecture

### Core Entities

```
animals (master list)
├── product_animals (products ↔ animals)
├── category_animals (categories ↔ animals)
├── product_category_animals (optimization bridge)
└── product_variants (animal-specific variants)

Existing:
├── categories (enhanced with is_animal_specific)
├── products (enhanced with primary_animal_id)
└── [all other tables unchanged]
```

### New Tables

#### 1. **animals**
```sql
id              UUID PRIMARY KEY
name            TEXT (e.g., 'Cat', 'Dog')
slug            TEXT (cat, dog, bird, other, universal)
description     TEXT
icon            TEXT (URL to icon)
color           TEXT (brand color for UI)
position        INTEGER (sort order)
is_active       BOOLEAN
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

Seeded with: Cat, Dog, Bird, Other, Universal

#### 2. **product_animals** (Many-to-Many)
```sql
id              UUID PRIMARY KEY
product_id      UUID (FK → products)
animal_id       UUID (FK → animals)
is_primary      BOOLEAN (marks the main animal for this product)
created_at      TIMESTAMPTZ
UNIQUE(product_id, animal_id)
```

**Use Case**: A product can be "suitable for cats AND dogs"

#### 3. **category_animals** (Many-to-Many)
```sql
id              UUID PRIMARY KEY
category_id     UUID (FK → categories)
animal_id       UUID (FK → animals)
is_primary      BOOLEAN
created_at      TIMESTAMPTZ
UNIQUE(category_id, animal_id)
```

**Use Case**: "Nutrition" category → applicable to cat + dog products

#### 4. **product_category_animals** (Optimization Bridge)
```sql
id              UUID PRIMARY KEY
product_id      UUID (FK → products)
category_id     UUID (FK → categories)
animal_id       UUID (FK → animals)
created_at      TIMESTAMPTZ
UNIQUE(product_id, category_id, animal_id)
```

**Performance**: De-normalized for fast filtering by animal + category

#### 5. **product_variants**
```sql
id              UUID PRIMARY KEY
product_id      UUID (FK → products)
animal_id       UUID (FK → animals, nullable)
sku             TEXT UNIQUE
size            TEXT (e.g., 'Small', 'Medium', 'Large')
color           TEXT
weight          TEXT
stock           INTEGER
price           INTEGER (can differ per animal variant)
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

**Use Case**: 
- Same product, different sizes for small vs. large dogs
- Different pricing for premium cat formula vs. standard dog formula

---

## Enhanced Existing Tables

### categories
```sql
-- Added column:
is_animal_specific BOOLEAN DEFAULT false
-- Marks if this category applies to specific animals
```

### products
```sql
-- Added columns:
is_multi_animal    BOOLEAN DEFAULT false
-- Indicates product works for multiple animals
primary_animal_id  UUID REFERENCES animals(id)
-- The main/primary animal for this product
```

---

## Views (Backward Compatibility Layer)

### v_products_with_animals
Joins products with their primary animal and animal count.

```sql
SELECT 
  p.*,
  a.name as primary_animal_name,
  a.slug as primary_animal_slug,
  animal_count
FROM v_products_with_animals
WHERE primary_animal_slug = 'cat'
```

### v_categories_with_animals
Joins categories with primary animal info.

```sql
SELECT 
  c.*,
  a.name as primary_animal_name,
  animal_count
FROM v_categories_with_animals
WHERE is_animal_specific = true
```

### v_products_by_animal
Products organized by animal.

```sql
SELECT * FROM v_products_by_animal 
WHERE animal_slug = 'dog' AND category_name = 'Nutrition'
```

---

## Migration Path

### Phase 1: Preparation (Before Running Script)
- Backup database ✓ (already done)
- Review schema diagram
- Plan which existing products should be tagged with animals

### Phase 2: Run Migration Script (002-evolve-animal-centric.sql)
- Creates all new tables
- Seeds base animals (cat, dog, bird, other, universal)
- Adds columns to existing tables
- Creates views and migration functions

**No data is deleted or modified yet.**

### Phase 3: Data Migration (Optional - When Ready)
```sql
-- Migrate existing category animal_type to category_animals table
SELECT migrate_category_animal_types();

-- Set primary animals for existing products based on their category
SELECT set_product_primary_animals();
```

### Phase 4: Application Updates
Update your backend queries:

#### Old Way (Still Works)
```sql
SELECT * FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.animal_type = 'cat'
```

#### New Way (Recommended)
```sql
SELECT * FROM v_products_with_animals
WHERE primary_animal_slug = 'cat'
```

#### Advanced Way (Multi-animal)
```sql
SELECT DISTINCT p.*
FROM products p
JOIN product_animals pa ON p.id = pa.product_id
JOIN animals a ON pa.animal_id = a.id
WHERE a.slug = 'cat'
```

### Phase 5: Front-End Updates
- Add animal filter UI
- Show animal-specific variants
- Display "suitable for" badge with animal icons
- Filter products by selected animal

---

## Common Queries

### Find all products for a specific animal
```sql
SELECT * FROM v_products_with_animals
WHERE primary_animal_slug = 'cat'
ORDER BY created_at DESC
```

### Find products suitable for multiple animals
```sql
SELECT p.*, COUNT(DISTINCT pa.animal_id) as animal_count
FROM products p
JOIN product_animals pa ON p.id = pa.product_id
GROUP BY p.id
HAVING COUNT(DISTINCT pa.animal_id) > 1
```

### Filter by category AND animal
```sql
SELECT DISTINCT p.*
FROM products p
JOIN product_category_animals pca ON p.id = pca.product_id
WHERE pca.category_id = $1 AND pca.animal_id = $2
```

### Get variants for a specific animal
```sql
SELECT * FROM product_variants
WHERE product_id = $1 AND (animal_id = $2 OR animal_id IS NULL)
ORDER BY position
```

### Find animal-specific categories
```sql
SELECT * FROM v_categories_with_animals
WHERE is_animal_specific = true
ORDER BY primary_animal_name
```

---

## Backward Compatibility Guarantees

✅ **Original `animal_type` field remains** in categories table  
✅ **All existing queries still work** (no breaking changes)  
✅ **No data loss** - old fields preserved indefinitely  
✅ **Gradual migration** - use new and old systems simultaneously  
✅ **Views provide compatibility layer** for common patterns  

---

## Optional: Removing animal_type Later

Once fully migrated, you can optionally retire the old field (not recommended):

```sql
-- Review what still uses animal_type
SELECT COUNT(*) FROM categories WHERE animal_type IS NOT NULL;

-- If all migrated to category_animals, eventually drop:
ALTER TABLE categories DROP COLUMN animal_type;

-- But this is optional - keeping it doesn't hurt
```

---

## Implementation Checklist

- [ ] Backup database
- [ ] Run `002-evolve-animal-centric.sql`
- [ ] Verify new tables created
- [ ] Review animal seed data
- [ ] Run migration functions (if applicable)
- [ ] Update application queries
- [ ] Add animal filtering to UI
- [ ] Test multi-animal product flow
- [ ] Test product variant selection
- [ ] Deploy with confidence (zero downtime)

---

## Performance Considerations

### Indexes Created
- `idx_animals_slug` - Fast animal lookups
- `idx_product_animals_product` - Products by animal
- `idx_product_animals_animal` - Animals by product
- `idx_category_animals_*` - Category-animal filtering
- `idx_pca_*` - Optimized category/animal/product queries
- `idx_product_variants_*` - Variant lookups

### De-Normalized Bridge Table
The `product_category_animals` table is intentionally de-normalized to speed up filtering by animal + category without complex joins.

**Trade-off**: 
- **Faster reads** (product + category + animal filters)
- **Extra writes** (maintain bridge when relationships change)
- **Good for e-commerce** where reads >>> writes

---

## Troubleshooting

### Unique constraint violation on product_animals
```
ERROR: duplicate key value violates unique constraint "product_animals_product_id_animal_id_key"
```

**Cause**: Product already linked to this animal  
**Solution**: Check existing product_animals before insert

```sql
SELECT * FROM product_animals 
WHERE product_id = $1 AND animal_id = $2
```

### Migration functions return no results
**Cause**: No data to migrate or incorrect animal_type values  
**Solution**: 
```sql
-- Check what animal_type values exist
SELECT DISTINCT animal_type FROM categories WHERE animal_type IS NOT NULL;

-- Verify animals table has matching slugs
SELECT slug FROM animals;
```

### Views showing NULL animal names
**Cause**: No primary animal set for products  
**Solution**: Run `set_product_primary_animals()` or manually set `primary_animal_id`

```sql
UPDATE products 
SET primary_animal_id = (SELECT id FROM animals WHERE slug = 'universal')
WHERE primary_animal_id IS NULL
```

---

## Next Steps

1. **Review** this guide and the migration script
2. **Run** the migration script in your staging environment
3. **Test** with sample data
4. **Update** application queries gradually
5. **Rollout** to production (zero downtime)
6. **Monitor** for any issues

---

## Questions?

Refer to the SQL comments in `002-evolve-animal-centric.sql` for technical details on each phase.

The schema evolution is designed for **production stability** with **gradual adoption** of new features.
