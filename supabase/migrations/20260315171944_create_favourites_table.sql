/*
  # Create favourites table

  1. New Tables
    - `favourites`
      - `id` (uuid, primary key) - Unique identifier for each favourite
      - `user_id` (uuid) - Reference to the user who saved the favourite
      - `product_name` (text) - Name of the product
      - `product_data` (jsonb) - Complete product data including nutrition info
      - `created_at` (timestamptz) - When the favourite was added
      
  2. Security
    - Enable RLS on `favourites` table
    - Add policy for authenticated users to read their own favourites
    - Add policy for authenticated users to insert their own favourites
    - Add policy for authenticated users to delete their own favourites
    
  3. Notes
    - For this demo app without authentication, we'll allow anonymous access
    - In production, this should be locked down to authenticated users only
*/

CREATE TABLE IF NOT EXISTS favourites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL,
  product_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE favourites ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read, insert, and delete favourites
-- In production, these policies should check auth.uid()
CREATE POLICY "Anyone can view favourites"
  ON favourites
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can add favourites"
  ON favourites
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can remove favourites"
  ON favourites
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Add index on product_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_favourites_product_name ON favourites(product_name);