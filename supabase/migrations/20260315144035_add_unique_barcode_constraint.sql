/*
  # Add unique constraint to barcode column

  1. Changes
    - Add unique constraint to `barcode` column in `scanned_products` table
    - This prevents duplicate products from being stored
    - Ensures each barcode is only stored once for cost optimization

  2. Notes
    - Uses IF NOT EXISTS pattern to make migration idempotent
    - This enables the "scan once, free forever" feature
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'scanned_products_barcode_key'
  ) THEN
    ALTER TABLE scanned_products
    ADD CONSTRAINT scanned_products_barcode_key UNIQUE (barcode);
  END IF;
END $$;
