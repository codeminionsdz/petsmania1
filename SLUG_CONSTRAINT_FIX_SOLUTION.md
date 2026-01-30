# Solution: Fix Duplicate Slug Constraint Error

## Problem Summary
**Error:** `duplicate key value violates unique constraint "categories_slug_key"`
**When:** Adding a subcategory in the admin panel
**Root Cause:** The `categories` table has a global UNIQUE constraint on the `slug` column, which prevents having the same slug for subcategories under different parent categories.

---

## Root Cause Analysis

### Current Schema (Incorrect)
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,  -- ❌ Global unique constraint
  parent_id UUID REFERENCES categories(id),
  ...
);
```

**Problem:** This allows only one category with slug "nettoyants" in the entire database, regardless of whether it's a main category or a subcategory.

### New Schema (Fixed)
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  parent_id UUID REFERENCES categories(id),
  ...
  UNIQUE(slug, parent_id)  -- ✅ Composite unique constraint
);
```

**Solution:** This allows the same slug to appear multiple times as long as they have different parent_ids.

---

## Implementation Steps

### Step 1: Apply the Database Migration

**Option A: Via Supabase Dashboard (Recommended)**
1. Go to https://app.supabase.com/project
2. Click on your project
3. Go to **SQL Editor** (sidebar)
4. Click **New Query**
5. Copy and paste this SQL:

```sql
-- Fix for duplicate slug constraint issue
ALTER TABLE categories DROP CONSTRAINT categories_slug_key;
ALTER TABLE categories ADD CONSTRAINT categories_slug_parent_unique UNIQUE (slug, parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
```

6. Click **Run** button
7. You should see: "Success. No rows returned."

**Option B: Via SQL File**
Execute the migration file directly:
```bash
# This file contains the exact SQL to run
scripts/005-fix-slug-constraint.sql
```

### Step 2: Verify the Fix

After applying the migration:

1. Navigate to **Admin > Categories** in your application
2. Try adding a subcategory with a slug that might already exist under another parent
3. It should now work without the constraint error

### Example Test Case

```
Main Categories:
├─ Nettoyants (slug: "nettoyants", parent_id: NULL)
├─ Santé (slug: "sante", parent_id: NULL)

Subcategories under "Nettoyants":
├─ Shampoings (slug: "shampoings", parent_id: nettoyants_uuid)
├─ Savons (slug: "savons", parent_id: nettoyants_uuid)

Subcategories under "Santé":
├─ Shampoings (slug: "shampoings", parent_id: sante_uuid) ✅ NOW WORKS!
├─ Suppléments (slug: "supplements", parent_id: sante_uuid)
```

---

## Database Changes Made

### Files Modified
1. **scripts/001-create-schema.sql**
   - Changed slug constraint from `UNIQUE` to composite `UNIQUE(slug, parent_id)`
   - Added index on `parent_id` for better query performance

2. **scripts/005-fix-slug-constraint.sql** (NEW)
   - Migration script to apply the fix to existing database
   - Safe to run on existing data

### Backward Compatibility
✅ **No data loss**
✅ **Existing queries will still work**
✅ **Performance improvement** (added parent_id index)

---

## How It Works

### Before (Global UNIQUE)
```
Categories Table:
┌─────┬──────────┬──────────┬──────────┐
│ id  │ name     │ slug     │ parent_id│
├─────┼──────────┼──────────┼──────────┤
│ 1   │ Chats    │ chats    │ NULL     │
│ 2   │ Chiens   │ chiens   │ NULL     │
│ 3   │ Jouets   │ jouets   │ 1        │
│ 4   │ Jouets   │ jouets   │ 2        │ ❌ ERROR: duplicate slug!
└─────┴──────────┴──────────┴──────────┘
```

### After (Composite UNIQUE)
```
Categories Table:
┌─────┬──────────┬──────────┬──────────┐
│ id  │ name     │ slug     │ parent_id│
├─────┼──────────┼──────────┼──────────┤
│ 1   │ Chats    │ chats    │ NULL     │
│ 2   │ Chiens   │ chiens   │ NULL     │
│ 3   │ Jouets   │ jouets   │ 1        │
│ 4   │ Jouets   │ jouets   │ 2        │ ✅ OK: (jouets, 2) is unique!
└─────┴──────────┴──────────┴──────────┘

Unique constraint: UNIQUE(slug, parent_id)
- ("chats", NULL) ✓
- ("chiens", NULL) ✓
- ("jouets", 1) ✓
- ("jouets", 2) ✓ Different parent_id
```

---

## Technical Details

### Constraint Name Changes
- **Old:** `categories_slug_key`
- **New:** `categories_slug_parent_unique`

### Indexes Added
- `idx_categories_parent` - For queries filtering by parent_id

### No Application Code Changes Required
✅ The API routes (`app/api/admin/categories/route.ts`) don't need modification
✅ The component (`components/admin/categories-page-content.tsx`) doesn't need modification
✅ All existing functionality remains the same

---

## Testing Checklist

- [ ] Applied the migration SQL to the database
- [ ] Admin dashboard loads without errors
- [ ] Can add a main category
- [ ] Can add a subcategory with a unique slug under a parent
- [ ] Can add a subcategory with the same slug under a different parent
- [ ] Can view all categories and subcategories
- [ ] Can edit categories
- [ ] Can delete categories
- [ ] Products still display correctly with the new constraint

---

## Troubleshooting

### Error: "constraint ... already exists"
- The migration may have already been applied
- This is safe to ignore

### Error: "constraint ... does not exist"
- The constraint name might have changed
- Check the Supabase dashboard to see current constraints

### Still Getting Duplicate Error After Migration
1. Clear your browser cache
2. Restart the development server: `npm run dev`
3. Try adding the subcategory again

---

## References

- **Supabase Dashboard:** https://app.supabase.com
- **PostgreSQL UNIQUE Constraints:** https://www.postgresql.org/docs/current/ddl-constraints.html
- **Composite Keys:** https://en.wikipedia.org/wiki/Composite_key

---

## Summary

This fix changes the database constraint from a global unique constraint to a **composite unique constraint** on `(slug, parent_id)`. This allows subcategories to have the same slug as long as they're under different parent categories, which is the correct behavior for a hierarchical category system.

The fix is:
- ✅ Safe (no data loss)
- ✅ Simple (one SQL statement)
- ✅ Backward compatible
- ✅ Improves query performance
