-- =============================================
-- PHASE 4: shop product spot discounts
-- =============================================
-- Description:
--   Sellers can mark products with 1/2/3 Spot discounts
--   Buyers pay with Spot instead of (or in addition to) money
--   Discount is optional (null = no discount)
-- Created: 2026-03-08

-- 1) Add spot_discount column to shop_inventory
ALTER TABLE shop_inventory
  ADD COLUMN IF NOT EXISTS spot_discount integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'shop_inventory_spot_discount_valid'
  ) THEN
    ALTER TABLE shop_inventory
      ADD CONSTRAINT shop_inventory_spot_discount_valid 
        CHECK (spot_discount IS NULL OR spot_discount IN (1, 2, 3));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS shop_inventory_spot_discount_idx
  ON shop_inventory(spot_discount)
  WHERE spot_discount IS NOT NULL;

-- 2) Comments
COMMENT ON COLUMN shop_inventory.spot_discount IS 'Optional Spot discount: 1/2/3 Spot off. Null means no discount.';
