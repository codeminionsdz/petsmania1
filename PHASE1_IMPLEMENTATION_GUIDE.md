# Phase 1 Implementation Guide - Animal-Centric Data Layer

## Overview

This document guides the implementation of Phase 1: transforming the data layer to be animal-aware while maintaining complete backward compatibility.

**Key Principle**: All changes are additive. Existing functions remain unchanged and continue to work.

---

## Completed in Phase 1

### ✅ 1. Database Schema Evolution

**File**: `scripts/026-animal-centric-phase1-categories.sql`

**What was added**:
- `categories.primary_animal_type` column
  - VARCHAR(20): cat, dog, bird, other, or NULL
  - NULL = applies to all animals (backward compatible)
  - Used for quick filtering without joins

- `category_animals` junction table
  - Many-to-many relationship between categories and animals
  - Allows categories to apply to multiple animals
  - Contains: category_id, animal_type, timestamps

- Indexes for performance
  - `idx_categories_primary_animal`
  - `idx_category_animals_animal_type`
  - `idx_category_animals_category_id`

- `categories_by_animal` view
  - Convenient lookup for "all categories for animal X"
  - Automatically includes NULL animal types

**Backward Compatibility**:
- NULL values in `primary_animal_type` mean "applies to all animals"
- Existing queries unaffected
- New queries can leverage animal type when available

### ✅ 2. Type System Updates

**File**: `lib/types.ts`

**Changes**:
```typescript
export interface Category {
  // ... existing fields ...
  primaryAnimalType?: "cat" | "dog" | "bird" | "other" | null
  animalTypes?: Array<"cat" | "dog" | "bird" | "other">
}
```

**Why**:
- TypeScript support for new animal-aware queries
- Maintains backward compatibility (fields are optional)
- Enables type-safe animal filtering

### ✅ 3. Data Layer Functions

**File**: `lib/data.ts` - New Functions Added

#### A. `getCategoriesByAnimal(animalType)`
```typescript
const catCategories = await getCategoriesByAnimal('cat')
// Returns: All categories with primary_animal_type='cat' OR primary_animal_type=NULL
```

**Use Case**: Show cat-specific categories on `/animals/cat` page

**Backward Compatibility**: Includes NULL animal types by default

#### B. `getBrandsForAnimal(animalType)`
```typescript
const catBrands = await getBrandsForAnimal('cat')
// Returns: All brands that have products for cats
```

**Use Case**: Show relevant brands on animal-specific pages

**Note**: Uses RPC function (needs to be created separately)

#### C. `getFeaturedProductsByAnimal(animalType, limit)`
```typescript
const featuredCats = await getFeaturedProductsByAnimal('cat', 8)
// Returns: 8 featured products for cats
```

**Use Case**: Featured products section on animal pages

**Backward Compatibility**: Includes unspecified products (NULL animal_type)

#### D. `getProductsByAnimalAndCategory(animalType, categorySlug, options)`
```typescript
const catFoods = await getProductsByAnimalAndCategory('cat', 'food', {
  brands: ['brand1', 'brand2'],
  minPrice: 1000,
  maxPrice: 5000,
})
// Returns: Paginated cat food products matching filters
```

**Use Case**: Main product listing for animal + category combo

**Backward Compatibility**: Includes products without animal_type

#### E. `isCategoryForAnimal(categoryId, animalType)`
```typescript
const isRelevant = await isCategoryForAnimal('cat-123', 'cat')
// Returns: boolean - should this category show for this animal?
```

**Use Case**: Conditional rendering in UI

---

## Next Steps: Phase 2 & Beyond

### Phase 2: Page Structure (Ready to implement)

**Create new page**: `app/animals/[type]/page.tsx`
```typescript
// /animals/cat
// /animals/dog
// /animals/bird
// /animals/other

export default async function AnimalPage({ params }) {
  const { type } = await params
  const [categories, brands, products] = await Promise.all([
    getCategoriesByAnimal(type),
    getBrandsForAnimal(type),
    getFeaturedProductsByAnimal(type),
  ])
  
  return (
    <AnimalPageContent
      animalType={type}
      categories={categories}
      brands={brands}
      featuredProducts={products}
    />
  )
}
```

### Phase 3: Component Updates (After pages work)

- Update `ProductFilters` to scope brands by current animal
- Update breadcrumbs to include animal context
- Add animal selector to header
- Update category cards for animal context

### Phase 4: Navigation (Final polish)

- Update homepage to feature animals first
- Update links to go to animal pages
- Add animal-aware search

---

## Database Setup Instructions

### 1. Run the migration
```sql
-- Execute: scripts/026-animal-centric-phase1-categories.sql
-- This creates the new columns, tables, indexes, and view
```

### 2. Seed data (optional but recommended)
```sql
-- Update existing categories with primary animal types
UPDATE categories 
SET primary_animal_type = 'cat' 
WHERE name ILIKE '%cat%' OR name ILIKE '%feline%';

UPDATE categories 
SET primary_animal_type = 'dog' 
WHERE name ILIKE '%dog%' OR name ILIKE '%canine%';

-- Leave others as NULL (applies to all animals)
```

### 3. Verify structure
```sql
-- Check table structure
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'categories' 
ORDER BY ordinal_position;

-- Check view exists
SELECT * FROM information_schema.views WHERE table_name = 'categories_by_animal';

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename IN ('categories', 'category_animals');
```

---

## Backward Compatibility Guarantee

### Old Code Still Works
```typescript
// These functions UNCHANGED and continue working:
const products = await getProducts()
const categories = await getCategoriesWithHierarchy()
const brands = await getBrands()

// These functions ENHANCED but backward compatible:
// - Products with NULL animal_type appear in all filters
// - Categories without animal_type appear everywhere
```

### Graceful Degradation
If a category has no primary_animal_type:
- It shows in ALL animal pages
- It shows in ALL animal filters
- Equivalent to "multi-animal" category

If a product has NULL animal_type:
- It shows for ALL animals
- It shows in ALL queries
- Useful for universal products (carriers, toys, etc.)

---

## Testing Checklist

### Database Level
- [ ] Migration runs without errors
- [ ] New columns exist with correct types
- [ ] Indexes are created
- [ ] View returns data correctly

### Code Level
- [ ] `getCategoriesByAnimal('cat')` returns categories
- [ ] `getBrandsForAnimal('dog')` returns brands
- [ ] `getFeaturedProductsByAnimal('bird')` returns products
- [ ] `getProductsByAnimalAndCategory('cat', 'food')` returns paginated results
- [ ] `isCategoryForAnimal('id', 'cat')` returns boolean

### Backward Compatibility
- [ ] `getProducts()` still works
- [ ] `getCategories()` still works
- [ ] `getBrands()` still works
- [ ] Products with NULL animal_type appear in all queries
- [ ] Categories with NULL primary_animal_type appear everywhere

---

## Monitoring & Debugging

### Common Issues

**Issue**: `getCategoriesByAnimal()` returns empty
- Check: Do categories have `primary_animal_type` set or NULL?
- Solution: Seed data or update categories

**Issue**: `getBrandsForAnimal()` fails
- Check: Is RPC function `get_brands_for_animal` created?
- Solution: Falls back to `getBrands()` if RPC unavailable

**Issue**: Products missing from animal page
- Check: Is product's `animal_type` set correctly?
- Check: Does product's category have the right `primary_animal_type`?
- Note: NULL animal_type products always appear (backward compat)

### Debugging Queries
```sql
-- See all categories and their animal types
SELECT id, name, primary_animal_type FROM categories ORDER BY name;

-- See which animals a category applies to
SELECT * FROM categories_by_animal WHERE slug = 'food';

-- See all products for a category
SELECT p.id, p.name, p.animal_type 
FROM products p 
JOIN categories c ON p.category_id = c.id 
WHERE c.slug = 'food';
```

---

## Success Criteria

✅ **Phase 1 Complete When**:
1. Migration script runs successfully
2. All 5 new functions work correctly
3. All backward compatibility tests pass
4. Old queries return same results as before
5. New queries return animal-filtered results
6. No errors in application logs

✅ **Ready for Phase 2 When**:
1. All Phase 1 criteria met
2. Data layer tested thoroughly
3. Sample queries documented
4. Team understands new functions

---

## File Summary

| File | Type | Purpose | Status |
|------|------|---------|--------|
| `ANIMAL_CENTRIC_EVOLUTION.md` | Doc | Full architecture vision | Created |
| `scripts/026-animal-centric-phase1-categories.sql` | Migration | Database schema changes | Created |
| `lib/types.ts` | Types | Add animal fields to Category | Updated |
| `lib/data.ts` | Code | New animal-aware functions | Updated |

---

## Architecture Diagram

```
PHASE 1 (Current): Data Layer Ready
┌─────────────────────────────────────────┐
│ Database                                │
│ ┌───────────────────────────────────┐   │
│ │ categories                        │   │
│ │ + primary_animal_type             │   │
│ └───────────────────────────────────┘   │
│ ┌───────────────────────────────────┐   │
│ │ category_animals (junction)       │   │
│ │ - many-to-many mapping            │   │
│ └───────────────────────────────────┘   │
│ ┌───────────────────────────────────┐   │
│ │ products (already has animal_type)│   │
│ └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ Data Layer (lib/data.ts)                │
│ NEW Functions:                          │
│ - getCategoriesByAnimal()               │
│ - getBrandsForAnimal()                  │
│ - getFeaturedProductsByAnimal()         │
│ - getProductsByAnimalAndCategory()      │
│ - isCategoryForAnimal()                 │
│ OLD Functions: Still work (unchanged)   │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ Components (will update in Phase 2)     │
│ - Ready to use new functions            │
│ - No changes yet                        │
└─────────────────────────────────────────┘

PHASE 2: Will add /animals/[type] pages
PHASE 3: Will refactor components
PHASE 4: Will update navigation
```

---

## Conclusion

Phase 1 establishes a **solid foundation** for animal-centric navigation:
- ✅ Data structure ready
- ✅ Query functions available
- ✅ Backward compatibility maintained
- ✅ No breaking changes
- ✅ Ready for Phase 2 development

The next phase will create the UI/pages that leverage these functions.

