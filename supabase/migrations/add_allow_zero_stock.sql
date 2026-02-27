-- Add allow_zero_stock column to products table
-- This enables "Continue Selling" feature when stock reaches 0

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS allow_zero_stock BOOLEAN DEFAULT false;

-- Update existing products to allow zero stock sales (optional, uncomment if needed)
-- UPDATE products SET allow_zero_stock = true WHERE category IN ('Fruits', 'Vegetables');

COMMENT ON COLUMN products.allow_zero_stock IS 'Allow selling this product even when stock_quantity is 0';

