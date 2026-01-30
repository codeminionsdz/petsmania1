# Hierarchical Product Model: Implementation & Testing Guide

## Overview

This guide walks through implementing the new hierarchical product model in your application.

---

## Prerequisites

- Database migration executed: `scripts/027-hierarchical-product-model.sql`
- TypeScript types updated in `lib/types.ts`
- New data functions added to `lib/data.ts`

---

## Implementation Steps

### Step 1: Verify Database Migration

Before writing any code, verify the migration was successful:

```sql
-- Check 1: Animals table created and seeded
SELECT COUNT(*) as animal_count FROM animals;
-- Expected: 4

-- Check 2: Categories table has new columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'categories' 
AND column_name IN ('animal_type', 'level', 'display_order', 'is_active')
ORDER BY column_name;
-- Expected: 4 columns

-- Check 3: Subcategories table exists
SELECT COUNT(*) FROM subcategories;
-- Expected: your subcategories count (may be 0 if none added yet)

-- Check 4: Products table has new columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('animal_id', 'subcategory_id')
ORDER BY column_name;
-- Expected: 2 columns

-- Check 5: Brand animals table exists
SELECT COUNT(*) FROM brand_animals;
-- Expected: your brand-animal associations
```

### Step 2: Test Data Layer Functions

Create a test file to verify all functions work:

```typescript
// __tests__/data.test.ts or similar
import {
  getAnimals,
  getAnimalBySlug,
  getCategoriesForAnimal,
  getSubcategoriesForCategory,
  getProductsByHierarchy,
  getBrandsForAnimalHierarchy,
  getFeaturedProductsForAnimal,
  validateProductHierarchy
} from '@/lib/data'

describe('Hierarchical Product Model', () => {
  
  // Test 1: Get Animals
  test('getAnimals() returns all active animals', async () => {
    const animals = await getAnimals()
    expect(animals).toHaveLength(4)
    expect(animals[0]).toHaveProperty('name')
    expect(animals[0]).toHaveProperty('slug')
    expect(animals[0]).toHaveProperty('displayName')
  })

  // Test 2: Get Single Animal
  test('getAnimalBySlug() returns specific animal', async () => {
    const animal = await getAnimalBySlug('cat')
    expect(animal?.name).toBe('cat')
    expect(animal?.displayName).toBe('Cats')
  })

  // Test 3: Get Categories for Animal
  test('getCategoriesForAnimal() returns relevant categories', async () => {
    const categories = await getCategoriesForAnimal('cat')
    expect(Array.isArray(categories)).toBe(true)
    // Should include categories with animal_type='cat' OR animal_type=NULL
  })

  // Test 4: Get Subcategories
  test('getSubcategoriesForCategory() returns subcategories', async () => {
    const categories = await getCategoriesForAnimal('cat')
    if (categories.length > 0) {
      const subs = await getSubcategoriesForCategory(categories[0].id, 'cat')
      expect(Array.isArray(subs)).toBe(true)
    }
  })

  // Test 5: Get Products by Hierarchy
  test('getProductsByHierarchy() returns paginated products', async () => {
    const result = await getProductsByHierarchy('cat', undefined, undefined, {
      page: 1,
      pageSize: 12
    })
    expect(result).toHaveProperty('data')
    expect(result).toHaveProperty('total')
    expect(result).toHaveProperty('page')
    expect(result).toHaveProperty('pageSize')
    expect(result).toHaveProperty('totalPages')
  })

  // Test 6: Get Brands for Animal
  test('getBrandsForAnimalHierarchy() returns brands', async () => {
    const brands = await getBrandsForAnimalHierarchy('cat')
    expect(Array.isArray(brands)).toBe(true)
  })

  // Test 7: Get Featured Products
  test('getFeaturedProductsForAnimal() returns featured products', async () => {
    const featured = await getFeaturedProductsForAnimal('cat', 4)
    expect(Array.isArray(featured)).toBe(true)
    expect(featured.length).toBeLessThanOrEqual(4)
  })

  // Test 8: Validate Product Hierarchy
  test('validateProductHierarchy() validates correctly', async () => {
    const result = await getProductsByHierarchy('cat')
    if (result.data.length > 0) {
      const validation = await validateProductHierarchy(result.data[0].id)
      expect(validation).toHaveProperty('isValid')
      expect(validation).toHaveProperty('errors')
    }
  })
})
```

### Step 3: Browser Console Testing

Test functions in browser console (for development):

```javascript
// 1. Get all animals
const animals = await fetch('/api/animals').then(r => r.json())
console.log('Animals:', animals)

// 2. Get categories for cat
const catCategories = await fetch('/api/animals/cat/categories').then(r => r.json())
console.log('Cat categories:', catCategories)

// 3. Get products for cat
const catProducts = await fetch('/api/animals/cat/products?page=1&pageSize=12').then(r => r.json())
console.log('Cat products:', catProducts)
```

---

## UI Component Updates

### Step 1: Create Animal Selector Component

```typescript
// components/animals/animal-selector.tsx
'use client'

import { useState, useEffect } from 'react'
import { getAnimals } from '@/lib/data'
import type { Animal } from '@/lib/types'

export function AnimalSelector() {
  const [animals, setAnimals] = useState<Animal[]>([])

  useEffect(() => {
    loadAnimals()
  }, [])

  async function loadAnimals() {
    const data = await getAnimals()
    setAnimals(data)
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {animals.map(animal => (
        <button
          key={animal.id}
          href={`/animals/${animal.slug}`}
          className="p-4 border rounded hover:bg-gray-50"
        >
          <span className="text-3xl">{animal.emoji}</span>
          <p className="mt-2">{animal.displayName}</p>
        </button>
      ))}
    </div>
  )
}
```

### Step 2: Create Category Browser Component

```typescript
// components/products/category-browser.tsx
'use client'

import { useState, useEffect } from 'react'
import { getCategoriesForAnimal, getSubcategoriesForCategory } from '@/lib/data'
import type { Category, Subcategory, AnimalType } from '@/lib/types'

export function CategoryBrowser({ animalType }: { animalType: AnimalType }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])

  useEffect(() => {
    loadCategories()
  }, [animalType])

  async function loadCategories() {
    const data = await getCategoriesForAnimal(animalType)
    setCategories(data)
  }

  async function handleCategorySelect(categoryId: string) {
    setSelectedCategory(categoryId)
    const subs = await getSubcategoriesForCategory(categoryId, animalType)
    setSubcategories(subs)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Categories</h3>
      
      {/* Categories */}
      <div className="space-y-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategorySelect(cat.id)}
            className={`block w-full text-left p-2 rounded ${
              selectedCategory === cat.id ? 'bg-blue-100' : 'hover:bg-gray-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Subcategories */}
      {subcategories.length > 0 && (
        <div className="ml-4 space-y-2">
          <h4 className="font-medium text-sm">Subcategories</h4>
          {subcategories.map(sub => (
            <button
              key={sub.id}
              href={`/animals/${animalType}/${sub.categoryId}/${sub.id}`}
              className="block text-sm text-blue-600 hover:underline"
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

### Step 3: Create Product List Component

```typescript
// components/products/hierarchical-product-list.tsx
'use client'

import { useState, useEffect } from 'react'
import { getProductsByHierarchy, getBrandsForAnimalHierarchy } from '@/lib/data'
import type { Product, AnimalType, PaginatedResponse } from '@/lib/types'

interface ProductListProps {
  animalType: AnimalType
  categoryId?: string
  subcategoryId?: string
}

export function HierarchicalProductList({
  animalType,
  categoryId,
  subcategoryId
}: ProductListProps) {
  const [products, setProducts] = useState<PaginatedResponse<Product>>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 12,
    totalPages: 0
  })
  const [loading, setLoading] = useState(false)
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])

  useEffect(() => {
    loadProducts()
  }, [animalType, categoryId, subcategoryId, selectedBrands])

  async function loadProducts() {
    setLoading(true)
    const result = await getProductsByHierarchy(
      animalType,
      categoryId,
      subcategoryId,
      {
        brands: selectedBrands.length > 0 ? selectedBrands : undefined,
        page: 1,
        pageSize: 12
      }
    )
    setProducts(result)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Products Grid */}
      <div className="grid grid-cols-3 gap-4">
        {products.data.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {products.totalPages > 1 && (
        <div className="flex gap-2 justify-center">
          {Array.from({ length: products.totalPages }).map((_, i) => (
            <button key={i} className="px-3 py-1 border rounded">
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## Page Structure Updates

### Create Animal Page

```typescript
// app/animals/[type]/page.tsx
import { getCategoriesForAnimal, getFeaturedProductsForAnimal } from '@/lib/data'
import type { AnimalType } from '@/lib/types'

interface AnimalPageProps {
  params: { type: AnimalType }
}

export default async function AnimalPage({ params }: AnimalPageProps) {
  const [categories, featured] = await Promise.all([
    getCategoriesForAnimal(params.type),
    getFeaturedProductsForAnimal(params.type, 8)
  ])

  return (
    <div className="space-y-8">
      <h1>Shop for {params.type}s</h1>

      {/* Featured Products */}
      <section>
        <h2>Featured Products</h2>
        <div className="grid grid-cols-4 gap-4">
          {featured.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Browse by Category */}
      <section>
        <h2>Browse by Category</h2>
        <div className="grid grid-cols-3 gap-4">
          {categories.map(category => (
            <CategoryCard key={category.id} category={category} animal={params.type} />
          ))}
        </div>
      </section>
    </div>
  )
}
```

### Create Category Browse Page

```typescript
// app/animals/[type]/[categoryId]/page.tsx
import { getSubcategoriesForCategory, getProductsByHierarchy } from '@/lib/data'
import type { AnimalType } from '@/lib/types'

interface CategoryPageProps {
  params: { type: AnimalType; categoryId: string }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const [subcategories, products] = await Promise.all([
    getSubcategoriesForCategory(params.categoryId, params.type),
    getProductsByHierarchy(params.type, params.categoryId)
  ])

  return (
    <div className="grid grid-cols-4 gap-6">
      {/* Sidebar */}
      <aside className="space-y-4">
        {subcategories.length > 0 && (
          <div>
            <h3>Subcategories</h3>
            <ul className="space-y-2">
              {subcategories.map(sub => (
                <li key={sub.id}>
                  <a href={`/animals/${params.type}/${params.categoryId}/${sub.id}`}>
                    {sub.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      {/* Products */}
      <div className="col-span-3">
        <div className="grid grid-cols-3 gap-4">
          {products.data.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

## Testing Checklist

### Database Tests
- [ ] Animals table has 4 records
- [ ] Categories table has new columns
- [ ] Subcategories table exists
- [ ] Products table has animal_id and subcategory_id
- [ ] brand_animals table exists
- [ ] Indexes are created

### Function Tests
- [ ] `getAnimals()` returns 4 animals
- [ ] `getAnimalBySlug('cat')` returns cat
- [ ] `getCategoriesForAnimal('cat')` returns categories
- [ ] `getSubcategoriesForCategory(id)` works
- [ ] `getProductsByHierarchy('cat')` returns products
- [ ] `getBrandsForAnimalHierarchy('cat')` returns brands
- [ ] `getFeaturedProductsForAnimal('cat')` returns featured
- [ ] `validateProductHierarchy(id)` validates correctly

### UI Tests
- [ ] Animal selector shows all 4 animals with emoji
- [ ] Clicking animal navigates to `/animals/[type]`
- [ ] Categories load for selected animal
- [ ] Products show with correct hierarchy
- [ ] Pagination works
- [ ] Filters work (brand, price, etc.)
- [ ] Breadcrumbs show animal → category → subcategory

### Data Integrity Tests
- [ ] All products have animalId (no NULLs)
- [ ] Subcategory products have both categoryId and subcategoryId
- [ ] Brand filtering works per animal
- [ ] Universal categories (animal_type=NULL) appear for all animals

### Performance Tests
- [ ] Product queries complete in <100ms
- [ ] Category queries complete in <50ms
- [ ] No N+1 query problems
- [ ] Pagination works efficiently

---

## Backward Compatibility Verification

```typescript
// Test that old functions still work
test('Old query functions still work', async () => {
  // These should still return products
  const oldProducts = await getProducts()
  expect(oldProducts.data.length).toBeGreaterThan(0)

  const oldByCategory = await getProductsByCategory('category-slug')
  expect(oldByCategory.data.length).toBeGreaterThanOrEqual(0)

  const oldByBrand = await getProductsByBrand('brand-slug')
  expect(oldByBrand.data.length).toBeGreaterThanOrEqual(0)
})

// Test that products work in both old and new ways
test('Products accessible via both models', async () => {
  const oldResult = await getProducts()
  const newResult = await getProductsByHierarchy('cat')
  
  // New model should have animal context
  expect(newResult.data[0]).toHaveProperty('animalId')
  
  // Old model should still work for backward compatibility
  expect(oldResult.data[0]).toHaveProperty('id')
})
```

---

## Common Issues & Solutions

### Issue 1: `animal_id` column not found

**Cause**: Migration not executed

**Solution**: 
```bash
# Run migration
psql -U postgres -d your_db < scripts/027-hierarchical-product-model.sql
```

### Issue 2: Functions not defined

**Cause**: data.ts not updated with new functions

**Solution**: Verify `lib/data.ts` has all new functions (search for `getProductsByHierarchy`)

### Issue 3: Type errors

**Cause**: TypeScript types not updated

**Solution**: 
```bash
# Check lib/types.ts has AnimalType, Animal, Subcategory interfaces
grep -n "interface Animal" lib/types.ts
grep -n "interface Subcategory" lib/types.ts
```

### Issue 4: Products not showing

**Cause**: No products have animal_id set

**Solution**:
```sql
-- Check how many products have animal_id
SELECT COUNT(*) as with_animal, COUNT(CASE WHEN animal_id IS NULL THEN 1 END) as without_animal
FROM products;

-- Run migration helper to populate from animal_type
SELECT migrate_products_to_new_model();
```

---

## Rollback Plan

If something goes wrong:

```sql
-- Don't delete tables, just disable constraints
ALTER TABLE products DROP CONSTRAINT chk_animal_required;
ALTER TABLE products DROP CONSTRAINT fk_category_animal_match;
ALTER TABLE products DROP CONSTRAINT fk_subcategory_hierarchy_match;

-- Old queries will still work
-- New queries will fail gracefully (empty results)

-- To fully rollback, restore from backup
```

---

## Next Steps

1. ✅ Verify database migration
2. ✅ Test all data layer functions
3. ✅ Update UI components
4. ✅ Create animal pages
5. ✅ Update navigation
6. ⏳ Update admin product form to select animal + category + subcategory
7. ⏳ Create admin category/subcategory management
8. ⏳ Add breadcrumb navigation
9. ⏳ Update search to be animal-aware

