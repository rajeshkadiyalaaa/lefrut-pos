/*
  # Add image_url column to products table

  1. Changes
    - Add `image_url` column to `products` table
    - Set as TEXT type to store image URLs
    - Allow NULL values for existing products
    - Add default empty string for new products

  2. Notes
    - This fixes the schema mismatch error where frontend expects image_url column
    - Existing products will have NULL image_url initially
*/

-- Add image_url column to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE products ADD COLUMN image_url TEXT DEFAULT '';
  END IF;
END $$;