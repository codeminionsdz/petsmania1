# Animal-Centric Schema: Quick Reference

## What Changed?

| What | Type | Status | Impact |
|------|------|--------|--------|
| Original `animal_type` in categories | Column | ✅ Preserved | Still works, now linked to animals table |
| New `animals` table | Table | ✨ New | Master list: cat, dog, bird, other, universal |
| New `product_animals` | Table | ✨ New | Products ↔ Animals (many-to-many) |
| New `category_animals` | Table | ✨ New | Categories ↔ Animals (many-to-many) |
| New `product_variants` | Table | ✨ New | Size/color/price per animal |
| `categories.is_animal_specific` | Column | ✨ New | Mark if category is animal-specific |
| `products.primary_animal_id` | Column | ✨ New | Main animal for product |
| `products.is_multi_animal` | Column | ✨ New | Product works for multiple animals |

**TL;DR**: All new, nothing deleted. Use new tables or keep using old approach.

---

## Getting Product Info With Animal

### Option 1: Simple (Current Way - Still Works)
```sql
SELECT p.*, c.animal_type 
FROM products p 
JOIN categories c ON p.category_id = c.id
```

### Option 2: New Way (Recommended)
```sql
SELECT * FROM v_products_with_animals
WHERE primary_animal_slug = 'cat'
```

### Option 3: Advanced (Multi-Animal Support)
```sql
SELECT p.id, p.name, array_agg(a.name) as animals
FROM products p
JOIN product_animals pa ON p.id = pa.product_id
JOIN animals a ON pa.animal_id = a.id
GROUP BY p.id
```

---

## Get Animal ID from Name
```sql
SELECT id FROM animals WHERE slug = 'cat'
-- Returns: UUID of cat animal
```

---

## Tag a Product with Animal
```sql
-- Link product to animal
INSERT INTO product_animals (product_id, animal_id, is_primary)
VALUES ($productId, $animalId, true)
ON CONFLICT DO NOTHING
```

---

## Link Category to Animal
```sql
-- Associate category with animal
INSERT INTO category_animals (category_id, animal_id, is_primary)
VALUES ($categoryId, $animalId, true)
ON CONFLICT DO NOTHING

-- Mark category as animal-specific
UPDATE categories 
SET is_animal_specific = true 
WHERE id = $categoryId
```

---

## Create Product Variant (Size Per Animal)
```sql
INSERT INTO product_variants (
  product_id, 
  animal_id, 
  sku, 
  size, 
  stock, 
  price
)
VALUES (
  $productId,
  (SELECT id FROM animals WHERE slug = 'dog'),
  'PROD-001-DOG-L',
  'Large',
  50,
  3500
)
```

---

## Filter Products by Animal
```sql
-- By primary animal
SELECT p.* FROM products p
WHERE p.primary_animal_id = (SELECT id FROM animals WHERE slug = 'cat')

-- By any animal connection
SELECT DISTINCT p.* FROM products p
JOIN product_animals pa ON p.id = pa.product_id
WHERE pa.animal_id = (SELECT id FROM animals WHERE slug = 'dog')

-- Using view (easiest)
SELECT * FROM v_products_with_animals 
WHERE primary_animal_slug = 'cat'
```

---

## Filter by Category + Animal
```sql
-- Optimization table (fastest)
SELECT DISTINCT p.* FROM products p
JOIN product_category_animals pca ON p.id = pca.product_id
WHERE pca.category_id = $catId AND pca.animal_id = $animalId

-- Or traditional join (still fast)
SELECT DISTINCT p.* FROM products p
JOIN product_animals pa ON p.id = pa.product_id
JOIN product_category_animals pca ON p.id = pca.product_id
WHERE pca.category_id = $catId AND pa.animal_id = $animalId
```

---

## Show Animals for a Product
```sql
SELECT a.id, a.name, a.slug, a.icon, a.color
FROM animals a
JOIN product_animals pa ON a.id = pa.animal_id
WHERE pa.product_id = $productId
ORDER BY a.position
```

---

## Multi-Animal Product?
```sql
-- Check if product suitable for multiple animals
SELECT is_multi_animal FROM products WHERE id = $productId

-- Or count relationships
SELECT COUNT(*) as animal_count
FROM product_animals
WHERE product_id = $productId
```

---

## All Product Info (With Animals)
```sql
SELECT 
  p.id,
  p.name,
  p.price,
  p.stock,
  pwa.primary_animal_name,
  pwa.animal_count,
  c.name as category_name
FROM v_products_with_animals pwa
JOIN products p ON pwa.id = p.id
LEFT JOIN categories c ON p.category_id = c.id
ORDER BY p.created_at DESC
```

---

## Application Integration Points

### Backend Routes to Update
- `GET /api/products?animal=cat` → Filter by animal
- `GET /api/categories?animal=dog` → Get categories for animal
- `GET /api/products/:id/animals` → Show animals for product
- `POST /api/products/:id/animals` → Tag product with animal
- `GET /api/products/:id/variants?animal=cat` → Get variants for animal

### UI Elements to Add
- Animal filter buttons/dropdown
- "Suitable for: Cat 🐱 Dog 🐕" badges
- Size selector per animal
- "This product is for your cat" messaging

---

## Testing Queries

### Verify animals table populated
```sql
SELECT COUNT(*) FROM animals;
-- Should return 5 (cat, dog, bird, other, universal)
```

### Check new columns exist
```sql
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'products' AND column_name = 'primary_animal_id'
)
-- Should return true
```

### View definitions exist
```sql
SELECT * FROM information_schema.views 
WHERE table_schema = 'public' AND table_name LIKE 'v_%animals%'
-- Should show 3 views
```

### Test migration functions
```sql
-- Preview category migrations
SELECT c.id, c.name, c.animal_type, a.name as mapped_animal
FROM categories c
LEFT JOIN animals a ON c.animal_type = a.slug
WHERE c.animal_type IS NOT NULL
```

---

## Data Migration (One-Time Setup)

When ready to populate junction tables:

```sql
-- Migrate existing categories to category_animals
SELECT migrate_category_animal_types();

-- Set primary animal for products from their categories
SELECT set_product_primary_animals();

-- Verify
SELECT COUNT(*) FROM category_animals;  -- Should have data
SELECT COUNT(*) FROM product_animals;   -- May be 0 if no products manually tagged yet
```

---

## Views Quick List

| View | Purpose |
|------|---------|
| `v_products_with_animals` | Product + primary animal info |
| `v_categories_with_animals` | Category + primary animal info |
| `v_products_by_animal` | Grouped by animal |

---

## Indexes for Performance

All relevant indexes automatically created:
- Animals lookup by slug
- Product-animal relationships
- Category-animal relationships
- Combined product-category-animal queries

No manual index management needed.

---

## Troubleshooting

### "animal_id not found"
```sql
-- Verify animal slug exists
SELECT * FROM animals WHERE slug = 'cat';
-- Use correct slug from results
```

### Duplicate key error
```sql
-- Product already linked to this animal
SELECT * FROM product_animals 
WHERE product_id = $1 AND animal_id = $2
-- Delete first if needed, then re-insert
```

### NULL animal in view
```sql
-- Product missing primary_animal_id
UPDATE products 
SET primary_animal_id = (SELECT id FROM animals WHERE slug = 'universal')
WHERE primary_animal_id IS NULL
```

---

## No Need to Change

✅ Orders table → unchanged  
✅ Order items → unchanged  
✅ Cart items → unchanged  
✅ Wishlist → unchanged  
✅ Brands → unchanged  
✅ Wilayas → unchanged  
✅ Existing queries → still work  

Just extend them with new animal filters!

---

## Remember

- **All old code still works** ✅
- **Optional to migrate** ✅  
- **Use new features gradually** ✅
- **Backward compatible** ✅
- **Zero downtime** ✅
