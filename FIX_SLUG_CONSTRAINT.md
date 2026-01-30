# Fix Duplicate Slug Constraint Error

## Problem
When trying to add a subcategory, you get this error:
```
Error: duplicate key value violates unique constraint "categories_slug_key"
```

This happens because the `slug` field has a global UNIQUE constraint, which means you can't have the same slug for subcategories under different parent categories.

## Solution
The solution is to replace the global UNIQUE constraint with a **composite unique constraint** on `(slug, parent_id)`. This allows:
- Main categories to have unique slugs (since parent_id = NULL)
- Subcategories under different parents to share the same slug

## How to Apply the Fix

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Create a new query and paste the SQL from `scripts/005-fix-slug-constraint.sql`:

```sql
-- Fix for duplicate slug constraint issue
ALTER TABLE categories DROP CONSTRAINT categories_slug_key;
ALTER TABLE categories ADD CONSTRAINT categories_slug_parent_unique UNIQUE (slug, parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug_for_queries ON categories(slug) WHERE parent_id IS NULL;
```

5. Run the query (click "Run")
6. You should see: "Success. No rows returned."

### Option 2: Using Node.js Script
```bash
node scripts/migrate-slug-constraint.js
```

Note: This requires the Supabase RPC function to be available.

## What This Does

### Before:
- `slug` has a UNIQUE constraint
- This prevents duplicate slugs globally
- ❌ Cannot add subcategory with slug "nettoyants" if it already exists anywhere

### After:
- `slug` and `parent_id` together form a UNIQUE constraint
- Slugs can repeat under different parents
- ✅ Can add subcategory "nettoyants" under Parent A and another "nettoyants" under Parent B

## Testing

After applying the fix:

1. Go to Admin > Categories
2. Try to add a subcategory with a slug that might already exist
3. It should now work without the duplicate key error

## Example Use Case

```
Main Categories:
  - Nettoyants (slug: "nettoyants", parent_id: NULL)
  - Santé (slug: "sante", parent_id: NULL)

Subcategories under "Nettoyants":
  - Shampoings (slug: "shampoings", parent_id: nettoyants_id)
  - Savons (slug: "savons", parent_id: nettoyants_id)

Subcategories under "Santé":
  - Shampoings (slug: "shampoings", parent_id: sante_id) ✅ Now allowed!
  - Suppléments (slug: "supplements", parent_id: sante_id)
```

## Database Impact

This is a **zero-impact migration** for existing data:
- No data is deleted or modified
- Only the constraint structure changes
- Query performance remains the same (we added an index)

---
If you have any questions or issues, check the error message in the Supabase dashboard logs.
