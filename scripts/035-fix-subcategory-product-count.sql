-- Fix: Update trigger to handle subcategory_id in product count updates
-- This script updates the update_category_product_count function to properly handle
-- both category_id and subcategory_id when updating product counts.

-- Drop existing trigger first
DROP TRIGGER IF EXISTS trg_update_category_count ON products;

-- Update the function to handle both category_id and subcategory_id
CREATE OR REPLACE FUNCTION update_category_product_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update main category count
    IF NEW.category_id IS NOT NULL THEN
      UPDATE categories SET product_count = product_count + 1 WHERE id = NEW.category_id;
    END IF;
    -- Update subcategory count if subcategory_id is provided
    IF NEW.subcategory_id IS NOT NULL THEN
      UPDATE categories SET product_count = product_count + 1 WHERE id = NEW.subcategory_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update main category count
    IF OLD.category_id IS NOT NULL THEN
      UPDATE categories SET product_count = product_count - 1 WHERE id = OLD.category_id;
    END IF;
    -- Update subcategory count if subcategory_id was set
    IF OLD.subcategory_id IS NOT NULL THEN
      UPDATE categories SET product_count = product_count - 1 WHERE id = OLD.subcategory_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle main category_id changes
    IF OLD.category_id IS DISTINCT FROM NEW.category_id THEN
      IF OLD.category_id IS NOT NULL THEN
        UPDATE categories SET product_count = product_count - 1 WHERE id = OLD.category_id;
      END IF;
      IF NEW.category_id IS NOT NULL THEN
        UPDATE categories SET product_count = product_count + 1 WHERE id = NEW.category_id;
      END IF;
    END IF;
    -- Handle subcategory_id changes
    IF OLD.subcategory_id IS DISTINCT FROM NEW.subcategory_id THEN
      IF OLD.subcategory_id IS NOT NULL THEN
        UPDATE categories SET product_count = product_count - 1 WHERE id = OLD.subcategory_id;
      END IF;
      IF NEW.subcategory_id IS NOT NULL THEN
        UPDATE categories SET product_count = product_count + 1 WHERE id = NEW.subcategory_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trg_update_category_count
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION update_category_product_count();

-- Recalculate product counts for all categories
-- This sets the product_count based on actual product counts in the database
UPDATE categories
SET product_count = (
  SELECT COUNT(*) FROM products
  WHERE products.category_id = categories.id 
     OR products.subcategory_id = categories.id
)
WHERE categories.id IN (
  SELECT DISTINCT c.id FROM categories c
  LEFT JOIN products p ON p.category_id = c.id OR p.subcategory_id = c.id
  WHERE p.id IS NOT NULL OR c.parent_id IS NOT NULL
);

-- Log the changes
SELECT 
  id,
  name,
  slug,
  parent_id,
  product_count,
  (SELECT COUNT(*) FROM products WHERE products.category_id = categories.id OR products.subcategory_id = categories.id) as actual_count
FROM categories
WHERE product_count > 0
ORDER BY product_count DESC;
