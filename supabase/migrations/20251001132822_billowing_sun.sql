/*
  # Add is_active column to products table

  1. Schema Changes
    - Add `is_active` boolean column to `products` table with default value `true`
    - This enables soft delete functionality to preserve transaction history

  2. Data Migration
    - Set all existing products to active status
*/

-- Add is_active column to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE products ADD COLUMN is_active boolean DEFAULT true NOT NULL;
  END IF;
END $$;

-- Ensure all existing products are marked as active
UPDATE products SET is_active = true WHERE is_active IS NULL;