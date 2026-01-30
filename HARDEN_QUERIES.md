# Brand and Featured Products Query Hardening

## Overview
Enhanced brand and featured product queries with comprehensive error handling, debug logging, and graceful degradation when data is incomplete or unavailable.

## Enhanced Functions

### 1. `getFeaturedProducts()`
Fetches featured products globally (not animal-specific).

**Location**: `lib/data.ts` (line ~255)

**Query Filters**:
- `featured = true`
- `stock > 0`
- `limit 8`

**Console Output**:
```javascript
[getFeaturedProducts] Fetching featured products with stock > 0, limit: 8
[getFeaturedProducts] Found 5 featured products
```

**Error Handling**:
- ✅ Returns empty array if query fails
- ✅ Logs full error details (message, code, details)
- ✅ Not treated as fatal - zero featured products is acceptable

### 2. `getBrands()`
Fetches all brands globally.

**Location**: `lib/data.ts` (line ~593)

**Console Output**:
```javascript
[getBrands] Fetching all brands
[getBrands] Found 12 total brands
```

**Error Handling**:
- ✅ Returns empty array on error
- ✅ Logs error details
- ✅ Empty result is acceptable

### 3. `getFeaturedBrands()`
Fetches only featured brands.

**Location**: `lib/data.ts` (line ~610)

**Console Output**:
```javascript
[getFeaturedBrands] Fetching featured brands
[getFeaturedBrands] Found 3 featured brands
```

**Error Handling**:
- ✅ Returns empty array if no featured brands exist
- ✅ Logs error details
- ✅ Safe fallback to empty state

### 4. `getBrandsForAnimal(animalType)`
Fetches brands for a specific animal using an RPC function with fallback.

**Location**: `lib/data.ts` (line ~800)

**Console Output**:
```javascript
[getBrandsForAnimal] Fetching brands for animal: "cat"
[getBrandsForAnimal] Found 8 brands for animal "cat"
```

**Error Handling - Two-Tier Approach**:
1. **Primary**: Calls `get_brands_for_animal()` RPC
2. **Fallback**: If RPC fails, returns all brands instead
   ```javascript
   [getBrandsForAnimal] RPC get_brands_for_animal failed for "cat", falling back to all brands:
   [getBrandsForAnimal] Fallback returned 12 brands
   ```

### 5. `getFeaturedProductsByAnimal(animalType, limit?)`
Fetches featured products for a specific animal.

**Location**: `lib/data.ts` (line ~840)

**Query Filters**:
- `featured = true`
- `animal_type = animalType OR animal_type IS NULL`
- `limit` (default: 8)

**Console Output**:
```javascript
[getFeaturedProductsByAnimal] Fetching featured products for animal: "dog", limit: 8
[getFeaturedProductsByAnimal] Found 3 featured products for "dog"
```

**Error Handling**:
- ✅ Returns empty array if no featured products exist
- ✅ Logs animal type and limit for debugging
- ✅ Not an error condition

### 6. `getBrandsForAnimalHierarchy(animalType)`
Fetches brands that have products for a specific animal.

**Location**: `lib/data.ts` (line ~1370)

**Query Approach**:
1. Selects products for the animal
2. Extracts distinct brands from those products
3. Deduplicates using Map

**Console Output**:
```javascript
[getBrandsForAnimalHierarchy] Fetching brands for animal: "bird"
[getBrandsForAnimalHierarchy] Found 5 unique brands for animal "bird"
```

**Error Handling**:
- ✅ Safely deduplicates brands (checks `row.brands && row.brands.id`)
- ✅ Handles null/undefined data gracefully
- ✅ Returns empty array if no brands found

### 7. `getBrandsForHierarchicalFilter(animalType?, categoryIds?, subcategoryIds?)`
Fetches brands matching hierarchical filters.

**Location**: `lib/data.ts` (line ~1385)

**Query Filters** (all optional):
- `animal_id = animalType`
- `category_id IN (categoryIds)`
- `subcategory_id IN (subcategoryIds)`
- `brand_id IS NOT NULL`

**Console Output**:
```javascript
[getBrandsForHierarchicalFilter] Fetching brands with filters:
{
  animalType: "cat",
  categoryCount: 2,
  subcategoryCount: 0
}
[getBrandsForHierarchicalFilter] Found 4 brands matching filters
```

**Error Handling**:
- ✅ Logs all filter parameters for debugging
- ✅ Safely deduplicates brands
- ✅ Handles empty results gracefully
- ✅ Returns empty array if no matches

### 8. `getFeaturedProductsForAnimal(animalType, limit?)`
Fetches featured products for a specific animal with full relations.

**Location**: `lib/data.ts` (line ~1453)

**Query Filters**:
- `animal_id = animalType`
- `featured = true`
- `stock > 0`
- `limit` (default: 8)

**Console Output**:
```javascript
[getFeaturedProductsForAnimal] Fetching featured products for animal: "cat", limit: 8
[getFeaturedProductsForAnimal] Found 6 featured products for "cat"
```

**Error Handling**:
- ✅ Logs animal type and limit
- ✅ Returns empty array if no featured products
- ✅ Not treated as error

## Safety Guards Implemented

### Guard 1: Null/Undefined Data Handling
```typescript
// BEFORE: Assumed data always exists
return (data || []).map(transformBrand)

// AFTER: Explicit null check with logging
const brands = data || []
console.debug(`Found ${brands.length} brands`)
return brands.map(transformBrand)
```

### Guard 2: Array Validation Before Processing
```typescript
// BEFORE: Assumed data is array
data.forEach(row => { ... })

// AFTER: Check type and existence
if (data && Array.isArray(data)) {
  data.forEach(row => { ... })
}
```

### Guard 3: Nested Property Safety
```typescript
// BEFORE: Assumed nested properties exist
if (row.brands && !brandMap.has(row.brands.id))

// AFTER: Check all nested properties
if (row.brands && row.brands.id && !brandMap.has(row.brands.id))
```

### Guard 4: Fallback Mechanism
```typescript
// For getBrandsForAnimal RPC:
if (error) {
  console.warn(`RPC failed, falling back...`)
  return getBrands()  // Fallback to all brands
}
```

### Guard 5: Error Details Logging
```typescript
// BEFORE: Vague error logging
console.error("Error fetching brands:", error)

// AFTER: Structured error with all details
console.error(`[getBrands] Error fetching brands:`, {
  message: error.message,
  code: error.code,
  details: error.details,
})
```

## Console Debug Output Examples

### Successful Brand Query
```javascript
[getBrandsForAnimal] Fetching brands for animal: "cat"
[getBrandsForAnimal] Found 8 brands for animal "cat"
```

### Empty Result (Acceptable)
```javascript
[getFeaturedProductsByAnimal] Fetching featured products for animal: "other", limit: 8
[getFeaturedProductsByAnimal] Found 0 featured products for "other"
```

### Database Error with Fallback
```javascript
[getBrandsForAnimal] Fetching brands for animal: "dog"
[getBrandsForAnimal] RPC get_brands_for_animal failed for "dog", falling back to all brands: { message: "...", code: "..." }
[getBrandsForAnimal] Fallback returned 12 brands
```

### Hierarchical Filter with No Matches
```javascript
[getBrandsForHierarchicalFilter] Fetching brands with filters: { animalType: "bird", categoryCount: 1, subcategoryCount: 0 }
[getBrandsForHierarchicalFilter] Found 0 brands matching filters
```

## Design Principles

### 1. **No Silent Failures**
All errors are logged with context. If a query fails, you'll see:
- Function name in brackets: `[getFeaturedProducts]`
- Human-readable description
- Full error object with code and details
- Filter parameters for context

### 2. **Graceful Degradation**
- Zero brands? Return empty array
- No featured products? Return empty array
- RPC fails? Fall back to alternative query
- Database error? Log and return empty safely

### 3. **Data Completeness Assumed**
- Never assume data exists
- Always check for null/undefined
- Always check array type before iterating
- Check nested properties before access

### 4. **Meaningful Debug Info**
Every query logs:
- Animal type being queried
- Filter parameters applied
- Number of results found
- Warnings for unexpected conditions

## Testing Scenarios

### Scenario 1: No Brands for Animal
```javascript
// Request: getBrandsForAnimal("bird")
// Database: No products for bird, so no brands
// Expected Output:
[getBrandsForAnimal] Fetching brands for animal: "bird"
[getBrandsForAnimal] Found 0 brands for animal "bird"
// Expected Result: []
```

### Scenario 2: RPC Function Not Available
```javascript
// Request: getBrandsForAnimal("cat")
// Database: RPC function doesn't exist
// Expected Output:
[getBrandsForAnimal] Fetching brands for animal: "cat"
[getBrandsForAnimal] RPC get_brands_for_animal failed for "cat"...
[getBrandsForAnimal] Fallback returned 12 brands
// Expected Result: [12 brands]
```

### Scenario 3: No Featured Products
```javascript
// Request: getFeaturedProductsForAnimal("other", 8)
// Database: No featured products for "other"
// Expected Output:
[getFeaturedProductsForAnimal] Fetching featured products for animal: "other", limit: 8
[getFeaturedProductsForAnimal] Found 0 featured products for "other"
// Expected Result: []
```

### Scenario 4: Empty Hierarchical Filter Result
```javascript
// Request: getBrandsForHierarchicalFilter("cat", ["invalid-id"], [])
// Database: No products match
// Expected Output:
[getBrandsForHierarchicalFilter] Fetching brands with filters:
{ animalType: "cat", categoryCount: 1, subcategoryCount: 0 }
[getBrandsForHierarchicalFilter] Found 0 brands matching filters
// Expected Result: []
```

## Debugging Workflow

### Step 1: Check Console Logs
Open DevTools → Console tab → Filter by function name

```javascript
// Look for logs like:
[getFeaturedProducts]
[getBrands]
[getBrandsForAnimal]
```

### Step 2: Review Filter Parameters
Check what filters were applied:
```javascript
[getBrandsForHierarchicalFilter] Fetching brands with filters:
{
  animalType: "cat",      // Which animal?
  categoryCount: 2,        // How many categories?
  subcategoryCount: 1      // How many subcategories?
}
```

### Step 3: Check Result Count
See how many items were found:
```javascript
[getBrandsForAnimal] Found 5 brands for animal "cat"
```

### Step 4: Handle Empty Results Gracefully
- Empty result ≠ Error
- UI should handle [] with:
  - Empty state message
  - Default fallback
  - Loading placeholder

## Common Issues & Solutions

### Issue 1: Zero Brands for Animal
**Symptoms**: Empty brand list in UI

**Debug**:
1. Check console: `[getBrandsForAnimal] Found 0 brands for animal "cat"`
2. Check database: Do products exist for this animal?
3. Check products: Do they have brand_id set?

**Solution**: 
- Add sample products with brands
- Verify brand_id is not NULL in products table

### Issue 2: RPC Function Missing
**Symptoms**: Console shows fallback message

**Debug**:
```javascript
[getBrandsForAnimal] RPC get_brands_for_animal failed...
[getBrandsForAnimal] Fallback returned 12 brands
```

**Solution**:
- Check if RPC function exists in database
- If not, create it:
  ```sql
  CREATE FUNCTION get_brands_for_animal(p_animal_type text)
  RETURNS TABLE (...) AS ...
  ```

### Issue 3: Featured Products Not Showing
**Symptoms**: Empty featured section

**Debug**:
```javascript
[getFeaturedProductsForAnimal] Found 0 featured products for "cat"
```

**Solution**:
1. Check if products exist for this animal
2. Check if `featured = true` and `stock > 0`
3. Verify animal_type matches exactly

### Issue 4: Hierarchical Filter Returns Nothing
**Symptoms**: No brands in filtered view

**Debug**:
```javascript
[getBrandsForHierarchicalFilter] Found 0 brands matching filters
```

**Solution**:
1. Check if products exist with all filters applied
2. Run test query in Supabase:
   ```sql
   SELECT DISTINCT brand_id 
   FROM products 
   WHERE animal_id = 'cat' 
     AND category_id IN (...)
   ```
3. Verify brand_id is set on matching products

## Performance Considerations

### Caching
- Featured products: 60s server cache
- Brands list: 120s cache
- Brand queries: Varies by filter complexity

### Optimization Tips
1. **Use Indexes**:
   ```sql
   CREATE INDEX idx_products_animal_featured 
   ON products(animal_id, featured) 
   WHERE featured = true;
   
   CREATE INDEX idx_products_brand_not_null 
   ON products(brand_id) 
   WHERE brand_id IS NOT NULL;
   ```

2. **Limit Results**: Use sensible defaults
   ```typescript
   // Good: getFeaturedProductsForAnimal(animal, 8)
   // Avoid: Fetching unlimited products
   ```

3. **Batch Queries**: Fetch related data in one select
   ```typescript
   // Single query with joins
   .select(`products(*, brands(*), categories(*))`)
   // Better than multiple queries
   ```

## Best Practices

✅ **Always check for null/undefined data**  
✅ **Log meaningful debug info with context**  
✅ **Return empty arrays for no results (not errors)**  
✅ **Include filter parameters in error logs**  
✅ **Use fallback mechanisms when available**  
✅ **Validate nested properties before access**  
✅ **Handle array type checking**  
✅ **Provide meaningful console messages**  

❌ **Don't throw errors on empty results**  
❌ **Don't assume data exists**  
❌ **Don't forget null checks on nested properties**  
❌ **Don't log vague error messages**  
❌ **Don't skip array type validation**  
