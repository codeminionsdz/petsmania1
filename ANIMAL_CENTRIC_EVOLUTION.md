# Pet-Centric E-Commerce Architecture Evolution

## Current State (Category-First Model)

### Database Structure
```
Products → Categories (with hierarchy: parent/child)
         → Brands (shared)
         → animal_type (ENUM: cat, dog, bird, other) [recently added]
```

**Flow**: Browse Categories → See Products → Filter by Animal Type

### Key Components
- **Homepage**: Shows 4 main categories in grid
- **Category Page** (`/categories/[slug]`): Lists products in category
- **Filters**: Brand, Price, Stock, Animal Type (secondary)
- **Animal Categories Section**: Card-based animal shortcuts (NEW)

**Limitations**:
- Animal type is an afterthought on products
- Categories don't know which animals they're for
- Brands aren't scoped to animals
- Navigation is category-first, not animal-first

---

## Target State (Animal-Centric Model)

### Database Structure
```
Animals (cat, dog, bird, other)
  ↓
Categories (pet-relevant for each animal)
  ↓
Products (filtered by animal + category)
  ↓
Brands (scoped to animal context)
```

**Flow**: Browse Animals → Explore Their Categories → View Products → Filter by Brand

### Key Changes

#### 1. **Animal as First-Class Entity**
- Each animal has own page: `/animals/[type]`
- Each animal shows:
  - Its relevant categories
  - Its relevant brands
  - All products for that animal
  - Filters within animal context

#### 2. **Categories Become Animal-Specific**
- Categories map to animals (one or more)
- "Cat Food" appears under Cats, not under generic Food
- Hierarchy preserved but scoped: Animal → Main Category → Subcategory

#### 3. **Brands Filtered by Animal**
- Homepage shows brands relevant to selected animal
- Brand pages filtered by animal
- "Top 5 Brands for Cats" vs "Top 5 Brands for Dogs"

#### 4. **Backward Compatible**
- Products without `animal_type` (NULL) appear in all animals
- Existing categories work as-is
- Links to old category pages still function
- Graceful degradation

---

## Implementation Roadmap

### Phase 1: Data Layer Evolution
**Goal**: Make queries animal-aware without breaking existing code

**Changes**:
1. Create categories-to-animals mapping (junction table)
2. Update `getCategories()` to accept `animalType` parameter
3. Add `getBrandsForAnimal(animalType)` function
4. Update product queries to be animal-filtered

**Files to create**:
- `scripts/026-add-animal-categories-mapping.sql`
- Data layer extensions

### Phase 2: Page Structure
**Goal**: Create animal-centric navigation

**Changes**:
1. Create `/animals/[type]` page (new endpoint)
2. Update homepage to feature animals prominently
3. Add animal context to all pages
4. Create animal sidebar/context

**Files to create/update**:
- `app/animals/[type]/page.tsx`
- `components/animals/animal-page-content.tsx`
- Update `home-content.tsx`

### Phase 3: Component Refactoring
**Goal**: Update UI to reflect animal-first navigation

**Changes**:
1. Update `ProductFilters` to scope brands by animal
2. Add animal selector/tabs to product pages
3. Update breadcrumbs to include animal context
4. Refactor category cards for animal context

**Files to update**:
- `components/filters/product-filters.tsx`
- `components/category/`
- `components/layout/breadcrumbs.tsx`

### Phase 4: Navigation & UX
**Goal**: Make animal-first navigation intuitive

**Changes**:
1. Update header to show animal selector
2. Update navigation to animal-centric
3. Add animal badges to products
4. Update search to be animal-aware

**Files to update**:
- `components/layout/header.tsx`
- `components/layout/navigation.tsx`

---

## Data Model Details

### Categories Table (Enhanced)
```sql
-- New column for primary animal
ALTER TABLE categories ADD COLUMN primary_animal_type VARCHAR(20);

-- Index for animal-specific queries
CREATE INDEX idx_categories_animal ON categories(primary_animal_type);

-- Allow categories to apply to multiple animals via junction table
CREATE TABLE category_animals (
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  animal_type VARCHAR(20) CHECK (animal_type IN ('cat', 'dog', 'bird', 'other')),
  PRIMARY KEY (category_id, animal_type)
);
```

### Query Evolution
```typescript
// OLD: Get all categories
const categories = await getCategories();

// NEW: Get categories for specific animal
const catCategories = await getCategoriesByAnimal('cat');

// NEW: Get categories across all animals
const allCategories = await getCategories();
```

---

## Backward Compatibility Strategy

### Rule 1: NULL Products Appear Everywhere
Products without `animal_type`:
- Show in all animal pages
- Show in all category pages
- Show in search results
- Show in all filters

### Rule 2: Old Category Links Still Work
```
/categories/pet-food → still works
  Redirect or display:
    Show "Food for All Pets" with filters for each animal
```

### Rule 3: Graceful Degradation
- If no animal specified, show all products
- If no categories exist for animal, show all categories
- If brand not in animal, still show it as available

### Rule 4: No Breaking Changes to APIs
- Existing `getProducts()` still works
- Existing `getCategories()` still works
- Add new functions alongside old ones
- Deprecate in future versions

---

## Benefits of This Evolution

### For Users
✅ **Intuitive Navigation**: Start with their pet
✅ **Relevant Results**: Categories for cats, not generic
✅ **Simpler Browsing**: Filter by pet type first, everything else second
✅ **Better Personalization**: "Products for Cats" vs "Products in Category"

### For Business
✅ **Pet-Focused**: Marketing around animals, not categories
✅ **Scalability**: Easy to add new pets (reptiles, fish, hamsters)
✅ **Brand Partnerships**: Brands can be featured per-animal
✅ **Promotions**: "Cat Week" features cat-specific deals

### For Technical
✅ **Clear Hierarchy**: Animal → Category → Product
✅ **Query Efficiency**: Indexes on animal_type + category
✅ **Data Consistency**: All queries respect animal context
✅ **Extensibility**: Easy to add animal-specific logic

---

## Phased Rollout Timeline

| Phase | Duration | Dependencies | Status |
|-------|----------|--------------|--------|
| Phase 1 (Data Layer) | 2 days | None | Ready to start |
| Phase 2 (Pages) | 2 days | Phase 1 complete | Follows Phase 1 |
| Phase 3 (Components) | 2 days | Phase 2 complete | Follows Phase 2 |
| Phase 4 (Navigation) | 1 day | Phase 3 complete | Final refinement |

---

## Start Point: Phase 1 - Data Layer Evolution

### Immediate Actions
1. ✓ Document existing schema (DONE)
2. → Create categories-to-animals mapping table
3. → Add animal awareness to query functions
4. → Test backward compatibility

### No Frontend Changes Yet
- Keep homepage as-is
- Keep category pages as-is
- Just improve query layer

This approach ensures:
- Zero breaking changes during Phase 1
- Data structure ready for Phase 2
- Existing features continue working
- Foundation solid before UI refactor

---

## Questions to Resolve

1. **Should all categories map to animals or just pet-relevant ones?**
   - Recommended: Create animal-specific categories (e.g., "Cat Food", "Dog Toys")
   - Keep non-pet categories unscoped for flexibility

2. **What about products in multiple animals?**
   - Allow products to appear under multiple animals
   - Example: Generic pet carrier works for all animals
   - Use `OR` in queries similar to current NULL handling

3. **Should we maintain old category structure?**
   - Yes, for backward compatibility
   - Add animal scoping alongside existing structure
   - Migrate gradually

---

