# Categories Fetching Debug Guide

## Overview
This guide explains the enhanced debugging capabilities for category fetching functions, particularly for animal-specific category queries.

## Functions Enhanced

### 1. `getCategoriesForAnimal(animalType: AnimalType)`
Fetches main categories (no parents) for a specific animal type, including universal categories.

**Location**: `lib/data.ts` (line ~1001)

**Console Output**:
```javascript
[getCategoriesForAnimal] Fetching categories for animal: "cat" (type: string)
[getCategoriesForAnimal] Filter condition: "animal_type.eq.cat,animal_type.eq.universal"
[getCategoriesForAnimal] Found 4 categories for animal "cat"
[getCategoriesForAnimal] [0] id="cat-alimentation", name="Alimentation", animal_type="cat", is_active=true
[getCategoriesForAnimal] [1] id="cat-hygiene", name="Hygiène", animal_type="cat", is_active=true
[getCategoriesForAnimal] [2] id="universal-medical", name="Santé Générale", animal_type="universal", is_active=true
[getCategoriesForAnimal] [3] id="universal-equipment", name="Équipement Médical", animal_type="universal", is_active=true
```

### 2. `getCategoriesByAnimal(animalType: "cat" | "dog" | "bird" | "other")`
Fetches all categories (including subcategories) for a specific animal type.

**Location**: `lib/data.ts` (line ~693)

**Console Output**:
```javascript
[getCategoriesByAnimal] Fetching categories for animal: "dog" (type: string)
[getCategoriesByAnimal] Filter condition: "animal_type.eq.dog,animal_type.eq.universal"
[getCategoriesByAnimal] Found 8 categories for animal "dog"
[getCategoriesByAnimal] Category: id="dog-alimentation", name="Alimentation", animal_type="dog"
[getCategoriesByAnimal] Category: id="dog-hygiene", name="Hygiène", animal_type="dog"
```

### 3. `getCategories()`
Fetches all categories regardless of animal type or hierarchy.

**Location**: `lib/data.ts` (line ~460)

**Console Output**:
```javascript
[getCategories] Fetching all categories
[getCategories] Found 50 total categories
```

## Debugging Steps

### Step 1: Check Console Logs
Open browser DevTools (F12) and go to the Console tab. Look for logs starting with `[getCategoriesForAnimal]` or `[getCategoriesByAnimal]`.

**Expected Flow for Cat Categories**:
```
[getCategoriesForAnimal] Fetching categories for animal: "cat" (type: string)
→ Confirms animal type is correct
↓
[getCategoriesForAnimal] Filter condition: "animal_type.eq.cat,animal_type.eq.universal"
→ Confirms the Supabase filter query
↓
[getCategoriesForAnimal] Found X categories for animal "cat"
→ Shows how many categories matched
↓
[getCategoriesForAnimal] [0] id="...", name="...", animal_type="...", is_active=...
→ Details of each category
```

### Step 2: Verify Animal Type
The function validates that the animal type is one of: `cat`, `dog`, `bird`, `other`

**If you see this error**:
```javascript
[getCategoriesForAnimal] Invalid animal type: "Cat". Expected one of: cat, dog, bird, other
```

**Problem**: Animal type case mismatch or invalid value  
**Solution**: Ensure animal type is lowercase: use `"cat"` not `"Cat"`

### Step 3: Check Supabase Connection
If you see this error:
```javascript
[getCategoriesForAnimal] Error fetching categories for animal "cat": {
  message: "relation \"public.categories\" does not exist",
  code: "PGRST116",
  details: null
}
```

**Problem**: Database table doesn't exist  
**Solution**: Run database migrations:
```bash
npm run db:setup
```

### Step 4: Verify Animal Type Column
The query checks for `animal_type` field in categories table.

**Expected database schema**:
```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  animal_type TEXT CHECK (animal_type IN ('cat', 'dog', 'bird', 'other', 'universal')),
  is_active BOOLEAN DEFAULT true,
  parent_id TEXT,
  ...
)
```

To verify the column exists, run in Supabase SQL Editor:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'categories';
```

You should see:
```
column_name    | data_type
---------------|----------
animal_type    | text
is_active      | boolean
parent_id      | text
...
```

### Step 5: Check Category Data
If you see "Found 0 categories" but expect results:

**Possible causes**:
1. **No categories in database** - Check if seed data was applied
2. **Wrong animal_type values** - Values must match exactly: `'cat'`, `'dog'`, `'bird'`, `'other'`, or `'universal'`
3. **is_active = false** - Inactive categories are filtered out
4. **parent_id filtering** - `getCategoriesForAnimal` only returns main categories (parent_id IS NULL)

**Debug query in Supabase SQL Editor**:
```sql
-- Check if categories exist for an animal
SELECT id, name, animal_type, is_active, parent_id
FROM categories
WHERE animal_type IN ('cat', 'universal')
  AND is_active = true
  AND parent_id IS NULL
ORDER BY name;
```

## Safe Guards Implemented

### 1. Animal Type Validation
```typescript
const validTypes: AnimalType[] = ["cat", "dog", "bird", "other"]
if (!validTypes.includes(animalType)) {
  console.error(`Invalid animal type: "${animalType}"...`)
  return []  // ✅ Safe: returns empty array
}
```

### 2. Null/Undefined Handling
```typescript
const categories = data || []  // ✅ Safe: converts null to []
return categories.map(...)      // ✅ Safe: won't crash if empty
```

### 3. Error Handling
```typescript
if (error) {
  console.error(`Error fetching categories...`, {
    message: error.message,
    code: error.code,
    details: error.details,
  })
  return []  // ✅ Safe: returns empty array instead of crashing
}
```

### 4. String Trimming (for API parameters)
When receiving animal type from API routes, values are trimmed:
```typescript
if (animalTypeParam && animalTypeParam.trim()) {
  animalType = animalTypeParam  // Only use if not empty
}
```

## Common Issues & Solutions

### Issue 1: No Categories Showing for Animal
**Symptoms**: 
- Console shows "Found 0 categories"
- Category section appears empty

**Diagnosis Steps**:
1. Check console for error logs
2. Verify animal_type values match exactly
3. Verify is_active = true
4. Check parent_id constraint

**Solution**:
```sql
-- In Supabase SQL Editor, verify seed data
SELECT COUNT(*) as total_categories FROM categories;

SELECT COUNT(*) as cat_categories 
FROM categories 
WHERE animal_type = 'cat' AND is_active = true;

SELECT * FROM categories WHERE animal_type = 'cat';
```

### Issue 2: Infinite Loop / Duplicate Fetches
**Symptoms**: Console shows repeated `[getCategoriesForAnimal]` logs

**Cause**: React components re-fetching on every render  
**Solution**: Wrap fetch in `useEffect` with proper dependencies:
```typescript
useEffect(() => {
  getCategoriesForAnimal(animalType).then(setCategories)
}, [animalType])  // Only fetch when animalType changes
```

### Issue 3: Category Data Not Updating
**Symptoms**: Change made in Supabase but UI doesn't reflect it

**Cause**: Cache not invalidated  
**Solution**: Clear browser cache or use cache busting:
```typescript
// Force fresh fetch by disabling cache
const categories = await getCategoriesForAnimal(animalType)
// Server-side cache is set to 60 seconds
```

## Query Details

### getCategoriesForAnimal Query
```
SELECT * 
FROM categories 
WHERE is_active = true 
  AND parent_id IS NULL 
  AND (animal_type = 'cat' OR animal_type = 'universal')
ORDER BY display_order, name
```

**Filters**:
- `is_active = true`: Only active categories
- `parent_id IS NULL`: Only main categories (not subcategories)
- `animal_type IN ('cat', 'universal')`: Cat-specific + universal categories

### getCategoriesByAnimal Query
```
SELECT * 
FROM categories 
WHERE (animal_type = 'cat' OR animal_type = 'universal')
ORDER BY name
```

**Note**: No parent_id filter, so includes subcategories

## Performance Considerations

### Caching
- Server-side: 60 seconds
- Stale-while-revalidate: 120 seconds
- Browser: Uses Next.js data caching

### Database Indexes
Recommended indexes for performance:
```sql
CREATE INDEX idx_categories_animal_type ON categories(animal_type);
CREATE INDEX idx_categories_is_active_parent ON categories(is_active, parent_id);
CREATE INDEX idx_categories_animal_active_parent 
  ON categories(animal_type, is_active, parent_id);
```

## Testing

### Unit Test Example
```typescript
import { getCategoriesForAnimal } from '@/lib/data'

test('getCategoriesForAnimal returns categories for cat', async () => {
  const categories = await getCategoriesForAnimal('cat')
  expect(categories.length).toBeGreaterThan(0)
  expect(categories.every(c => !c.parent_id)).toBe(true)
})

test('getCategoriesForAnimal returns empty array for invalid type', async () => {
  const categories = await getCategoriesForAnimal('invalid' as any)
  expect(categories).toEqual([])
})
```

### Manual Testing
1. Open browser DevTools
2. Go to Console tab
3. Navigate to home page
4. Look for `[getCategoriesForAnimal]` logs
5. Verify animal type matches expected value
6. Check category counts match database

## Debug Checklist

- [ ] Console shows no errors
- [ ] Animal type is lowercase and valid
- [ ] `[getCategoriesForAnimal]` logs appear in console
- [ ] Filter condition looks correct
- [ ] Category count is greater than 0
- [ ] Individual category logs show correct animal_type
- [ ] Database query returns expected results
- [ ] No duplicate fetches in console
- [ ] Categories render in UI

## Related Functions

- `getCategories()` - All categories
- `getCategoryBySlug(slug)` - Single category by slug
- `getCategoriesByAnimal(animalType)` - All categories for animal (with hierarchy)
- `getCategoriesForAnimal(animalType)` - Main categories for animal (no parents)
- `getSubcategoriesForCategory(categoryId, animalType)` - Subcategories

## Database Verification

To verify your categories table structure:

```sql
-- Check table structure
\d categories

-- Check animal_type constraint
SELECT constraint_name, constraint_type, constraint_definition
FROM information_schema.table_constraints tc
WHERE table_name = 'categories';

-- Count by animal type
SELECT animal_type, COUNT(*) as count
FROM categories
GROUP BY animal_type
ORDER BY animal_type;
```
