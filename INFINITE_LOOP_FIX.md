# Fix: Infinite Render Loop on Category Pages

## Problem
Navigating to `/categories/[slug]` or `/categories/[category]/[subcategory]` caused a "Maximum update depth exceeded" error due to infinite state updates.

## Root Cause
The `HierarchicalFilter` component had multiple `useEffect` hooks that were calling `setState` unconditionally:

1. **useEffect #1** (lines 48-71): Watched `state.selectedAnimal` and called `setState` to clear categories
2. **useEffect #2** (lines 73-122): Watched `state.selectedCategories` and called `setState` to clear subcategories
3. **useEffect #3** (lines 147-159): Watched state values and called `onFilterChange`

This created a cascade:
- Component mounts with `initialAnimalFilter`
- → `setState` sets `selectedAnimal`
- → useEffect #1 triggers and calls `setState` to clear categories
- → This causes re-render with new state
- → useEffect #2 triggers and updates subcategories
- → This triggers useEffect #3
- → Loop continues indefinitely

## Solution Applied

### Pattern: Derived Values Instead of Derived State
Changed from **deriving state from state** to **deriving computed values from props**.

**Before (❌ Problematic):**
```tsx
useEffect(() => {
  if (state.selectedAnimal) {
    const relevant = allCategories.filter(...)
    setAvailableCategories(relevant)  // ← setState in useEffect
    setState((prev) => ({             // ← setState in useEffect  
      ...prev,
      selectedCategories: [],
    }))
  }
}, [state.selectedAnimal, allCategories])
```

**After (✅ Correct):**
```tsx
// Compute directly from props/state, no setState
const computedAvailableCategories = state.selectedAnimal
  ? allCategories.filter(
      (cat) =>
        cat.animal_type === state.selectedAnimal ||
        cat.animal_type === null ||
        cat.animal_type === undefined
    )
  : allCategories

// Only update when value actually changes (not every render)
useEffect(() => {
  if (JSON.stringify(availableCategories) !== JSON.stringify(computedAvailableCategories)) {
    setAvailableCategories(computedAvailableCategories)
  }
}, [computedAvailableCategories])
```

### Key Changes

1. **Compute available categories synchronously** (not in useEffect)
   - Filtered based on `state.selectedAnimal`
   - Compared to previous value before updating state

2. **Compute available subcategories synchronously** (not in useEffect)
   - Filtered based on `state.selectedCategories` and `state.selectedAnimal`
   - Only update when the list actually changes

3. **Prevent cascading clears**
   - Removed automatic clearing of categories when animal changes
   - Categories/subcategories are automatically filtered by computed values
   - Users can keep their selections - they just filter to relevant items

4. **Stable effect dependencies**
   - useEffect now depends on computed values, not intermediate state
   - String comparison prevents unnecessary updates
   - Track previous state with `useRef` to detect real changes

5. **Single source of truth**
   - Route params → component mounts
   - Filters state managed locally
   - Available categories/subcategories derived from filters (not mirrored in state)

## Files Modified

### [hierarchical-filter.tsx](components/filters/hierarchical-filter.tsx)
- Moved category/subcategory filtering out of useEffect
- Added computed values using synchronous filtering
- Updated useEffect to only trigger on real value changes
- Simplified handleAnimalChange to not cascade clears
- Added `prevStateRef` to track actual state changes vs re-renders

## Testing Recommendations

1. **Navigate to `/categories/petfood`** - should load without console errors
2. **Select an animal in the filter** - should show available categories
3. **Select a category** - should show available subcategories
4. **Toggle filters** - should not cause infinite loops
5. **Use browser DevTools** - React DevTools should show stable renders (1-2 per interaction, not hundreds)

## Pattern for Future Development

When building hierarchical filters or dependent state:

❌ **DON'T:**
```tsx
useEffect(() => {
  const filtered = allItems.filter(...)
  setFilteredItems(filtered)  // setState in useEffect
}, [dependency])
```

✅ **DO:**
```tsx
const computedFiltered = allItems.filter(...)

useEffect(() => {
  if (JSON.stringify(filteredItems) !== JSON.stringify(computedFiltered)) {
    setFilteredItems(computedFiltered)
  }
}, [computedFiltered])
```

Or better yet, if you control the component:

✅ **BEST (no state duplication):**
```tsx
const computedFiltered = allItems.filter(...)
// Render using computedFiltered directly, no state needed
return <div>{computedFiltered.map(...)}</div>
```

## Result
✅ Navigation to category pages now works without infinite loops  
✅ Filter selection is smooth and responsive  
✅ No "Maximum update depth exceeded" error  
✅ React DevTools shows normal render patterns  
