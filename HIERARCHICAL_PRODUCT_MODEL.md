# Product Data Model Refactoring: Hierarchical Structure

## Overview

The product data model has been refactored to support a clean hierarchical structure:

```
Animal (Mandatory)
├─ Category (Optional)
│  ├─ Subcategory (Optional)
│  └─ Products
└─ Brand (Optional)
```

This structure provides:
- **Cleaner navigation**: Users browse by animal first, then drill down
- **Better data organization**: Products are logically grouped
- **Flexibility**: Skip levels if not needed (e.g., animal → product)
- **Backward compatibility**: Existing products continue to work

---

## Data Model

### 1. Animals Table

Represents the top-level animal types in the system.

```typescript
interface Animal {
  id: string
  name: "cat" | "dog" | "bird" | "other"  // Enum-like
  slug: string
  displayName: string                      // "Cats", "Dogs", etc.
  emoji?: string                           // 🐱, 🐕, 🐦, 🐾
  description?: string
  featured: boolean
  isActive: boolean
}
```

**Example**:
```sql
SELECT * FROM animals;
-- id | name | slug | display_name | emoji | featured | is_active
-- ---|------|------|--------------|-------|----------|----------
-- 1  | cat  | cat  | Cats         | 🐱    | true     | true
-- 2  | dog  | dog  | Dogs         | 🐕    | true     | true
```

### 2. Categories Table (Enhanced)

Now includes animal awareness and hierarchy levels.

```typescript
interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
  parentId?: string | null        // For hierarchical categories
  level: number                   // 1=main, 2=sub-main, etc.
  animalType?: "cat" | "dog" | "bird" | "other" | null  // NULL = for all animals
  productCount: number
  displayOrder: number
  isActive: boolean
}
```

**Key Points**:
- `animalType`: Specifies which animal this category is for. NULL = applicable to all animals
- `level`: Helps with UI rendering (level 1 = main nav, level 2 = dropdowns)
- `displayOrder`: Controls ordering in UI

**Example**:
```sql
SELECT name, animal_type, level FROM categories;
-- name       | animal_type | level
-- ---------- | ----------- | -----
-- Cats       | cat         | 1
-- Toys       | NULL        | 2      (applies to all animals)
-- Scratchers | cat         | 2      (specific to cats)
-- Beds       | dog         | 2      (specific to dogs)
```

### 3. Subcategories Table (New)

Fine-grained categorization within categories.

```typescript
interface Subcategory {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  categoryId: string              // Parent category (required)
  animalType?: "cat" | "dog" | "bird" | "other" | null
  displayOrder: number
  isActive: boolean
  productCount?: number
}
```

**Key Points**:
- Always belongs to a category (`categoryId`)
- Can be animal-specific or universal (NULL)
- One level deep (no sub-sub-categories)

**Example**:
```sql
SELECT sc.name, c.name as category, sc.animal_type FROM subcategories sc
JOIN categories c ON sc.category_id = c.id;

-- name             | category | animal_type
-- --------------- | -------- | -----------
-- Indoor Toys     | Toys     | cat
-- Outdoor Toys    | Toys     | NULL        (for all animals)
-- Chew Toys       | Toys     | dog
```

### 4. Products Table (Updated)

Now references the complete hierarchy.

```typescript
interface Product {
  id: string
  name: string
  slug: string
  // ... other fields ...
  
  // Mandatory hierarchy
  animalId: string                        // Must reference animals table
  
  // Category hierarchy (optional)
  categoryId?: string | null              // References categories
  subcategoryId?: string | null           // References subcategories (requires categoryId)
  
  // Brand (optional)
  brandId?: string | null
  
  // For backward compatibility
  animalType?: "cat" | "dog" | "bird" | "other" | null
}
```

**Key Rules**:
1. **animalId is mandatory** - Every product must belong to an animal
2. **categoryId is optional** - Product can exist without category
3. **subcategoryId requires categoryId** - Can't have subcategory without category
4. **brandId is optional** - Products don't need a brand

### 5. Brand Animals Junction Table (New)

Links brands to specific animals (many-to-many relationship).

```typescript
interface BrandAnimal {
  id: string
  brandId: string                    // References brands
  animalType: "cat" | "dog" | "bird" | "other"
  isActive: boolean
}
```

**Purpose**: Track which animals each brand serves
```sql
SELECT b.name, ba.animal_type FROM brand_animals ba
JOIN brands b ON ba.brand_id = b.id;

-- name    | animal_type
-- ------- | -----------
-- Whiskas | cat
-- Whiskas | dog
-- Pedigree| dog
```

---

## Database Schema

### Tables

```sql
animals (
  id UUID PRIMARY KEY,
  name VARCHAR(20) UNIQUE,
  slug VARCHAR(50) UNIQUE,
  display_name TEXT,
  emoji TEXT,
  featured BOOLEAN,
  is_active BOOLEAN
)

categories (
  id UUID PRIMARY KEY,
  name TEXT,
  slug TEXT UNIQUE,
  parent_id UUID REFERENCES categories(id),
  animal_type VARCHAR(20),           -- NEW
  level INTEGER,                      -- NEW
  display_order INTEGER,              -- NEW
  is_active BOOLEAN                   -- NEW
)

subcategories (                        -- NEW
  id UUID PRIMARY KEY,
  name TEXT,
  slug TEXT,
  category_id UUID REFERENCES categories(id),
  animal_type VARCHAR(20),
  display_order INTEGER,
  is_active BOOLEAN
)

products (
  id UUID PRIMARY KEY,
  name TEXT,
  slug TEXT UNIQUE,
  animal_id UUID REFERENCES animals(id),        -- NEW (MANDATORY)
  category_id UUID REFERENCES categories(id),   -- UPDATED
  subcategory_id UUID REFERENCES subcategories(id),  -- NEW
  brand_id UUID REFERENCES brands(id),
  -- ... other fields ...
)

brand_animals (                        -- NEW (JUNCTION TABLE)
  id UUID PRIMARY KEY,
  brand_id UUID REFERENCES brands(id),
  animal_type VARCHAR(20),
  is_active BOOLEAN
)
```

---

## API Functions

### Get Animals

```typescript
// Get all active animals
const animals = await getAnimals()
// Returns: Animal[]
// Example: [
//   { id: '1', name: 'cat', displayName: 'Cats', emoji: '🐱', ... },
//   { id: '2', name: 'dog', displayName: 'Dogs', emoji: '🐕', ... }
// ]
```

### Get Categories for Animal

```typescript
// Get main categories for a specific animal (includes universal categories)
const categories = await getCategoriesForAnimal('cat')
// Returns: Category[]
// Includes:
//   - Categories with animal_type='cat'
//   - Categories with animal_type=NULL (universal)
```

### Get Subcategories

```typescript
// Get subcategories within a category
const subcategories = await getSubcategoriesForCategory(categoryId, 'cat')
// Returns: Subcategory[]
// Filters by:
//   - Parent category
//   - Animal type (if specified)
```

### Get Products by Hierarchy

```typescript
// Main function for browsing products
const result = await getProductsByHierarchy(
  'cat',                    // Animal (required)
  categoryId,               // Category (optional)
  subcategoryId,            // Subcategory (optional)
  {
    brands: ['brand1', 'brand2'],
    minPrice: 100,
    maxPrice: 500,
    sortBy: 'price-asc',
    page: 1,
    pageSize: 12
  }
)
// Returns: PaginatedResponse<Product>
```

### Get Brands for Animal

```typescript
// Get brands that have products for a specific animal
const brands = await getBrandsForAnimalHierarchy('dog')
// Returns: Brand[]
```

### Get Featured Products

```typescript
// Get featured products for an animal
const featured = await getFeaturedProductsForAnimal('bird', 8)
// Returns: Product[]
```

### Validate Product Hierarchy

```typescript
// Check if a product's hierarchy is valid
const validation = await validateProductHierarchy(productId)
// Returns: { isValid: boolean, errors: string[] }
```

---

## Backward Compatibility

### Existing Products Continue to Work

All existing products are automatically supported:

1. **Products without animalId**:
   - Will trigger migration helper function
   - Based on existing `animal_type` field
   - Maps to `animal_id` in animals table

2. **Products without categoryId**:
   - Fully supported
   - Can be browsed directly by animal
   - Example: Feature products without categories

3. **Products without brandId**:
   - Fully supported (brand is optional)
   - Works with all query functions

### Migration Path

```typescript
// Helper function in database:
SELECT migrate_products_to_new_model();
// This maps existing animal_type values to animal_id references
```

---

## Usage Examples

### Example 1: Browse Cat Products by Category

```typescript
// 1. Get animals for navigation
const animals = await getAnimals()
// [{ name: 'cat', ... }, { name: 'dog', ... }]

// 2. User clicks on 'Cats'
const categories = await getCategoriesForAnimal('cat')
// [{ name: 'Toys', ... }, { name: 'Food', ... }]

// 3. User clicks on 'Toys'
const subcategories = await getSubcategoriesForCategory(toysId, 'cat')
// [{ name: 'Interactive Toys', ... }, { name: 'Scratchers', ... }]

// 4. User browses products
const products = await getProductsByHierarchy('cat', toysId)
// { data: [Product[], ...], total: 45, page: 1, ... }
```

### Example 2: Get Products for Multiple Animals

```typescript
// Get dog and cat food products
const dogFood = await getProductsByHierarchy('dog', dogFoodCategoryId)
const catFood = await getProductsByHierarchy('cat', catFoodCategoryId)

// Combine results for comparison
const allFood = [...dogFood.data, ...catFood.data]
```

### Example 3: Featured Products per Animal

```typescript
// Create animal cards with featured products
const animals = await getAnimals()
for (const animal of animals) {
  const featured = await getFeaturedProductsForAnimal(animal.name, 4)
  // Display featured products on animal card
}
```

### Example 4: Get Brands for Animal

```typescript
// When user browses cat products, show relevant brands
const catBrands = await getBrandsForAnimalHierarchy('cat')
// [{ name: 'Whiskas', ... }, { name: 'Purina Pro Plan', ... }]

// Use in filters
const filtered = await getProductsByHierarchy('cat', categoryId, undefined, {
  brands: catBrands.map(b => b.id)
})
```

---

## Migration Guide

### Step 1: Run Database Migration

```bash
# Execute the migration script
psql -U postgres -d your_db < scripts/027-hierarchical-product-model.sql
```

### Step 2: Verify Schema

```sql
-- Check animals table exists
SELECT COUNT(*) FROM animals;
-- Result: 4 (cat, dog, bird, other)

-- Check products have animal_id column
SELECT COUNT(*) FROM products WHERE animal_id IS NOT NULL;
-- Result: should increase after migration

-- Check subcategories table exists
SELECT COUNT(*) FROM subcategories;
-- Result: should reflect your subcategories
```

### Step 3: Migrate Existing Data

```sql
-- Run migration helper function
SELECT migrate_products_to_new_model();
-- This maps existing animal_type values to animal_id
```

### Step 4: Seed Subcategories (Optional)

```typescript
// If you want to organize existing categories into subcategories
const subcategories = [
  { categoryId: 'toys-id', name: 'Interactive', animal_type: null },
  { categoryId: 'toys-id', name: 'Outdoor', animal_type: null },
  { categoryId: 'food-id', name: 'Dry Food', animal_type: 'cat' },
  // ... more subcategories
]

for (const sub of subcategories) {
  await supabase
    .from('subcategories')
    .insert(sub)
}
```

### Step 5: Test Functions

```typescript
// Test each function with sample data
const animals = await getAnimals()
console.log('Animals:', animals)

const categories = await getCategoriesForAnimal('cat')
console.log('Cat categories:', categories)

const products = await getProductsByHierarchy('cat')
console.log('Cat products:', products)
```

---

## Important Rules & Constraints

### Data Integrity

1. **Animal is Mandatory**
   ```sql
   ALTER TABLE products
   ADD CONSTRAINT chk_animal_required 
   CHECK (animal_id IS NOT NULL)
   ```
   Every product must belong to an animal.

2. **Subcategory Requires Category**
   ```typescript
   if (subcategoryId && !categoryId) {
     throw new Error("Subcategory requires a category")
   }
   ```

3. **Category-Animal Match**
   ```sql
   -- Category's animal_type should match product's animal
   -- OR category should be universal (animal_type = NULL)
   ```

### Querying Rules

1. **Always Filter by Animal**
   - `getProductsByHierarchy()` requires `animalType` parameter
   - This enforces animal-first navigation

2. **Category and Subcategory are Optional**
   - Can browse all products for an animal
   - Can drill down by category/subcategory

3. **Brand Filtering Works Across Hierarchy**
   ```typescript
   const products = await getProductsByHierarchy('cat', categoryId, subcategoryId, {
     brands: ['brand1', 'brand2']  // Works at any level
   })
   ```

---

## Performance Considerations

### Indexes

The migration creates indexes on:
- `products(animal_id, category_id, subcategory_id)` - Common query pattern
- `categories(animal_type)` - Category filtering
- `subcategories(category_id, animal_type)` - Hierarchy traversal
- `brand_animals(animal_type)` - Brand filtering

### Query Optimization

```typescript
// Efficient query pattern
const products = await getProductsByHierarchy('cat', catFoodId, subcategoryId, {
  brands: ['brand1'],
  inStock: true,
  sortBy: 'price-asc'
})
// Uses indexes on (animal_id, category_id, subcategory_id)
// Filters on indexed columns
```

### Views

Two views provided for convenience:

```sql
-- 1. Complete product hierarchy view
products_with_hierarchy - all fields with joined animal/category/subcategory/brand info

-- 2. Animal-specific view
products_by_animal - only products with animal_id set
```

---

## Validation

### Product Hierarchy Validation

```typescript
const validation = await validateProductHierarchy(productId)

if (!validation.isValid) {
  console.error('Product hierarchy errors:', validation.errors)
  // Errors might include:
  // - "Product must have an animal_id"
  // - "Category not found"
  // - "Subcategory doesn't belong to category"
}
```

---

## FAQs

**Q: Can I have products without a category?**
A: Yes! Category is optional. A product can exist with just an animal.

**Q: What if I don't want to use subcategories?**
A: Skip them! Use just animal → category → products. Subcategory is optional.

**Q: How do I handle brands?**
A: Brand is optional. Use `brandId` when available. Use `getBrandsForAnimalHierarchy()` to get animal-specific brands.

**Q: What happens to old products without animalId?**
A: The migration function maps them based on existing `animal_type` field. Then you can enhance them with categories/subcategories.

**Q: Can categories be used across multiple animals?**
A: Yes! Set `animal_type = NULL` to make a category universal. It will appear for all animals.

**Q: How do I display this in the UI?**
A: Use the API functions to fetch appropriate data:
- `getAnimals()` → Show animal selector/navigation
- `getCategoriesForAnimal()` → Show categories for selected animal
- `getSubcategoriesForCategory()` → Show subcategories (if any)
- `getProductsByHierarchy()` → Show products with filters

---

## Next Steps

1. ✅ Run the migration script
2. ✅ Verify schema changes
3. ✅ Test API functions with sample data
4. ⏳ Update UI components to use new functions
5. ⏳ Create animal-centric pages (`/animals/[type]`)
6. ⏳ Update category pages to show subcategories
7. ⏳ Add breadcrumb navigation showing animal → category → subcategory

