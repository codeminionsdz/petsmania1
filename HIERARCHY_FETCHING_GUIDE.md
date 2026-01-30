# Hierarchy-Based Product Fetching Logic

## Overview
The product fetching system uses a hierarchical approach to safely filter products by animal, category, and subcategory. This ensures that queries never execute with undefined or invalid filters.

## Hierarchy Rules

### Rule 1: Animal is Always Required
- **Mandatory**: Every product fetch requires a valid animal type
- **Valid values**: `'cat'` | `'dog'` | `'bird'` | `'other'`
- **No default**: Invalid animal types return a 400 error

### Rule 2: If categoryId is Undefined → Fetch by Animal Only
When no category is specified, the query returns ALL products for that animal.

```typescript
// Request: GET /api/animals/cat/products
// Fetches: ALL cat products
const result = await getProductsByHierarchy('cat')
```

**Supabase Query Filter**:
```sql
WHERE animal_id = 'cat'
-- No category filter applied
```

### Rule 3: If categoryId is Defined, subcategoryId Undefined → Fetch by Animal + Category
When a category is specified but no subcategory, the query returns products within that category only.

```typescript
// Request: GET /api/animals/cat/products?categoryId=alimentation
// Fetches: Cat products in the "Alimentation" category
const result = await getProductsByHierarchy('cat', 'alimentation')
```

**Supabase Query Filter**:
```sql
WHERE animal_id = 'cat' AND category_id = 'alimentation'
-- Subcategory filter NOT applied
```

### Rule 4: If Both categoryId and subcategoryId Defined → Fetch by Animal + Category + Subcategory
When both are specified, the query returns products at the most granular level.

```typescript
// Request: GET /api/animals/cat/products?categoryId=alimentation&subcategoryId=dry-food
// Fetches: Cat products in Alimentation > Dry Food
const result = await getProductsByHierarchy('cat', 'alimentation', 'dry-food')
```

**Supabase Query Filter**:
```sql
WHERE animal_id = 'cat' 
  AND category_id = 'alimentation' 
  AND subcategory_id = 'dry-food'
```

### Rule 5: Never Execute Queries with Undefined Filters
The system includes safety guards to prevent invalid queries.

**Invalid Request**:
```typescript
// ❌ INVALID: subcategoryId without categoryId
const result = await getProductsByHierarchy('cat', undefined, 'dry-food')
// Result: Logs warning, ignores subcategoryId, fetches by animal only
```

**Guard Implementation** in `lib/data.ts`:
```typescript
if (subcategoryId && !categoryId) {
  console.warn(`Invalid hierarchy: subcategoryId provided without categoryId`)
}

if (categoryId && categoryId.trim()) {
  query = query.eq("category_id", categoryId)
  
  if (subcategoryId && subcategoryId.trim()) {
    query = query.eq("subcategory_id", subcategoryId)
  }
}
```

## API Endpoint: GET /api/animals/:type/products

### Query Parameters

#### Required
| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `:type` | string | `cat`, `dog`, `bird`, `other` | Animal type (URL path) |

#### Optional Hierarchical Filters
| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `categoryId` | string | `alimentation` | Category ID - enables category filtering |
| `subcategoryId` | string | `dry-food` | Subcategory ID - requires categoryId |

#### Optional Additional Filters
| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `brands` | string (comma-separated) | `brand1,brand2` | Filter by brand IDs |
| `minPrice` | number | `10.99` | Minimum price filter |
| `maxPrice` | number | `50.00` | Maximum price filter |
| `inStock` | boolean | `true` | Only in-stock products |
| `sortBy` | string | `price-asc` | Sort: `price-asc`, `price-desc`, `name`, `newest` |
| `page` | number | `1` | Pagination page (default: 1) |
| `pageSize` | number | `12` | Items per page (default: 12) |

### Example Requests

**Fetch all cat products**:
```
GET /api/animals/cat/products
```

**Fetch cat products in Alimentation category**:
```
GET /api/animals/cat/products?categoryId=alimentation
```

**Fetch cat products in Alimentation > Dry Food**:
```
GET /api/animals/cat/products?categoryId=alimentation&subcategoryId=dry-food
```

**Fetch with additional filters**:
```
GET /api/animals/cat/products?categoryId=alimentation&sortBy=price-asc&minPrice=5&maxPrice=50&page=1&pageSize=12
```

## Implementation: lib/data.ts

### Function Signature
```typescript
export async function getProductsByHierarchy(
  animalType: AnimalType,
  categoryId?: string,
  subcategoryId?: string,
  options?: FilterOptions & { page?: number; pageSize?: number }
): Promise<PaginatedResponse<Product>>
```

### Safe Guards Applied

1. **Validation of Animal Type**
   - Must be one of: `'cat'`, `'dog'`, `'bird'`, `'other'`
   - API route validates before calling this function

2. **Hierarchy Validation**
   - subcategoryId is ignored if categoryId is undefined
   - Logs warning when this occurs
   - Prevents orphaned subcategory queries

3. **String Trimming**
   - Empty strings treated as undefined
   - Prevents accidental matches with whitespace-only values
   ```typescript
   if (categoryId && categoryId.trim()) {
     // categoryId is valid and non-empty
   }
   ```

4. **No Null/Undefined Queries**
   - All filters checked before applying to query
   - If a filter is undefined, it's simply not added to the query
   - Supabase query builds dynamically based on provided filters

## Code Flow Diagram

```
GET /api/animals/:type/products?query_params
           ↓
   Validate animal type
   (return 400 if invalid)
           ↓
   Extract query parameters
   ├─ categoryId (optional)
   ├─ subcategoryId (optional)
   ├─ brands, price, etc.
           ↓
   Apply hierarchy safe guards
   ├─ If subcategoryId without categoryId:
   │  └─ Log warning, set subcategoryId = undefined
   ├─ Trim whitespace from categoryId
   ├─ Trim whitespace from subcategoryId
           ↓
   Call getProductsByHierarchy()
           ├─ Build Supabase query
           │  ├─ WHERE animal_id = type (always)
           │  ├─ WHERE category_id = categoryId (if categoryId is valid)
           │  ├─ WHERE subcategory_id = subcategoryId (if both IDs valid)
           │  └─ WHERE ... (other filters)
           │
           ├─ Execute query
           ├─ Transform results
           └─ Return PaginatedResponse
           ↓
   Return JSON response with caching headers
```

## Testing Scenarios

### Scenario 1: Fetch by Animal Only
```typescript
// Expected: Returns all products for the animal
const result = await getProductsByHierarchy('cat')
// WHERE animal_id = 'cat'
```

### Scenario 2: Fetch by Animal + Category
```typescript
// Expected: Returns products only in that category
const result = await getProductsByHierarchy('cat', 'alimentation')
// WHERE animal_id = 'cat' AND category_id = 'alimentation'
```

### Scenario 3: Fetch by Full Hierarchy
```typescript
// Expected: Returns most specific products
const result = await getProductsByHierarchy('cat', 'alimentation', 'dry-food')
// WHERE animal_id = 'cat' AND category_id = 'alimentation' AND subcategory_id = 'dry-food'
```

### Scenario 4: Invalid Hierarchy (Guard)
```typescript
// Expected: Warning logged, subcategoryId ignored
const result = await getProductsByHierarchy('cat', undefined, 'dry-food')
// Console: "Invalid hierarchy: subcategoryId provided without categoryId"
// WHERE animal_id = 'cat' (subcategoryId NOT applied)
```

### Scenario 5: Empty Strings (Guard)
```typescript
// Expected: Empty strings treated as undefined
const result = await getProductsByHierarchy('cat', '', '  ')
// WHERE animal_id = 'cat' (no filters applied)
```

## Error Handling

### Bad Animal Type
```javascript
// Request: GET /api/animals/invalid/products
// Response: 400 Bad Request
{
  "error": "Invalid animal type"
}
```

### Database Error
```javascript
// Response: 500 Internal Server Error
{
  "error": "Failed to fetch products"
}
// (Error details logged to console)
```

### Success Response
```javascript
{
  "data": [
    {
      "id": "prod-1",
      "name": "Premium Cat Food",
      "price": 12.99,
      ...
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 12,
  "totalPages": 4
}
```

## Benefits of This Approach

✅ **Safety**: Guards prevent invalid queries from executing  
✅ **Clarity**: Clear rules for when each filter applies  
✅ **Performance**: Only necessary filters added to queries  
✅ **Maintainability**: Single source of truth for hierarchy rules  
✅ **Flexibility**: Supports all hierarchy levels dynamically  
✅ **Robustness**: Handles edge cases (empty strings, whitespace, etc.)

## Migration Notes

When upgrading from previous versions:
- Old code using undefined filters will still work
- Guards silently correct invalid hierarchies (with warnings)
- No breaking changes to API contracts
- All requests remain backward compatible
