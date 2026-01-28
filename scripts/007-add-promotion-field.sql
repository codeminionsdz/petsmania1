-- ===================================================
-- Add promotion field to products table
-- ===================================================

-- Add on_promotion column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS on_promotion BOOLEAN DEFAULT false;

-- Create index for faster queries on promotion products
CREATE INDEX IF NOT EXISTS idx_products_on_promotion 
ON products(on_promotion) 
WHERE on_promotion = true;

-- Update existing products with discount to set on_promotion
UPDATE products 
SET on_promotion = true 
WHERE discount > 0;
