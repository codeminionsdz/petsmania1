-- Fix for duplicate slug constraint issue
-- Changes the slug constraint from globally UNIQUE to (slug, parent_id) composite unique
-- This allows the same slug for subcategories under different parent categories

-- Step 1: Drop the existing UNIQUE constraint on slug (if it exists)
-- Try multiple possible constraint names
DO $$
BEGIN
  BEGIN
    ALTER TABLE categories DROP CONSTRAINT categories_slug_key;
    RAISE NOTICE 'Dropped constraint: categories_slug_key';
  EXCEPTION WHEN undefined_object THEN
    RAISE NOTICE 'Constraint categories_slug_key does not exist, trying alternative names...';
  END;
  
  BEGIN
    ALTER TABLE categories DROP CONSTRAINT slug_unique;
    RAISE NOTICE 'Dropped constraint: slug_unique';
  EXCEPTION WHEN undefined_object THEN
    RAISE NOTICE 'Constraint slug_unique does not exist';
  END;
END $$;

-- Step 2: Remove the UNIQUE constraint from the column definition if it exists
-- Check if the constraint already exists before adding it
DO $$
BEGIN
  -- Check if the composite constraint already exists
  IF NOT EXISTS (
    SELECT constraint_name 
    FROM information_schema.table_constraints 
    WHERE table_name='categories' AND constraint_name='categories_slug_parent_unique'
  ) THEN
    ALTER TABLE categories ADD CONSTRAINT categories_slug_parent_unique UNIQUE (slug, parent_id);
    RAISE NOTICE 'Created composite constraint: categories_slug_parent_unique';
  ELSE
    RAISE NOTICE 'Composite constraint already exists';
  END IF;
END $$;

-- Step 3: Create an index for faster lookups on parent_id
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
