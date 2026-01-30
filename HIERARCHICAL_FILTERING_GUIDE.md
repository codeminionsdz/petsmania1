# Hierarchical Filter Implementation

**Status**: ✅ COMPLETE  
**Date**: January 28, 2026

---

## Overview

The filtering system now follows a strict hierarchical order:

```
Animal → Category → Subcategory → Brand
```

Each level dynamically filters the next, ensuring users only see relevant options at each step.

---

## Filter Hierarchy

### Level 1: Animal Selection
- **User selects**: One animal type (cat, dog, bird, other)
- **Effect**: Categories become available
- **Display**: Categories that match the selected animal or are universal (animal_type = NULL)

### Level 2: Category Selection  
- **User selects**: One or more categories for the selected animal
- **Effect**: Subcategories become available
- **Display**: Subcategories that:
  - Belong to selected categories
  - Match the animal or are universal

### Level 3: Subcategory Selection
- **User selects**: One or more subcategories
- **Effect**: Brands become updated
- **Display**: Brands that have products matching:
  - Selected animal
  - Selected categories
  - Selected subcategories

### Level 4: Brand Selection
- **User selects**: One or more brands
- **Effect**: Products are filtered
- **Display**: Products matching all criteria

---

## Components

### HierarchicalFilter
**Location**: `components/filters/hierarchical-filter.tsx`

Main filter component that manages state and dynamic filtering.

**Props**:
```typescript
interface HierarchicalFilterProps {
  animals: Array<{ value: AnimalType; label: string; emoji: string }>
  allCategories: Category[]
  allSubcategories: Subcategory[]
  allBrands: Brand[]
  filters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
}
```

**Features**:
- Manages hierarchical state (animal → categories → subcategories → brands)
- Automatically clears child levels when parent changes
- Updates available options dynamically
- Only shows relevant options at each level

**State**:
```typescript
interface FilterState {
  selectedAnimal: AnimalType | null
  selectedCategories: string[]
  selectedSubcategories: string[]
  selectedBrands: string[]
}
```

### ProductFilters
**Location**: `components/filters/product-filters.tsx`

Wrapper component that combines hierarchical and additional filters.

**Props**:
```typescript
interface ProductFiltersProps {
  categories?: Category[]
  subcategories?: Subcategory[]
  brands?: Brand[]
  filters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
  maxPrice?: number
}
```

**Includes**:
- Hierarchical filter (Animal → Category → Subcategory → Brand)
- Price range slider
- Stock availability toggle
- Clear all filters button

---

## Dynamic Filtering Logic

### Animal Change Handler

```typescript
const handleAnimalChange = (animal: AnimalType) => {
  setState((prev) => ({
    ...prev,
    selectedAnimal: prev.selectedAnimal === animal ? null : animal,
    // Clear all child levels
    selectedCategories: [],
    selectedSubcategories: [],
    selectedBrands: [],
  }))
}
```

**Effect**:
- Toggles animal selection
- Clears all nested selections
- Triggers category filter update

### Category Change Handler

```typescript
const handleCategoryChange = (categoryId: string, checked: boolean) => {
  setState((prev) => {
    const updated = checked
      ? [...prev.selectedCategories, categoryId]
      : prev.selectedCategories.filter((id) => id !== categoryId)
    return {
      ...prev,
      selectedCategories: updated,
      // Invalid subcategories are cleared automatically by effect
    }
  })
}
```

**Effect**:
- Adds/removes category
- Triggers subcategory filter update
- Invalid subcategories cleared automatically

### Subcategory Change Handler

```typescript
const handleSubcategoryChange = (subcategoryId: string, checked: boolean) => {
  setState((prev) => ({
    ...prev,
    selectedSubcategories: checked
      ? [...prev.selectedSubcategories, subcategoryId]
      : prev.selectedSubcategories.filter((id) => id !== subcategoryId),
  }))
}
```

**Effect**:
- Adds/removes subcategory
- Triggers brand filter update

### Brand Change Handler

```typescript
const handleBrandChange = (brandId: string, checked: boolean) => {
  setState((prev) => ({
    ...prev,
    selectedBrands: checked
      ? [...prev.selectedBrands, brandId]
      : prev.selectedBrands.filter((id) => id !== brandId),
  }))
}
```

**Effect**:
- Adds/removes brand
- Triggers product query update

---

## useEffect Chain (Dynamic Updates)

### Effect 1: Animal → Categories

```typescript
useEffect(() => {
  if (state.selectedAnimal) {
    const relevant = allCategories.filter(
      (cat) =>
        cat.animal_type === state.selectedAnimal ||
        cat.animal_type === null // Universal categories
    )
    setAvailableCategories(relevant)
    
    // Clear nested selections
    setState((prev) => ({
      ...prev,
      selectedCategories: [],
      selectedSubcategories: [],
      selectedBrands: [],
    }))
  } else {
    setAvailableCategories(allCategories)
    setState((prev) => ({
      ...prev,
      selectedCategories: [],
      selectedSubcategories: [],
      selectedBrands: [],
    }))
  }
}, [state.selectedAnimal, allCategories])
```

**Triggers when**:
- Animal selection changes
- All categories list updates

**Updates**:
- Available categories (filtered for animal)
- Clears all child selections

### Effect 2: Categories → Subcategories

```typescript
useEffect(() => {
  if (state.selectedCategories.length > 0) {
    const relevant = allSubcategories.filter(
      (sub) =>
        state.selectedCategories.includes(sub.category_id) &&
        (!state.selectedAnimal ||
          sub.animal_type === state.selectedAnimal ||
          sub.animal_type === null) // Universal subcategories
    )
    setAvailableSubcategories(relevant)
    
    // Remove invalid subcategories
    const validSubcats = state.selectedSubcategories.filter((subId) =>
      relevant.some((s) => s.id === subId)
    )
    setState((prev) => ({
      ...prev,
      selectedSubcategories: validSubcats,
    }))
  } else {
    setAvailableSubcategories([])
    setState((prev) => ({
      ...prev,
      selectedSubcategories: [],
    }))
  }
}, [state.selectedCategories, allSubcategories, state.selectedAnimal])
```

**Triggers when**:
- Selected categories change
- All subcategories list updates
- Animal selection changes

**Updates**:
- Available subcategories (filtered for categories + animal)
- Removes invalid subcategories automatically

### Effect 3: State → Parent Filter

```typescript
useEffect(() => {
  const newFilters: FilterOptions = {
    ...filters,
    animalType: state.selectedAnimal || undefined,
    categories: state.selectedCategories.length > 0 ? state.selectedCategories : undefined,
    subcategories: state.selectedSubcategories.length > 0 ? state.selectedSubcategories : undefined,
    brands: state.selectedBrands.length > 0 ? state.selectedBrands : undefined,
  }
  onFilterChange(newFilters)
}, [state.selectedAnimal, state.selectedCategories, state.selectedSubcategories, state.selectedBrands])
```

**Triggers when**:
- Any filter selection changes

**Updates**:
- Parent component's filter state
- Triggers product query with new filters

---

## Data Flow

### Initial Load

```
1. Page loads
2. Server fetches:
   - allCategories (all active categories)
   - allSubcategories (all active subcategories)
   - allBrands (all active brands)
   - initialProducts (first page)
3. Data passed to ProductFilters
4. HierarchicalFilter renders with empty selections
5. User sees animal buttons and helper text
```

### User Selects Animal

```
1. User clicks animal button
2. handleAnimalChange() updates selectedAnimal
3. Effect 1 triggers → filters categories
4. availableCategories updated
5. UI shows category options for that animal
```

### User Selects Category

```
1. User checks category checkbox
2. handleCategoryChange() updates selectedCategories
3. Effect 2 triggers → filters subcategories
4. availableSubcategories updated
5. UI shows subcategories for selected category/animal
```

### User Selects Subcategory

```
1. User checks subcategory checkbox
2. handleSubcategoryChange() updates selectedSubcategories
3. Effect 3 triggers → updates parent filter
4. onFilterChange() called
5. Products re-queried with new filters
```

### User Selects Brand

```
1. User checks brand checkbox
2. handleBrandChange() updates selectedBrands
3. Effect 3 triggers → updates parent filter
4. onFilterChange() called
5. Products filtered by brand
```

---

## Query Functions

### Get All Subcategories

```typescript
export async function getAllSubcategories(): Promise<Subcategory[]> {
  // Returns all active subcategories for client-side filtering
}
```

**Usage**: Populating the full subcategories list for HierarchicalFilter

### Get Brands for Hierarchical Filter

```typescript
export async function getBrandsForHierarchicalFilter(
  animalType?: AnimalType,
  categoryIds?: string[],
  subcategoryIds?: string[]
): Promise<Brand[]> {
  // Returns only brands that have products matching filters
}
```

**Usage**: Dynamically update available brands based on selections

---

## Integration Examples

### Using ProductFilters in a Page

```typescript
import { ProductFilters } from "@/components/filters/product-filters"
import { getCategories, getAllSubcategories, getBrands } from "@/lib/data"

export default async function CatsPage() {
  const categories = await getCategories()
  const subcategories = await getAllSubcategories()
  const brands = await getBrands()

  return (
    <div className="flex gap-6">
      {/* Filters */}
      <ProductFilters
        categories={categories}
        subcategories={subcategories}
        brands={brands}
        filters={{}}
        onFilterChange={handleFiltersChange}
        maxPrice={50000}
      />
      
      {/* Products */}
      <ProductGrid products={products} />
    </div>
  )
}
```

---

## User Experience

### Smart Filtering

| Action | Effect | User Sees |
|--------|--------|-----------|
| Open page | No animal selected | "Select an animal to view available categories" |
| Select animal | Categories filtered | Category options for that animal |
| Select category | Subcategories filtered | Subcategory options for that category |
| Select subcategory | Brands updated | Available brands with products |
| Change animal | All nested cleared | Back to category selection |
| Change category | Subcategories reset | Valid subcategories only |

### Clear Behavior

- **Clear All**: Resets everything (animal, categories, subcategories, brands)
- **Change Animal**: Clears categories, subcategories, brands automatically
- **Invalid Subcategory**: Removed automatically when category changes
- **No Products**: Category/subcategory shown even if no products (for transparency)

---

## Performance Optimizations

### Client-Side Filtering

- All categories, subcategories, brands fetched once
- Filtering happens in memory on client
- No extra API calls per filter change
- Fast response to user interactions

### Server-Side Filtering

- Products query includes all active filters
- Database query filters by animal → categories → subcategories → brands
- Results are paginated
- Indexes on `animal_id`, `category_id`, `subcategory_id`, `brand_id`

### Data Fetching

```typescript
// Fetched once at page load
const categories = await getCategories()        // All categories
const subcategories = await getAllSubcategories() // All subcategories
const brands = await getBrands()                // All brands

// Fetched per filter change
const products = await getProducts(filters)     // Filtered products
```

---

## TypeScript Interfaces

### FilterState

```typescript
interface FilterState {
  selectedAnimal: AnimalType | null
  selectedCategories: string[]
  selectedSubcategories: string[]
  selectedBrands: string[]
}
```

### FilterOptions

```typescript
interface FilterOptions {
  animalType?: AnimalType
  categories?: string[]
  subcategories?: string[]
  brands?: string[]
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  sortBy?: "price-asc" | "price-desc" | "name" | "newest" | "popular"
}
```

---

## Testing Scenarios

### Basic Hierarchy

- [ ] Select animal → categories appear
- [ ] Select category → subcategories appear
- [ ] Select subcategory → products filter

### Deselection

- [ ] Deselect category → subcategories clear
- [ ] Deselect all categories → no subcategories shown
- [ ] Change animal → all nested selections clear

### Invalid States

- [ ] Category moved to different animal → removed automatically
- [ ] Subcategory moved to different category → removed automatically
- [ ] Brand changes → handled by API query

### Edge Cases

- [ ] Animal with no categories → shows empty message
- [ ] Category with no subcategories → no subcategory section
- [ ] Select category before animal → handled by reset
- [ ] Multiple animals selection → converted to single in HierarchicalFilter

### Multiple Selections

- [ ] Multiple categories → subcategories from all categories shown
- [ ] Multiple subcategories → products from all selected
- [ ] Multiple brands → products with any brand shown

---

## Troubleshooting

### Categories Not Showing After Animal Select

**Cause**: Animal type doesn't match categories' animal_type

**Solution**: 
1. Verify categories have `animal_type = 'cat'` (or other animal)
2. Or create universal categories with `animal_type = NULL`

### Subcategories Not Showing

**Cause**: Subcategories don't belong to selected categories

**Solution**:
1. Verify `category_id` matches selected category
2. Verify `animal_type` matches selected animal or is NULL

### Brands Not Updating

**Cause**: No products with selected filters

**Solution**:
1. Verify products exist with all selected filters
2. Check product `animal_id`, `category_id`, `subcategory_id`, `brand_id`

### Filter Clears on Page Reload

**Expected Behavior**: Filters persist in URL or state manager

**Solution**: 
1. Add query parameters to URL when filters change
2. Or use browser localStorage for persistence
3. Parse URL on page load to restore filters

---

## Future Enhancements

1. **URL Persistence**: Encode filters in query parameters
2. **Filter History**: Remember previous filter states
3. **Saved Filters**: Allow users to save filter combinations
4. **Advanced Filters**: Add more filter types (color, size, ratings, etc.)
5. **Filter Presets**: Common filter combinations (e.g., "Budget Friendly", "Premium")
6. **Analytics**: Track which filters are most used

---

## File Structure

```
components/filters/
├─ hierarchical-filter.tsx     # Hierarchical filter component
├─ product-filters.tsx         # Main filter wrapper
└─ animal-type-filter.tsx      # Legacy animal filter (deprecated)

lib/
├─ data.ts                     # Query functions
│  ├─ getAllSubcategories()
│  ├─ getCategoriesForAnimal()
│  ├─ getSubcategoriesForCategory()
│  ├─ getBrandsForHierarchicalFilter()
│  └─ getProductsByHierarchy()
└─ types.ts                    # Type definitions
   ├─ FilterOptions
   ├─ FilterState
   ├─ Category
   ├─ Subcategory
   └─ Brand
```

---

## Support

For issues or questions:
1. Review the filter implementation in `components/filters/hierarchical-filter.tsx`
2. Check data fetching in `lib/data.ts`
3. Verify database schema has correct fields
4. Check browser console for errors
5. Verify type definitions in `lib/types.ts`

