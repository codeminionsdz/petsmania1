-- Migration: Add animal_type support to products table
-- This enables product filtering and targeting by pet type
-- Non-breaking change: field is optional with NULL default for existing products

-- Create ENUM type for animal types
CREATE TYPE animal_type AS ENUM ('cat', 'dog', 'bird', 'other');

-- Add animal_type column to products table (optional, defaults to NULL)
ALTER TABLE products ADD COLUMN IF NOT EXISTS animal_type animal_type DEFAULT NULL;

-- Create indexes for better query performance on animal type filtering
CREATE INDEX IF NOT EXISTS idx_products_animal_type ON products(animal_type);
CREATE INDEX IF NOT EXISTS idx_products_category_animal ON products(category_id, animal_type);

-- Verify the migration was successful
-- Run this to confirm the column exists:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'products' AND column_name = 'animal_type';
