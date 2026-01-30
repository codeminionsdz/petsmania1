# Quick Fix: Duplicate Slug Constraint Error

## 🔴 Problem
```
Error: duplicate key value violates unique constraint "categories_slug_key"
```
When adding a subcategory, you get this error.

---

## ✅ Solution (30 seconds)

### Step 1: Go to Supabase Dashboard
https://app.supabase.com → Select your project

### Step 2: Open SQL Editor
Click **SQL Editor** in the left sidebar

### Step 3: Run This SQL
```sql
ALTER TABLE categories DROP CONSTRAINT categories_slug_key;
ALTER TABLE categories ADD CONSTRAINT categories_slug_parent_unique UNIQUE (slug, parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
```

Copy, paste, and click **Run** ▶️

### Step 4: Done!
You can now add subcategories with the same slug under different parents.

---

## 📋 What Changed?

**Before:** Only ONE "shampoings" slug allowed in entire database
```
❌ Can't do this:
- Main Category: Nettoyants > Shampoings (slug: shampoings)
- Main Category: Santé > Shampoings (slug: shampoings) ← ERROR
```

**After:** Same slug allowed under different parents
```
✅ Now works:
- Nettoyants > Shampoings (slug: shampoings, parent: nettoyants_id)
- Santé > Shampoings (slug: shampoings, parent: sante_id) ← OK!
```

---

## ❓ Questions?

See `SLUG_CONSTRAINT_FIX_SOLUTION.md` for detailed explanation.
See `FIX_SLUG_CONSTRAINT.md` for extended documentation.
