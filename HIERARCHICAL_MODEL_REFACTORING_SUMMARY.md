# Product Data Model Refactoring - Summary

## What Changed

The product data model has been refactored to support a clean **hierarchical structure**:

```
Animal (Mandatory) → Category (Optional) → Subcategory (Optional) → Products
                  → Brand (Optional)
```

---

## Key Changes

### 1. Database Schema

| Component | Change | Impact |
|-----------|--------|--------|
| **Animals Table** | NEW | Top-level categorization for navigation |
| **Categories Table** | Enhanced | Added `animal_type`, `level`, `display_order`, `is_active` |
| **Subcategories Table** | NEW | Fine-grained categorization within categories |
| **Products Table** | Enhanced | Added `animal_id` (mandatory), `subcategory_id` |
| **Brand Animals Table** | NEW | Many-to-many relationship: brands ↔ animals |

### 2. TypeScript Types

**New Types**:
- `AnimalType` - Enum type: "cat" | "dog" | "bird" | "other"
- `Animal` - Animal record with name, slug, displayName, emoji
- `Subcategory` - Subcategory record with parent category reference
- `BrandAnimal` - Brand-to-animal association

**Updated Types**:
- `Product` - Now includes `animalId` (mandatory), category hierarchy, cleaner structure
- `Category` - Now includes `level`, `animalType`, `displayOrder`, `isActive`
- `Brand` - Now includes optional `animalTypes[]`
- `FilterOptions` - Added `subcategories`, improved animal filtering

### 3. Data Layer Functions

**New Functions** (all in `lib/data.ts`):

| Function | Purpose |
|----------|---------|
| `getAnimals()` | Get all active animals |
| `getAnimalBySlug(slug)` | Get single animal by slug |
| `getCategoriesForAnimal(type)` | Get categories for specific animal (includes universal) |
| `getSubcategoriesForCategory(categoryId, animalType?)` | Get subcategories within category |
| `getProductsByHierarchy(animal, category?, subcategory?, options?)` | Main product browse function |
| `getBrandsForAnimalHierarchy(animalType)` | Get brands with products for animal |
| `getFeaturedProductsForAnimal(animalType, limit?)` | Get featured products for animal |
| `validateProductHierarchy(productId)` | Validate product hierarchy structure |

**Updated Functions**:
- All existing functions (`getProducts`, `getCategoriesWithHierarchy`, etc.) continue to work unchanged
- New transformation functions handle both old and new data formats

---

## Rules & Constraints

### Mandatory Rules
1. **Animal is required** - Every product must have an `animal_id`
2. **Subcategory requires category** - Can't have subcategory without category
3. **Category-animal match** - Category's animal_type should match product's animal (or be NULL)

### Optional Elements
1. **Category is optional** - Products can exist without a category
2. **Subcategory is optional** - Products can exist with just a category
3. **Brand is optional** - Products don't need a brand

### Data Flow Example
```
✅ Animal → Category → Subcategory → Product (complete hierarchy)
✅ Animal → Category → Product (skip subcategory)
✅ Animal → Product (skip both category and subcategory)
❌ Category → Product (missing mandatory animal)
❌ Subcategory → Product (subcategory requires category)
```

---

## Files Modified

### Database Migrations
- **NEW**: `scripts/027-hierarchical-product-model.sql` (400+ lines)
  - Creates `animals` table with 4 initial records
  - Adds columns to `categories` table
  - Creates `subcategories` table with proper indexes
  - Creates `brand_animals` junction table
  - Creates views for convenient querying
  - Creates migration helper function
  - Adds data integrity constraints

### TypeScript
- **UPDATED**: `lib/types.ts`
  - Added `AnimalType` type
  - Added `Animal` interface
  - Added `Subcategory` interface
  - Added `BrandAnimal` interface
  - Updated `Product` interface with hierarchical fields
  - Updated `Category` interface with animal awareness
  - Updated `Brand` interface with animal associations
  - Updated `FilterOptions` interface

### Data Layer
- **UPDATED**: `lib/data.ts` (300+ new lines)
  - Enhanced `transformProduct()` for new hierarchy
  - Added `transformSubcategory()`
  - Added `transformAnimal()`
  - Added 8 new query functions
  - All functions include error handling and backward compatibility

### Documentation
- **NEW**: `HIERARCHICAL_PRODUCT_MODEL.md` (600+ lines)
  - Complete data model documentation
  - Usage examples
  - Migration guide
  - FAQ section
  
- **NEW**: `HIERARCHICAL_IMPLEMENTATION_GUIDE.md` (500+ lines)
  - Step-by-step implementation
  - Component examples
  - Testing checklist
  - Troubleshooting guide

---

## Backward Compatibility

### ✅ Fully Backward Compatible

1. **Existing products continue to work**
   - Old products without `animal_id` are migrated via helper function
   - Mapped from existing `animal_type` field
   - No data loss

2. **Old query functions unchanged**
   ```typescript
   // These still work exactly as before:
   getProducts()
   getCategoriesWithHierarchy()
   getProductsByCategory(slug)
   getProductsByBrand(slug)
   ```

3. **New and old functions coexist**
   - Use old functions for legacy code
   - Use new functions for new features
   - Mix and match as needed

4. **Universal categories**
   - Categories with `animal_type = NULL` appear for all animals
   - Ensures existing categories continue to work

---

## Benefits

### Better UX
- **Animal-first navigation** - Users pick their pet type first
- **Organized browsing** - Clear hierarchy: animal → category → subcategory
- **Flexible organization** - Skip levels if not needed

### Better Data Organization
- **Logical grouping** - Products belong to specific animals
- **Scalability** - Easy to add new animals or categories
- **Type safety** - Strong TypeScript types enforce structure

### Better Performance
- **Indexed queries** - Indexes on all common query patterns
- **Efficient filtering** - Animal filter reduces query scope
- **Pagination ready** - All functions support pagination

### Better Maintainability
- **Clear constraints** - Business rules enforced at database level
- **Validation helpers** - Check product hierarchy validity
- **Comprehensive docs** - Usage examples and troubleshooting

---

## Implementation Checklist

### Database Setup
- [ ] Run migration: `scripts/027-hierarchical-product-model.sql`
- [ ] Verify tables and columns created
- [ ] Run migration helper to populate `animal_id`
- [ ] Verify all products have `animal_id` set

### Code Integration
- [ ] Update TypeScript types (already done in `lib/types.ts`)
- [ ] Update data layer (already done in `lib/data.ts`)
- [ ] Verify no TypeScript errors: `npm run type-check`
- [ ] Test all new functions in browser console

### UI Implementation
- [ ] Create Animal Selector component
- [ ] Create Category Browser component
- [ ] Create Product List component with hierarchy support
- [ ] Create `/animals/[type]` page
- [ ] Create `/animals/[type]/[categoryId]` page
- [ ] Update navigation to animal-first

### Testing
- [ ] Database schema verification
- [ ] Data layer function testing
- [ ] Component rendering
- [ ] Hierarchy validation
- [ ] Backward compatibility verification
- [ ] Performance testing

---

## Migration Path

### Phase 1: Database (Immediate)
```bash
# Execute migration script
psql < scripts/027-hierarchical-product-model.sql

# Populate animal_id from existing animal_type
SELECT migrate_products_to_new_model();
```

### Phase 2: Code Integration (Today)
```bash
# Update types and data layer
# Already done in lib/types.ts and lib/data.ts

# Verify TypeScript compilation
npm run type-check
```

### Phase 3: UI Implementation (Next)
```
1. Create animal pages (/animals/[type])
2. Create category browsing
3. Update navigation
4. Test complete flows
```

### Phase 4: Admin Updates (After)
```
1. Update product creation form
   - Select animal (mandatory)
   - Select category (optional)
   - Select subcategory (optional)
   - Select brand (optional)
2. Add category management UI
3. Add subcategory management UI
```

---

## Key Differences: Old vs New

### Before (Category-First)
```
Homepage
  ├─ All Categories (Toys, Food, Health, Accessories)
  └─ Products
      └─ Filter by: Category, Brand, Animal (secondary), Price
```

Query:
```typescript
const products = await getProducts({
  categories: ['toy-id'],
  animalTypes: ['cat'],
  sortBy: 'price-asc'
})
```

### After (Animal-First)
```
Homepage
  ├─ Animals (🐱 Cats, 🐕 Dogs, 🐦 Birds, 🐾 Other)
  └─ /animals/cat
      ├─ Categories (Toys, Food, Health - for cats only)
      └─ /animals/cat/toys
          ├─ Subcategories (Interactive, Scratchers, etc.)
          └─ Products (with animal context)
```

Query:
```typescript
const products = await getProductsByHierarchy(
  'cat',           // Animal is primary
  'toys-id',       // Category is secondary
  'interactive-id', // Subcategory is tertiary
  {
    brands: ['brand1'],
    sortBy: 'price-asc'
  }
)
```

---

## Database Example

### Animals
```
id    | name | slug | display_name | emoji | featured | is_active
------|------|------|--------------|-------|----------|----------
uuid1 | cat  | cat  | Cats         | 🐱    | true     | true
uuid2 | dog  | dog  | Dogs         | 🐕    | true     | true
uuid3 | bird | bird | Birds        | 🐦    | true     | true
uuid4 | other| other| Other Pets   | 🐾    | false    | true
```

### Categories (Enhanced)
```
id    | name | animal_type | level | parent_id | display_order
------|------|-------------|-------|-----------|---------------
cat1  | Toys | NULL        | 1     | NULL      | 1          (universal)
cat2  | Food | NULL        | 1     | NULL      | 2          (universal)
cat3  | Toys | cat         | 1     | NULL      | 1          (cat-specific)
cat4  | Food | dog         | 1     | NULL      | 1          (dog-specific)
```

### Subcategories (New)
```
id    | name             | category_id | animal_type | display_order
------|-----------------|-------------|-------------|---------------
sub1  | Interactive     | cat1        | NULL        | 1
sub2  | Scratchers      | cat1        | cat         | 2
sub3  | Chew Toys       | cat1        | dog         | 3
sub4  | Dry Food        | cat2        | NULL        | 1
sub5  | Wet Food        | cat2        | cat         | 2
```

### Products (Updated)
```
id    | name       | animal_id | category_id | subcategory_id | brand_id
------|------------|-----------|-------------|----------------|----------
p1    | Cat Toy    | uuid1     | cat1        | sub1            | b1
p2    | Dog Toy    | uuid2     | cat1        | sub3            | b2
p3    | Cat Food   | uuid1     | cat2        | sub5            | b3
p4    | Dog Food   | uuid2     | cat2        | NULL            | b4
```

---

## Next Steps

1. ✅ **Database Migration** - Run the SQL script
2. ✅ **Code Integration** - Types and functions updated
3. ⏳ **UI Implementation** - Create animal pages and components
4. ⏳ **Admin Updates** - Update product/category forms
5. ⏳ **Navigation** - Update header to animal-first
6. ⏳ **Testing** - Full end-to-end testing

---

## Support

For questions or issues:
1. Check `HIERARCHICAL_PRODUCT_MODEL.md` for data model details
2. Check `HIERARCHICAL_IMPLEMENTATION_GUIDE.md` for implementation guide
3. Review database views in migration script for query examples
4. Test functions in browser console before full implementation

