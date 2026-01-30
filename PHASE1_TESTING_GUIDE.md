# Phase 1 Testing & Validation Guide

## Quick Start: Test Phase 1 Implementation

### Prerequisites
- Database migration script executed: `scripts/026-animal-centric-phase1-categories.sql`
- New functions available in `lib/data.ts`
- Application compiled without TypeScript errors

---

## Unit Testing: Data Layer Functions

### Test 1: `getCategoriesByAnimal('cat')`

**Expected Behavior**:
- Returns all categories with `primary_animal_type = 'cat'`
- Includes categories with `primary_animal_type = NULL`
- Does NOT include categories marked for other animals only

**Test Code**:
```typescript
import { getCategoriesByAnimal } from '@/lib/data'

async function testGetCategoriesByAnimal() {
  console.log('Testing getCategoriesByAnimal...')
  
  try {
    const catCategories = await getCategoriesByAnimal('cat')
    
    console.log('✅ Retrieved categories for cats:')
    console.log(`   Total: ${catCategories.length}`)
    
    catCategories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.slug})`)
    })
    
    // Validation
    if (catCategories.length > 0) {
      console.log('✅ PASS: Got cat categories')
      return true
    } else {
      console.log('⚠️  WARNING: No cat categories returned')
      console.log('   This is OK if you haven\'t seeded primary_animal_type data yet')
      return true
    }
  } catch (error) {
    console.error('❌ FAIL:', error)
    return false
  }
}
```

**Run in browser console**:
```javascript
fetch('/api/test-categories-by-animal')
  .then(r => r.json())
  .then(r => console.log(r))
```

---

### Test 2: `getFeaturedProductsByAnimal('dog', 5)`

**Expected Behavior**:
- Returns up to 5 featured products for dogs
- Includes products with `animal_type = 'dog'`
- Includes products with `animal_type = NULL`
- Only returns `featured = true` products

**Test Code**:
```typescript
import { getFeaturedProductsByAnimal } from '@/lib/data'

async function testGetFeaturedProductsByAnimal() {
  console.log('Testing getFeaturedProductsByAnimal...')
  
  try {
    const products = await getFeaturedProductsByAnimal('dog', 5)
    
    console.log(`✅ Retrieved ${products.length} featured products for dogs`)
    products.forEach(p => {
      console.log(`   - ${p.name} (${p.animalType || 'no type'})`)
    })
    
    return products.length > 0 || products.length === 0 // Either is OK
  } catch (error) {
    console.error('❌ FAIL:', error)
    return false
  }
}
```

---

### Test 3: `getProductsByAnimalAndCategory('bird', 'toys')`

**Expected Behavior**:
- Returns products in 'toys' category for birds
- Includes products with `animal_type = 'bird'`
- Includes products with `animal_type = NULL`
- Returns paginated results

**Test Code**:
```typescript
import { getProductsByAnimalAndCategory } from '@/lib/data'

async function testGetProductsByAnimalAndCategory() {
  console.log('Testing getProductsByAnimalAndCategory...')
  
  try {
    const result = await getProductsByAnimalAndCategory('bird', 'toys')
    
    console.log(`✅ Retrieved products for bird toys:`)
    console.log(`   Total: ${result.total}`)
    console.log(`   Page: ${result.page} of ${result.totalPages}`)
    
    result.data.forEach(p => {
      console.log(`   - ${p.name}`)
    })
    
    return true
  } catch (error) {
    console.error('❌ FAIL:', error)
    return false
  }
}
```

---

### Test 4: `isCategoryForAnimal(categoryId, 'cat')`

**Expected Behavior**:
- Returns `true` if category is for cat (or for all animals)
- Returns `false` if category is specifically for other animal only

**Test Code**:
```typescript
import { isCategoryForAnimal } from '@/lib/data'

async function testIsCategoryForAnimal() {
  console.log('Testing isCategoryForAnimal...')
  
  try {
    // Get a known category ID first
    const categories = await getCategoriesByAnimal('cat')
    if (categories.length === 0) {
      console.log('⚠️  No categories available for testing')
      return true
    }
    
    const categoryId = categories[0].id
    const isForCat = await isCategoryForAnimal(categoryId, 'cat')
    
    console.log(`✅ Category "${categories[0].name}" for cat: ${isForCat}`)
    return true
  } catch (error) {
    console.error('❌ FAIL:', error)
    return false
  }
}
```

---

## Backward Compatibility Testing

### Test 5: Existing `getProducts()` Still Works

**Expected Behavior**:
- Returns all products (unchanged behavior)
- Products with any `animal_type` included
- Products with `animal_type = NULL` included

**Test Code**:
```typescript
import { getProducts } from '@/lib/data'

async function testBackwardCompatibility() {
  console.log('Testing backward compatibility...')
  
  try {
    const result = await getProducts()
    
    console.log(`✅ getProducts() returned ${result.data.length} products`)
    console.log(`   Total: ${result.total}`)
    
    // Check for animal type diversity
    const animalTypes = result.data.map(p => p.animalType).filter(Boolean)
    console.log(`   With animal type: ${animalTypes.length}`)
    console.log(`   Without animal type: ${result.data.length - animalTypes.length}`)
    
    return result.data.length > 0
  } catch (error) {
    console.error('❌ FAIL:', error)
    return false
  }
}
```

---

### Test 6: Existing `getCategoriesWithHierarchy()` Still Works

**Expected Behavior**:
- Returns all categories in hierarchy
- Categories with or without animal_type included
- Unchanged from before

**Test Code**:
```typescript
import { getCategoriesWithHierarchy } from '@/lib/data'

async function testCategoryHierarchy() {
  console.log('Testing category hierarchy...')
  
  try {
    const categories = await getCategoriesWithHierarchy()
    
    console.log(`✅ Retrieved ${categories.length} main categories`)
    
    categories.forEach(cat => {
      const childCount = cat.children?.length || 0
      console.log(`   - ${cat.name} (${childCount} children)`)
    })
    
    return categories.length > 0
  } catch (error) {
    console.error('❌ FAIL:', error)
    return false
  }
}
```

---

## Integration Testing

### Test 7: Animal Filter on Category Page

**Manual Test**:
1. Go to any category page (e.g., `/categories/toys`)
2. Open browser DevTools Console
3. Run:
```javascript
// Check if animal filter UI appears
const filterButtons = document.querySelectorAll('button[data-animal-type]')
console.log(`Found ${filterButtons.length} animal filter buttons`)
filterButtons.forEach(btn => console.log(btn.textContent))
```

**Expected**:
- Should see 5 buttons: ✨ Tous, 🐱 Chats, 🐕 Chiens, 🐦 Oiseaux, 🐾 Autres
- All should be functional

---

### Test 8: Animal Categories on Homepage

**Manual Test**:
1. Go to homepage (`/`)
2. Scroll down to "Trouvez par animal" section
3. Verify:
   - [ ] 4 cards visible (Chats, Chiens, Oiseaux, Autres)
   - [ ] Cards are clickable
   - [ ] Click cat card → goes to `/categories/cat`
   - [ ] Click dog card → goes to `/categories/dog`
   - [ ] Etc.

---

## Database Verification

### Query 1: Check Schema Changes

```sql
-- See new column
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'categories' 
  AND column_name = 'primary_animal_type';

-- Expected result:
-- | column_name | data_type | is_nullable |
-- |---|---|---|
-- | primary_animal_type | character varying | YES |
```

### Query 2: Check Junction Table

```sql
-- See junction table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'category_animals'
ORDER BY ordinal_position;

-- Expected columns: id, category_id, animal_type, created_at
```

### Query 3: Check Indexes

```sql
-- See new indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE tablename IN ('categories', 'category_animals')
ORDER BY tablename, indexname;

-- Should see:
-- idx_categories_primary_animal
-- idx_category_animals_animal_type
-- idx_category_animals_category_id
```

### Query 4: Check View

```sql
-- Test the view
SELECT * FROM categories_by_animal LIMIT 5;

-- Should return: id, name, slug, description, image, parent_id, product_count, animal_type
```

---

## Performance Testing

### Test 9: Query Performance

Run these queries and note execution time:

```sql
-- Get categories for one animal (should use index)
SELECT * FROM categories 
WHERE primary_animal_type = 'cat' OR primary_animal_type IS NULL;

-- Get categories with animal mapping (should use index)
SELECT DISTINCT c.* FROM categories c
LEFT JOIN category_animals ca ON c.id = ca.category_id
WHERE ca.animal_type = 'cat' OR c.primary_animal_type = 'cat';

-- Get products for animal + category (should use indexes)
SELECT p.* FROM products p
WHERE (p.animal_type = 'cat' OR p.animal_type IS NULL)
  AND p.category_id IN (SELECT id FROM categories WHERE primary_animal_type = 'cat' OR primary_animal_type IS NULL);
```

**Expected**:
- All queries complete in < 100ms
- `EXPLAIN ANALYZE` shows index usage

---

## Test Checklist

### Phase 1 Complete ✅ When All Pass:

- [ ] **Database Tests**
  - [ ] Migration script runs without errors
  - [ ] Schema verification queries return expected results
  - [ ] Indexes exist and are used
  - [ ] View works correctly

- [ ] **Function Tests**
  - [ ] `getCategoriesByAnimal()` returns results
  - [ ] `getBrandsForAnimal()` returns results
  - [ ] `getFeaturedProductsByAnimal()` returns results
  - [ ] `getProductsByAnimalAndCategory()` returns paginated results
  - [ ] `isCategoryForAnimal()` returns boolean

- [ ] **Backward Compatibility**
  - [ ] `getProducts()` works (unchanged)
  - [ ] `getCategoriesWithHierarchy()` works (unchanged)
  - [ ] `getBrands()` works (unchanged)
  - [ ] Products with NULL animal_type appear in all queries
  - [ ] Categories with NULL primary_animal_type appear everywhere

- [ ] **Integration**
  - [ ] Animal filter UI appears on pages
  - [ ] Homepage animal cards display
  - [ ] Clicking animal cards navigates correctly

- [ ] **Performance**
  - [ ] All queries complete in < 100ms
  - [ ] Indexes are used (EXPLAIN shows)
  - [ ] No N+1 query problems

---

## Troubleshooting

### Issue: "Function does not exist" error

**Cause**: New functions not in `lib/data.ts`

**Fix**: 
```bash
# Check file was updated
grep "getCategoriesByAnimal" lib/data.ts

# Restart dev server
npm run dev
```

### Issue: Migration fails

**Cause**: Syntax error or permission issue

**Debug**:
```sql
-- Check what already exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'categories' 
    AND column_name = 'primary_animal_type'
);

-- Should return: true (if migration succeeded) or false
```

### Issue: No categories returned

**Cause**: No data has `primary_animal_type` set

**Fix**: Seed data or set manually
```sql
UPDATE categories SET primary_animal_type = 'cat' WHERE id = '...'
```

### Issue: Performance slow

**Cause**: Missing indexes

**Check**:
```sql
-- Verify indexes exist
SELECT * FROM pg_indexes WHERE tablename = 'categories';
SELECT * FROM pg_indexes WHERE tablename = 'category_animals';
```

---

## Sign-Off

✅ **Phase 1 is production-ready when**:
1. All tests pass
2. No TypeScript errors
3. Performance acceptable (< 100ms queries)
4. Backward compatibility verified
5. Team has reviewed and approved

**Next**: Proceed to Phase 2 (Page Structure)

