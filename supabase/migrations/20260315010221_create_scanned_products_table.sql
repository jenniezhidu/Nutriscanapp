/*
  # Create scanned products table

  1. New Tables
    - `scanned_products`
      - `id` (uuid, primary key) - Unique identifier for each scan
      - `barcode` (text) - Product barcode or identifier
      - `product_name` (text) - Name of the product
      - `serving_size` (numeric) - Serving size in grams
      - `calories_per_100g` (numeric) - Calories per 100g
      - `protein_per_100g` (numeric) - Protein per 100g in grams
      - `carbs_per_100g` (numeric) - Carbohydrates per 100g in grams
      - `fat_per_100g` (numeric) - Fat per 100g in grams
      - `fiber_per_100g` (numeric) - Fiber per 100g in grams
      - `scanned_at` (timestamptz) - Timestamp of when the product was scanned
      - `created_at` (timestamptz) - Timestamp of when the record was created

  2. Security
    - Enable RLS on `scanned_products` table
    - Add policy for anyone to read product data
    - Add policy for anyone to insert scanned products
*/

CREATE TABLE IF NOT EXISTS scanned_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode text NOT NULL,
  product_name text NOT NULL,
  serving_size numeric DEFAULT 50,
  calories_per_100g numeric NOT NULL,
  protein_per_100g numeric NOT NULL,
  carbs_per_100g numeric NOT NULL,
  fat_per_100g numeric NOT NULL,
  fiber_per_100g numeric NOT NULL,
  scanned_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scanned_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read scanned products"
  ON scanned_products
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert scanned products"
  ON scanned_products
  FOR INSERT
  WITH CHECK (true);
