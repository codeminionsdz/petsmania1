# Admin Product Creation - Hierarchical Flow Refactor

**Status**: ✅ COMPLETE  
**Date**: January 28, 2026

---

## Overview

The admin product creation flow has been refactored to enforce the same hierarchical structure as the filtering system:

```
Animal → Category → Subcategory → Brand
```

This prevents invalid product combinations and provides a better admin experience.

---

## What Changed

### Before ❌
- Admin selected main category first
- Subcategories shown for selected main category
- Animal type was optional and separate
- No validation of category/animal matching
- Brands shown regardless of animal

### After ✅
- Admin selects animal first
- Categories filtered for that animal
- Subcategories filtered for category + animal
- Brands filtered for animal
- Invalid combinations prevented automatically

---

## Components

### ProductHierarchicalSelector
**Location**: `components/admin/product-hierarchical-selector.tsx`

New component that manages the 4-level hierarchical selection.

**Props**:
```typescript
interface ProductHierarchicalSelectorProps {
  animals: Array<{ value: AnimalType; label: string }>
  categories: Category[]
  subcategories: Subcategory[]
  brands: Brand[]
  onSelectionChange: (selection: ProductHierarchicalSelection) => void
  loading?: boolean
}
```

**Selection State**:
```typescript
interface ProductHierarchicalSelection {
  animalId: AnimalType | ""
  categoryId: string
  subcategoryId: string
  brandId: string
}
```

**Features**:
- 4-step hierarchical selection
- Smart filtering at each level
- Automatic cascading
- Helper text for admin guidance
- Validation summary
- Error alerts for invalid combinations

---

## Updated Page

**Location**: `app/admin/products/new/page.tsx`

**Changes**:
- Imports `ProductHierarchicalSelector`
- Fetches subcategories from new API endpoint
- Uses hierarchical selection state
- Validates animal and category (required)
- Passes animalId and subcategoryId to API

**Form Data Flow**:
```
Product Creation Form
    ↓
Hierarchical Selector (Animal → Category → Subcategory → Brand)
    ↓
Form submission with:
    - animalId (required)
    - categoryId (required)
    - subcategoryId (optional)
    - brandId (optional)
```

---

## New API Endpoint

**Location**: `app/api/subcategories/route.ts`

**Purpose**: Fetch all active subcategories for the form

**Response**:
```typescript
Subcategory[]
```

**Transform**: Returns both camelCase and snake_case field names for compatibility

---

## Filter Behavior

### Level 1: Animal
- Admin selects one animal (cat, dog, bird, other)
- No default selection
- Clears all dependent selections if changed

### Level 2: Category
- Shows only categories for selected animal
- Includes universal categories (animal_type = NULL)
- Only main categories (no parent_id)
- Clears subcategory and brand if changed

### Level 3: Subcategory
- Shows only subcategories for selected category + animal
- Optional (only shown if available)
- Category must be selected first
- Clears brand if changed

### Level 4: Brand
- Shows all brands for selected animal
- Optional (admin can skip)
- Only shown if animal selected
- Always available (doesn't clear other selections)

---

## Validation

### Required Fields
- ✅ Animal (enforced by selector)
- ✅ Category (enforced by selector)
- ✅ Product name (existing validation)
- ✅ Price (existing validation)
- ✅ Stock (existing validation)

### Optional Fields
- Subcategory (only shown if available)
- Brand (optional)

### Validation Errors
- No animal selected → "Veuillez sélectionner un animal"
- No category available → "Aucune catégorie disponible pour l'animal sélectionné"
- No category selected → "Veuillez sélectionner une catégorie"

---

## Data Flow

### Page Load
```
1. Fetch categories
   └─ GET /api/categories

2. Fetch subcategories
   └─ GET /api/subcategories

3. Fetch brands
   └─ GET /api/admin/brands

4. Render form with empty selection
```

### Admin Selects Animal
```
1. onSelectionChange triggered
2. availableCategories filtered
3. Dependent selections cleared (category, subcategory, brand)
4. Available categories displayed
5. Subcategory section hidden (waiting for category)
```

### Admin Selects Category
```
1. onSelectionChange triggered
2. availableSubcategories filtered for category + animal
3. Brand list updated (already filtered by animal)
4. If no subcategories: subcategory section hidden
5. If has subcategories: subcategory section shown
```

### Admin Selects Subcategory
```
1. onSelectionChange triggered
2. Selection summary updated
3. Ready for form submission
```

### Admin Selects Brand
```
1. onSelectionChange triggered
2. Selection summary updated
3. Optional - can submit without brand
```

### Admin Submits Form
```
1. Validate animal selected
2. Validate category selected
3. Upload images
4. Create product with:
   - animalId: from hierarchy
   - categoryId: from hierarchy
   - subcategoryId: from hierarchy (if available)
   - brandId: from hierarchy (if selected)
5. Redirect to products list on success
```

---

## User Experience

### For Admin

**Step 1**: "Which animal is this product for?"
```
[🐱 Chats] [🐕 Chiens] [🐦 Oiseaux] [🐾 Autres]
```

**Step 2**: "What category?" (only for selected animal)
```
[Aliments] [Jouets] [Hygiène] [Santé]
```

**Step 3**: "What subcategory?" (only if available)
```
[Aliments secs] [Aliments humides] [Friandises]
```

**Step 4**: "What brand?" (optional)
```
[Whiskas] [Purina] [Royal Canin] [--Aucune marque--]
```

**Summary**: "Chats → Aliments → Aliments secs → Whiskas"

---

## Benefits

### ✅ Admin Experience
- Clear, step-by-step guidance
- No irrelevant options shown
- Prevents invalid combinations
- Visual validation summary
- Helpful error messages

### ✅ Data Quality
- Products always have valid animal/category/brand combinations
- Prevents orphaned categories
- Ensures brand compatibility
- Better product organization

### ✅ Consistency
- Matches filtering system logic
- Same validation rules
- Same UI patterns
- Reusable component approach

### ✅ Maintainability
- Single component for hierarchy
- Easy to extend (add more levels)
- Clear separation of concerns
- Well documented code

---

## Component Architecture

```
ProductHierarchicalSelector
├─ Animal Selection
│  ├─ Select dropdown
│  ├─ Helper text
│  └─ onValueChange handler
│
├─ Category Selection
│  ├─ Select dropdown (disabled if no animal)
│  ├─ Placeholder messages
│  ├─ Filtered options
│  └─ Helper text
│
├─ Subcategory Selection (conditional)
│  ├─ Only shown if subcategories available
│  ├─ Select dropdown
│  ├─ Filtered options
│  └─ Helper text
│
├─ Brand Selection
│  ├─ Select dropdown (disabled if no animal)
│  ├─ "None" option
│  ├─ Filtered options
│  └─ Helper text
│
└─ Validation Summary
   ├─ Shows current selection
   ├─ Updates in real-time
   └─ Color-coded alerts
```

---

## State Management

### Internal State (Selector Component)
```typescript
ProductHierarchicalSelection {
  animalId: AnimalType | ""
  categoryId: string
  subcategoryId: string
  brandId: string
}
```

### Derived State (Calculated)
```typescript
availableCategories    // Filtered by animalId
availableSubcategories // Filtered by categoryId + animalId
availableBrands        // Filtered by animalId
```

### useEffect Dependencies
```
Effect 1: animalId changed
  └─ Update availableCategories
  └─ Clear dependent selections

Effect 2: categoryId changed
  └─ Update availableSubcategories
  └─ Clear brandId (if no longer available)

Effect 3: Any selection changed
  └─ Call onSelectionChange()
  └─ Notify parent component
```

---

## Integration with Product Form

### Before Submission
```typescript
// Validate selection
if (!hierarchySelection.animalId) {
  throw new Error("Veuillez sélectionner un animal")
}
if (!hierarchySelection.categoryId) {
  throw new Error("Veuillez sélectionner une catégorie")
}
```

### Product Data Structure
```typescript
const productData = {
  name: formData.name,
  slug: formData.slug,
  sku: formData.sku,
  price: parseInt(formData.price),
  stock: parseInt(formData.stock),
  
  // From hierarchical selector
  animalId: hierarchySelection.animalId,
  categoryId: hierarchySelection.categoryId,
  subcategoryId: hierarchySelection.subcategoryId || null,
  brandId: hierarchySelection.brandId || null,
  
  // Other fields...
  images: imageUrls,
  featured: formData.featured,
  tags: formData.tags,
}
```

---

## Database Considerations

### Required Fields
- `products.animal_id` - Must be set (from animalId)
- `products.category_id` - Must be set (from categoryId)

### Optional Fields
- `products.subcategory_id` - Can be NULL (from subcategoryId)
- `products.brand_id` - Can be NULL (from brandId)

### Category Hierarchy
- `categories.parent_id` - NULL for main categories
- `subcategories.category_id` - Must reference valid category

### Animal Filtering
- `categories.animal_type` - Can be NULL (universal) or specific animal
- `subcategories.animal_type` - Can be NULL (universal) or specific animal
- `brands.animal_types` - Array or JSON field with animal types

---

## Testing Checklist

### Animal Selection
- [ ] All animals shown in dropdown
- [ ] Selecting animal shows categories
- [ ] Deselecting animal clears all
- [ ] Changing animal clears dependent selections

### Category Selection
- [ ] Only categories for selected animal shown
- [ ] Universal categories shown
- [ ] Selecting category shows subcategories (if any)
- [ ] Changing category clears subcategory + brand

### Subcategory Selection
- [ ] Only shown if available for category
- [ ] Subcategories filtered by animal
- [ ] Can deselect
- [ ] Changing clears brand

### Brand Selection
- [ ] Only shown if animal selected
- [ ] "None" option always available
- [ ] Shows only brands for animal
- [ ] Optional (can submit without)

### Validation
- [ ] Error if submit without animal
- [ ] Error if submit without category
- [ ] Summary shows current selection
- [ ] Alert for invalid combinations

### Form Submission
- [ ] Product created with animalId
- [ ] Product created with categoryId
- [ ] Subcategory saved if selected
- [ ] Brand saved if selected
- [ ] Redirects on success

---

## Error Handling

### No Animal Selected
```
Status: ⚠️ Warning
Message: "Sélectionnez un animal d'abord"
Action: Disable category selection
```

### No Categories Available
```
Status: ❌ Error
Message: "Aucune catégorie disponible pour l'animal sélectionné"
Alert: Red alert box
Action: Check category configuration
```

### Invalid Combination
```
Status: ⚠️ Warning
Message: Automatically prevented by filtering
Action: Options removed/disabled automatically
```

### Submission Validation
```
If animal not selected:
  throw Error("Veuillez sélectionner un animal")

If category not selected:
  throw Error("Veuillez sélectionner une catégorie")
```

---

## API Changes

### New Endpoint
```
GET /api/subcategories
└─ Returns: Subcategory[]
└─ Caching: Can cache for 1 hour
└─ Auth: Public (no auth needed)
```

### Updated Endpoint (Product Creation)
```
POST /api/admin/products
├─ Added: animalId (required)
├─ Added: subcategoryId (optional)
├─ Changed: categoryId (now filtered by animal)
└─ Moved: animalType → animalId
```

---

## Configuration

### Animal List (Hardcoded in Component)
```typescript
const ANIMALS = [
  { value: "cat", label: "Chats 🐱" },
  { value: "dog", label: "Chiens 🐕" },
  { value: "bird", label: "Oiseaux 🐦" },
  { value: "other", label: "Autres 🐾" },
]
```

### Validation Rules
- Animal: Required
- Category: Required
- Subcategory: Optional (depends on availability)
- Brand: Optional

### Languages
- French UI text (matching existing pattern)
- Error messages in French
- Helper text in French

---

## Future Enhancements

1. **Bulk Product Import**
   - Use same hierarchical validation
   - CSV upload with animal/category/brand

2. **Product Duplication**
   - Copy existing product
   - Keep hierarchical data
   - Update name/SKU/price

3. **Product Templates**
   - Save common animal/category/brand combinations
   - Quick-fill form with template

4. **Advanced Filtering**
   - Filter products by complete hierarchy
   - Show products by animal/category/brand

5. **Analytics**
   - Track which categories/brands per animal
   - Identify missing combinations
   - Admin dashboard reports

---

## Files Changed

| File | Change | Lines |
|------|--------|-------|
| components/admin/product-hierarchical-selector.tsx | Created | 300+ |
| app/admin/products/new/page.tsx | Refactored | ~50 |
| app/api/subcategories/route.ts | Created | 40+ |

---

## Backward Compatibility

- Old product creation form components deprecated
- API accepts both `animalType` and `animalId`
- Existing products still accessible
- No breaking changes to existing routes

---

## Performance

- Categories fetched once per page load
- Subcategories fetched once per page load
- Brands fetched once per page load
- Client-side filtering is instant
- No additional API calls per selection

---

## Support

### Common Issues

**"No categories available"**
- Verify categories have `animal_type` matching selected animal
- Or create universal categories with `animal_type = NULL`

**"Subcategory not showing"**
- Check subcategory has correct `category_id`
- Check `animal_type` matches selected animal or is NULL

**"Brand not showing"**
- Verify brand has products for selected animal
- Check brand `animal_types` includes selected animal

### Quick Fixes

1. Ensure database has animal_type set correctly
2. Check categories and subcategories are active (`is_active = true`)
3. Verify foreign key relationships
4. Clear browser cache if UI doesn't update

---

## Documentation References

- **Hierarchical Filtering**: `HIERARCHICAL_FILTERING_GUIDE.md`
- **Component API**: `ProductHierarchicalSelector` source code
- **Type Definitions**: `lib/types.ts`
- **Data Functions**: `lib/data.ts`

---

**Ready for admin use!** 🎯

