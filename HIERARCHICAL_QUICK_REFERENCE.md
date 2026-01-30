# Hierarchical Product Model - Quick Reference

## Data Model Structure

```
Animal (Mandatory)                    ← Every product must have an animal
├─ Category (Optional)                ← Can have category or not
│  ├─ Subcategory (Optional)         ← Can have subcategory only if has category
│  └─ Products                        ← Products at this level
└─ Brand (Optional)                   ← Brands don't require category
```

---

## Core Concepts

### Animals
- 4 types: cat, dog, bird, other
- Required for every product
- Top-level navigation dimension

### Categories
- Can be universal (NULL animal_type) or animal-specific
- Optional for products
- Can have parent (hierarchical)

### Subcategories
- Fine-grained categorization
- Always belongs to a category
- Can be universal or animal-specific
- Optional for products

### Brand
- Optional for products
- Can be associated with specific animals
- Via brand_animals junction table

---

## Key Rules

| Rule | Status | Example |
|------|--------|---------|
| Animal is mandatory | ✅ Required | Every product needs `animal_id` |
| Category is optional | ✅ Allowed | Product can skip category |
| Subcategory requires category | ❌ Not allowed | Can't have subcategory without category |
| Brand is optional | ✅ Allowed | Product doesn't need a brand |
| Universal categories apply to all animals | ✅ Works | Category with `animal_type=NULL` appears for all animals |

---

## Main Functions

### Get Animals
```typescript
const animals = await getAnimals()
// Returns: Animal[] (always returns 4: cat, dog, bird, other)
```

### Get Categories for Animal
```typescript
const categories = await getCategoriesForAnimal('cat')
// Returns: Category[] (all categories for cats, including universal ones)
```

### Get Subcategories for Category
```typescript
const subcategories = await getSubcategoriesForCategory(categoryId, 'cat')
// Returns: Subcategory[] (subcategories for this category, cat-specific ones included)
```

### Get Products (Main Function)
```typescript
const result = await getProductsByHierarchy(
  'cat',              // Animal (required)
  categoryId,         // Category (optional)
  subcategoryId,      // Subcategory (optional)
  {
    brands: [...],    // Filter by brands
    minPrice: 100,    // Filter by price
    sortBy: 'price-asc',
    page: 1,
    pageSize: 12
  }
)
// Returns: PaginatedResponse<Product>
```

### Get Brands for Animal
```typescript
const brands = await getBrandsForAnimalHierarchy('dog')
// Returns: Brand[] (brands that have products for dogs)
```

### Get Featured Products
```typescript
const featured = await getFeaturedProductsForAnimal('bird', 8)
// Returns: Product[] (up to 8 featured products for birds)
```

### Validate Product
```typescript
const validation = await validateProductHierarchy(productId)
// Returns: { isValid: boolean, errors: string[] }
```

---

## Database Tables

### animals
```
id | name | slug | display_name | emoji | featured | is_active
```

### categories (Enhanced)
```
id | name | parent_id | animal_type | level | display_order | is_active
```

### subcategories (New)
```
id | name | category_id | animal_type | display_order | is_active
```

### products (Enhanced)
```
id | name | animal_id | category_id | subcategory_id | brand_id | ...
```

### brand_animals (New)
```
id | brand_id | animal_type | is_active
```

---

## Usage Examples

### Example 1: Get Cat Toys
```typescript
const categories = await getCategoriesForAnimal('cat')
const toysCategory = categories.find(c => c.slug === 'toys')

const toys = await getProductsByHierarchy('cat', toysCategory.id)
// Result: All cat toys
```

### Example 2: Get Interactive Toys for Dogs
```typescript
const categories = await getCategoriesForAnimal('dog')
const toysCategory = categories.find(c => c.slug === 'toys')
const subcategories = await getSubcategoriesForCategory(toysCategory.id, 'dog')
const interactive = subcategories.find(s => s.slug === 'interactive')

const products = await getProductsByHierarchy('dog', toysCategory.id, interactive.id)
// Result: Interactive toys for dogs only
```

### Example 3: Get Products from Specific Brand
```typescript
const brands = await getBrandsForAnimalHierarchy('cat')
const whiskas = brands.find(b => b.name === 'Whiskas')

const products = await getProductsByHierarchy('cat', undefined, undefined, {
  brands: [whiskas.id]
})
// Result: All Whiskas products for cats
```

### Example 4: Featured Products per Animal
```typescript
const animals = await getAnimals()
for (const animal of animals) {
  const featured = await getFeaturedProductsForAnimal(animal.name, 4)
  // Display featured products on animal card
}
```

---

## Component Structure

### HomePage
```
Animals Section (getAnimals)
├─ Animal Card 1 (🐱 Cats)
│  └─ Featured Products (getFeaturedProductsForAnimal('cat', 4))
├─ Animal Card 2 (🐕 Dogs)
│  └─ Featured Products (getFeaturedProductsForAnimal('dog', 4))
└─ ...
```

### AnimalPage
```
/animals/cat
├─ Featured Section (getFeaturedProductsForAnimal)
└─ Categories Section (getCategoriesForAnimal)
   ├─ Category Card 1
   ├─ Category Card 2
   └─ ...
```

### CategoryPage
```
/animals/cat/toys
├─ Subcategories (getSubcategoriesForCategory)
├─ Filters
│  ├─ Brands (getBrandsForAnimalHierarchy)
│  ├─ Price
│  └─ Stock
└─ Products Grid (getProductsByHierarchy)
```

---

## Type Definitions

### Animal
```typescript
interface Animal {
  id: string
  name: "cat" | "dog" | "bird" | "other"
  slug: string
  displayName: string
  emoji?: string
  featured: boolean
  isActive: boolean
}
```

### Category (Updated)
```typescript
interface Category {
  id: string
  name: string
  animalType?: "cat" | "dog" | "bird" | "other" | null
  level: number
  displayOrder: number
  isActive: boolean
  // ... other fields
}
```

### Subcategory
```typescript
interface Subcategory {
  id: string
  name: string
  categoryId: string
  animalType?: "cat" | "dog" | "bird" | "other" | null
  displayOrder: number
  isActive: boolean
}
```

### Product (Updated)
```typescript
interface Product {
  id: string
  name: string
  animalId: string              // Mandatory
  categoryId?: string | null    // Optional
  subcategoryId?: string | null // Optional (requires categoryId)
  brandId?: string | null       // Optional
  // ... other fields
}
```

---

## Migration Steps

### Step 1: Execute Database Migration
```bash
psql -U postgres -d your_db < scripts/027-hierarchical-product-model.sql
```

### Step 2: Verify Migration
```sql
SELECT COUNT(*) FROM animals;
-- Expected: 4

SELECT COUNT(*) FROM products WHERE animal_id IS NOT NULL;
-- Expected: > 0 (depends on migration helper execution)
```

### Step 3: Run Migration Helper
```sql
SELECT migrate_products_to_new_model();
-- Maps existing animal_type values to animal_id
```

### Step 4: Use New Functions
```typescript
import { getAnimals, getCategoriesForAnimal, getProductsByHierarchy } from '@/lib/data'

// Start using new functions in components
```

---

## Common Queries

### All Products for an Animal
```typescript
const result = await getProductsByHierarchy('cat')
```

### Products in Category
```typescript
const result = await getProductsByHierarchy('cat', categoryId)
```

### Products in Subcategory
```typescript
const result = await getProductsByHierarchy('cat', categoryId, subcategoryId)
```

### Filtered by Brand
```typescript
const result = await getProductsByHierarchy('cat', categoryId, undefined, {
  brands: ['brand1', 'brand2']
})
```

### Filtered by Price
```typescript
const result = await getProductsByHierarchy('cat', undefined, undefined, {
  minPrice: 100,
  maxPrice: 500
})
```

### Sorted by Price (Ascending)
```typescript
const result = await getProductsByHierarchy('cat', undefined, undefined, {
  sortBy: 'price-asc'
})
```

### Paginated
```typescript
const result = await getProductsByHierarchy('cat', undefined, undefined, {
  page: 2,
  pageSize: 20
})
```

---

## Backward Compatibility

### Old Functions Still Work
```typescript
// All of these still work unchanged:
getProducts()
getProductsByCategory(slug)
getProductsByBrand(slug)
getCategoriesWithHierarchy()
getBrands()
```

### Old Data Still Works
- Existing products without animalId are migrated
- Universal categories (animal_type=NULL) work for all animals
- Null values in optional fields are handled gracefully

### Gradual Migration
- You can migrate UI components one page at a time
- Old and new functions coexist
- No need to update everything at once

---

## Error Handling

### Product Validation
```typescript
const validation = await validateProductHierarchy(productId)

if (!validation.isValid) {
  console.error('Validation errors:')
  validation.errors.forEach(err => console.error(`- ${err}`))
}

// Common errors:
// - "Product must have an animal_id"
// - "Category not found"
// - "Subcategory doesn't belong to category"
```

### Query Errors
All functions include error handling:
```typescript
try {
  const products = await getProductsByHierarchy('cat')
} catch (error) {
  console.error('Failed to fetch products:', error)
  // Gracefully handle error, show fallback UI
}
```

---

## Performance Tips

1. **Use Pagination**: Always include `pageSize` and `page` for large result sets
2. **Filter Early**: Apply `brands`, `minPrice`, `maxPrice` to reduce data
3. **Preload Animals**: Cache `getAnimals()` result (4 static items)
4. **Subcategories Optional**: Only fetch if showing category navigation
5. **Featured Only**: Use `getFeaturedProductsForAnimal()` for hero sections

---

## Files Reference

| File | Purpose | Type |
|------|---------|------|
| `scripts/027-hierarchical-product-model.sql` | Database migration | SQL |
| `lib/types.ts` | Type definitions | TypeScript |
| `lib/data.ts` | Query functions | TypeScript |
| `HIERARCHICAL_PRODUCT_MODEL.md` | Full documentation | Markdown |
| `HIERARCHICAL_IMPLEMENTATION_GUIDE.md` | Implementation guide | Markdown |
| `HIERARCHICAL_MODEL_REFACTORING_SUMMARY.md` | Executive summary | Markdown |

---

## Need Help?

1. **Data Model Details?** → See `HIERARCHICAL_PRODUCT_MODEL.md`
2. **How to Implement?** → See `HIERARCHICAL_IMPLEMENTATION_GUIDE.md`
3. **Quick Overview?** → See `HIERARCHICAL_MODEL_REFACTORING_SUMMARY.md`
4. **Function Examples?** → See testing code in implementation guide
5. **Component Examples?** → See component examples in implementation guide
6. **Validation Status?** → See `HIERARCHICAL_REFACTORING_VALIDATION.md`

---

## TL;DR

**What Changed**: Product data model is now hierarchical with animals as mandatory top-level.

**Why**: Better UX (animal-first navigation) and cleaner data organization.

**How to Use**:
1. Execute migration script
2. Use new functions: `getAnimalByHierarchy()`, `getCategoriesForAnimal()`, `getProductsByHierarchy()`
3. Create animal pages (`/animals/[type]`)
4. Optional: Migrate existing UI components at your own pace

**Backward Compatibility**: 100% - old code still works.

**Status**: ✅ Ready for deployment.

