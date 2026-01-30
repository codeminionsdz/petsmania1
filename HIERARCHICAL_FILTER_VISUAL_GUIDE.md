# Hierarchical Filter - Visual Implementation Guide

**Status**: ✅ COMPLETE  
**Date**: January 28, 2026

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                      Page Component                              │
│                  (e.g., /app/cats/page.tsx)                      │
└──────────────────┬───────────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ↓                     ↓
    ┌─────────┐          ┌──────────┐
    │ Fetch   │          │ Fetch    │
    │ Data    │          │ Products │
    └────┬────┘          └────┬─────┘
         │                    │
         ├─ Categories        │
         ├─ Subcategories     │
         └─ Brands            │
                   │
        ┌──────────┴──────────┐
        │                     │
        ↓                     ↓
┌──────────────────┐  ┌──────────────────┐
│ ProductFilters   │  │ ProductGrid      │
└────────┬─────────┘  └──────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ HierarchicalFilter               │
│                                  │
│ ┌─ Level 1: Animal ────────────┐ │
│ │ [🐱] [🐕] [🐦] [🐾]         │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌─ Level 2: Categories ────────┐ │
│ │ □ Food                        │ │
│ │ □ Toys                        │ │
│ │ □ Healthcare                  │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌─ Level 3: Subcategories ─────┐ │
│ │ □ Dry Food                    │ │
│ │ □ Wet Food                    │ │
│ │ □ Treats                      │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌─ Level 4: Brands ────────────┐ │
│ │ □ Whiskas                     │ │
│ │ □ Purina                      │ │
│ │ □ Royal Canin                 │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌─ Price & Stock ──────────────┐ │
│ │ $0 ─────●────────── $1000    │ │
│ │ □ In stock only              │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
         │
         ↓
    onFilterChange()
         │
         ↓
    Update query parameters
         │
         ↓
    Fetch filtered products
         │
         ↓
    Update ProductGrid
```

---

## Component State Flow

```
┌────────────────────────────────────┐
│     HierarchicalFilter State       │
├────────────────────────────────────┤
│                                    │
│  selectedAnimal: 'cat' | null      │
│       │                            │
│       ├─ Effect 1: Filter cats     │
│       │  categories                │
│       │       │                    │
│       │       ├─ availableCategories
│       │       │                    │
│       └───────┴────────────────────┘
│                │                   │
│  selectedCategories: ['food']      │
│       │                            │
│       ├─ Effect 2: Filter food     │
│       │  subcategories             │
│       │       │                    │
│       │       ├─ availableSubcats   │
│       │       │                    │
│       └───────┴────────────────────┘
│                │                   │
│  selectedSubcategories:            │
│  ['dry-food']                      │
│       │                            │
│       ├─ Effect 3: Update parent   │
│       │  filter state              │
│       │                            │
│       └────────────────────────────┘
│                │                   │
│  selectedBrands: ['whiskas']       │
│       │                            │
│       └─ Effect 3: Update parent   │
│          filter state              │
│                │                   │
└────────────────┼───────────────────┘
                 │
                 ↓
         onFilterChange()
              │
              ├─ animalType: 'cat'
              ├─ categories: ['food']
              ├─ subcategories: ['dry-food']
              └─ brands: ['whiskas']
```

---

## Data Fetching Flow

```
Page Load
    │
    ├─ GET /api/categories
    │  └─ getCategoriesForAnimal('cat')
    │     → Returns [Food, Toys, Healthcare]
    │
    ├─ GET /api/subcategories
    │  └─ getAllSubcategories()
    │     → Returns [Dry Food, Wet Food, Treats, Toys, ...]
    │
    ├─ GET /api/brands
    │  └─ getBrandsForAnimal('cat')
    │     → Returns [Whiskas, Purina, Royal Canin]
    │
    └─ GET /api/products?animal=cat&page=1
       └─ Paginated results
          → Products list with pagination info

User Selects Filters
    │
    ├─ Animal: 'cat' → Filter categories client-side
    │
    ├─ Category: 'food' → Filter subcategories client-side
    │
    ├─ Subcategory: 'dry-food' → Call API for brands
    │  └─ GET /api/animals/cat/brands?
    │        categories=food&
    │        subcategories=dry-food
    │     → Returns updated brand list
    │
    └─ Brand: 'whiskas' → Fetch products
       └─ GET /api/animals/cat/products?
            categories=food&
            subcategories=dry-food&
            brands=whiskas&
            page=1
          → Returns filtered products
```

---

## useEffect Chain Sequence

```
1. Component Mount
   │
   └─ Effect: Animal Selection Change
      └─ Dependency: [state.selectedAnimal, allCategories]
         ├─ Filter categories by animal
         ├─ Clear categories selection
         ├─ Update availableCategories
         └─ Trigger Effect 2

2. Effect 2: Category Selection Change
   └─ Dependency: [state.selectedCategories, allSubcategories, state.selectedAnimal]
      ├─ Filter subcategories by categories + animal
      ├─ Remove invalid subcategories
      ├─ Update availableSubcategories
      └─ Trigger Effect 3

3. Effect 3: State Change → Parent Update
   └─ Dependency: [
        state.selectedAnimal,
        state.selectedCategories,
        state.selectedSubcategories,
        state.selectedBrands
      ]
      ├─ Build FilterOptions object
      ├─ Call onFilterChange(filters)
      └─ Parent component fetches products

4. Effect 4: Brands Update (Optional)
   └─ Dependency: [allBrands]
      └─ Update availableBrands (simple assignment)
```

---

## Filter Selection States

```
┌─────────────────────────────────────────────────────────┐
│ State 1: No Selection                                   │
├─────────────────────────────────────────────────────────┤
│ Animal: ○ Cat  ○ Dog  ○ Bird  ○ Other                  │
│ Categories: [Hidden]                                    │
│ Subcategories: [Hidden]                                 │
│ Brands: [Hidden]                                        │
│ Helper: "Select an animal to view categories"           │
└─────────────────────────────────────────────────────────┘
                        │
                        │ Click Cat
                        ↓
┌─────────────────────────────────────────────────────────┐
│ State 2: Animal Selected                                │
├─────────────────────────────────────────────────────────┤
│ Animal: ● Cat  ○ Dog  ○ Bird  ○ Other                  │
│ Categories: ▼ [Visible]                                 │
│   □ Food                                                │
│   □ Toys                                                │
│   □ Healthcare                                          │
│ Subcategories: [Hidden]                                 │
│ Brands: ▼ [Visible]                                     │
│   □ Whiskas                                             │
│   □ Purina                                              │
│   □ Royal Canin                                         │
│ Helper: "Select a category to view subcategories"       │
└─────────────────────────────────────────────────────────┘
                        │
                        │ Check Food
                        ↓
┌─────────────────────────────────────────────────────────┐
│ State 3: Category Selected                              │
├─────────────────────────────────────────────────────────┤
│ Animal: ● Cat  ○ Dog  ○ Bird  ○ Other                  │
│ Categories: ▼ [Visible]                                 │
│   ☑ Food                                                │
│   □ Toys                                                │
│   □ Healthcare                                          │
│ Subcategories: ▼ [Visible]                              │
│   □ Dry Food                                            │
│   □ Wet Food                                            │
│   □ Treats                                              │
│ Brands: ▼ [Visible - Updated]                           │
│   □ Whiskas                                             │
│   □ Purina                                              │
│   □ Royal Canin                                         │
└─────────────────────────────────────────────────────────┘
                        │
                        │ Check Dry Food
                        ↓
┌─────────────────────────────────────────────────────────┐
│ State 4: Subcategory Selected                           │
├─────────────────────────────────────────────────────────┤
│ Animal: ● Cat  ○ Dog  ○ Bird  ○ Other                  │
│ Categories: ▼ [Visible]                                 │
│   ☑ Food                                                │
│   □ Toys                                                │
│   □ Healthcare                                          │
│ Subcategories: ▼ [Visible]                              │
│   ☑ Dry Food                                            │
│   □ Wet Food                                            │
│   □ Treats                                              │
│ Brands: ▼ [Visible - Refined]                           │
│   □ Whiskas                                             │
│   ☑ Purina                                              │
│   □ Royal Canin                                         │
│                                                         │
│ ✓ Products now filtered by:                             │
│   • Animal: Cat                                         │
│   • Category: Food                                      │
│   • Subcategory: Dry Food                               │
│   • Brand: Purina                                       │
└─────────────────────────────────────────────────────────┘
```

---

## Event Handler Flow

```
User Action
    │
    ├─ Click Animal Button
    │  └─ handleAnimalChange(animal)
    │     └─ setState(selectedAnimal)
    │        └─ Trigger Effect 1
    │           └─ availableCategories updated
    │
    ├─ Check Category
    │  └─ handleCategoryChange(categoryId, true)
    │     └─ setState(selectedCategories)
    │        └─ Trigger Effect 2
    │           └─ availableSubcategories updated
    │
    ├─ Check Subcategory
    │  └─ handleSubcategoryChange(subcategoryId, true)
    │     └─ setState(selectedSubcategories)
    │        └─ Trigger Effect 3
    │           └─ Parent fetches products
    │
    ├─ Check Brand
    │  └─ handleBrandChange(brandId, true)
    │     └─ setState(selectedBrands)
    │        └─ Trigger Effect 3
    │           └─ Parent filters products
    │
    └─ Click Clear All
       └─ handleClear()
          └─ setState({...reset all})
             └─ Trigger Effect 3
                └─ Parent fetches all products
```

---

## API Integration Points

```
┌──────────────────────────────────────────────────┐
│ API Integration Points                           │
├──────────────────────────────────────────────────┤
│                                                  │
│ 1. GET /api/categories                           │
│    └─ Use: getCategories()                       │
│       Returns: All categories                    │
│       Called: Once at page load                  │
│                                                  │
│ 2. GET /api/subcategories                        │
│    └─ Use: getAllSubcategories()                 │
│       Returns: All subcategories                 │
│       Called: Once at page load                  │
│                                                  │
│ 3. GET /api/brands                               │
│    └─ Use: getBrands() or                        │
│       getBrandsForAnimalHierarchy(animal)        │
│       Returns: Brands for animal                 │
│       Called: Once at page load                  │
│                                                  │
│ 4. GET /api/animals/[type]/products              │
│    └─ Use: getProductsByHierarchy(...)           │
│       Params: animal, categories, subcategories, │
│               brands, price, sort, page          │
│       Returns: Filtered paginated products       │
│       Called: On every filter change             │
│                                                  │
│ 5. GET /api/brands/for-filter                    │
│    └─ Use: getBrandsForHierarchicalFilter(...)   │
│       Params: animal, categories, subcategories  │
│       Returns: Available brands                  │
│       Called: Optional (if dynamic brand update) │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## Mobile vs Desktop Layout

```
┌──────────────────────────────────────────────┐
│           Desktop (lg:)                       │
├──────────────────────────────────────────────┤
│                                              │
│ ┌─────────────┐  ┌──────────────────────┐   │
│ │   Filters   │  │   Products Grid      │   │
│ │ (Sidebar)   │  │                      │   │
│ │             │  │  [P] [P] [P] [P]     │   │
│ │ ▼ Animals   │  │  [P] [P] [P] [P]     │   │
│ │ ▼ Category  │  │  [P] [P] [P] [P]     │   │
│ │ ▼ Subcats   │  │                      │   │
│ │ ▼ Brands    │  │  Pagination ◄ ►      │   │
│ │ ▼ Price     │  │                      │   │
│ │ □ In Stock  │  └──────────────────────┘   │
│ │             │                              │
│ │ [Clear All] │                              │
│ └─────────────┘                              │
│                                              │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│           Mobile (< lg)                       │
├──────────────────────────────────────────────┤
│                                              │
│ ┌──────────────────────────────────────┐    │
│ │ [Filters]  [Sort ▼]                  │    │
│ │ ┌──────────────────────────────────┐ │    │
│ │ │ 1. Animal Selection              │ │    │
│ │ │ 2. Categories (if available)     │ │    │
│ │ │ 3. Subcategories (if available)  │ │    │
│ │ │ 4. Brands                        │ │    │
│ │ │ 5. Price Range                   │ │    │
│ │ │ 6. Stock Filter                  │ │    │
│ │ │ [Clear All]                      │ │    │
│ │ └──────────────────────────────────┘ │    │
│ └──────────────────────────────────────┘    │
│                                              │
│ ┌──────────────────────────────────────┐    │
│ │   Products Grid (Full Width)         │    │
│ │  [P]                                 │    │
│ │  [P]                                 │    │
│ │  [P]                                 │    │
│ │  Pagination ◄ ►                      │    │
│ └──────────────────────────────────────┘    │
│                                              │
└──────────────────────────────────────────────┘
```

---

## Error & Loading States

```
┌────────────────────────────────────┐
│ Loading Products                   │
├────────────────────────────────────┤
│                                    │
│ Animals: [Loaded]                  │
│ Categories: [Loaded]               │
│ Subcategories: [Loaded]            │
│ Brands: [Loaded]                   │
│                                    │
│ Products: [Loading...]             │
│ ┌──────────────────────────────┐   │
│ │ ◌ ◌ ◌ ◌ ◌ ◌ ◌ ◌ ◌ ◌ ◌ ◌   │   │
│ │ Loading 12 products...        │   │
│ └──────────────────────────────┘   │
│                                    │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ No Products Found                  │
├────────────────────────────────────┤
│                                    │
│ Animals: ● Cat selected            │
│ Categories: ☑ Food selected        │
│ Brands: ☑ Unknown brand selected   │
│                                    │
│ ⚠️ No products found!              │
│                                    │
│ Try adjusting filters:             │
│ • Change category                  │
│ • Select different brand           │
│ • Expand price range               │
│ • Clear some filters               │
│                                    │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ Empty Category                     │
├────────────────────────────────────┤
│                                    │
│ Animals: ● Cat selected            │
│ Categories: □ Toys selected        │
│ Subcategories: [None available]    │
│                                    │
│ ℹ️  This category has no            │
│    subcategories for cats.         │
│                                    │
│    Try another category or         │
│    select a different animal.      │
│                                    │
└────────────────────────────────────┘
```

---

## Browser DevTools View

```
Component Tree:
└─ ProductFilters
   ├─ State: filters
   │  ├─ animalType: "cat"
   │  ├─ categories: ["food"]
   │  ├─ subcategories: ["dry-food"]
   │  └─ brands: ["whiskas"]
   │
   ├─ HierarchicalFilter
   │  ├─ Props:
   │  │  ├─ animals: [...]
   │  │  ├─ allCategories: 45 items
   │  │  ├─ allSubcategories: 180 items
   │  │  └─ allBrands: 25 items
   │  │
   │  └─ State:
   │     ├─ selectedAnimal: "cat"
   │     ├─ selectedCategories: ["food"]
   │     ├─ selectedSubcategories: ["dry-food"]
   │     ├─ selectedBrands: ["whiskas"]
   │     ├─ availableCategories: 8 items
   │     ├─ availableSubcategories: 12 items
   │     └─ availableBrands: 20 items
   │
   ├─ Price Slider
   ├─ Stock Checkbox
   └─ Clear Button

Network Tab:
GET /api/categories → 45 items
GET /api/subcategories → 180 items
GET /api/brands → 25 items
GET /api/animals/cat/products?
    categories=food&
    subcategories=dry-food&
    brands=whiskas&
    page=1 → Products response
```

---

## Checklist for Implementation

- [ ] Create `HierarchicalFilter` component
- [ ] Update `ProductFilters` to use `HierarchicalFilter`
- [ ] Add `getAllSubcategories()` function
- [ ] Add `getBrandsForHierarchicalFilter()` function
- [ ] Update type definitions
- [ ] Update all pages that use ProductFilters
- [ ] Test all filter levels
- [ ] Test cascading behavior
- [ ] Test edge cases
- [ ] Test mobile layout
- [ ] Verify API queries
- [ ] Performance test

---

## Performance Checklist

- [ ] Categories load in < 100ms
- [ ] Subcategories filter in < 50ms
- [ ] Brands update in < 200ms
- [ ] Products query in < 500ms
- [ ] No unnecessary re-renders
- [ ] No memory leaks
- [ ] Smooth animations

