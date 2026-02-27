/*
  # Add Shop Expenses Table

  1. New Tables
    - `shop_expenses`
      - `id` (uuid, primary key)
      - `description` (text)
      - `amount` (numeric)
      - `category` (text)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `shop_expenses` table
    - Add policies for authenticated users to manage their expenses
*/

CREATE TABLE IF NOT EXISTS shop_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  amount numeric(10,2) NOT NULL CHECK (amount >= 0),
  category text NOT NULL DEFAULT 'General',
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shop_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their expenses"
  ON shop_expenses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to product images
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');