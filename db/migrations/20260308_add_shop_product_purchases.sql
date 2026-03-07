-- =============================================
-- PHASE 5: Spot-based product purchases
-- =============================================
-- Description:
--   Track product purchases made with Spot currency
--   Link buyer and seller for Spot transfers
--   Record transaction history
-- Created: 2026-03-08

-- 1) Create shop_product_purchases table
CREATE TABLE IF NOT EXISTS shop_product_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  product_id uuid NOT NULL REFERENCES shop_inventory(id) ON DELETE RESTRICT,
  shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE RESTRICT,
  spot_amount integer NOT NULL,
  purchase_price decimal(12, 2) NOT NULL,
  currency varchar(3) NOT NULL DEFAULT 'TRY',
  payment_method varchar(50) NOT NULL DEFAULT 'spot' CHECK (payment_method IN ('spot', 'money', 'mixed')),
  status varchar(50) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Constraints
  CONSTRAINT buyer_not_seller CHECK (buyer_id != seller_id),
  CONSTRAINT valid_spot_amount CHECK (spot_amount IN (1, 2, 3))
);

-- 2) Indexes
CREATE INDEX IF NOT EXISTS shop_product_purchases_buyer_idx 
  ON shop_product_purchases(buyer_id);

CREATE INDEX IF NOT EXISTS shop_product_purchases_seller_idx 
  ON shop_product_purchases(seller_id);

CREATE INDEX IF NOT EXISTS shop_product_purchases_product_idx 
  ON shop_product_purchases(product_id);

CREATE INDEX IF NOT EXISTS shop_product_purchases_shop_idx 
  ON shop_product_purchases(shop_id);

CREATE INDEX IF NOT EXISTS shop_product_purchases_status_idx 
  ON shop_product_purchases(status);

CREATE INDEX IF NOT EXISTS shop_product_purchases_created_idx 
  ON shop_product_purchases(created_at DESC);

-- 3) RLS Policies
ALTER TABLE shop_product_purchases ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own purchases (as buyer or seller)
CREATE POLICY "Users can view their own purchases"
  ON shop_product_purchases
  FOR SELECT
  USING (
    auth.uid() = buyer_id
    OR auth.uid() = seller_id
    OR EXISTS (
      SELECT 1 FROM shops 
      WHERE shops.id = shop_product_purchases.shop_id 
      AND shops.owner_id = auth.uid()
    )
  );

-- Allow system to insert purchases
CREATE POLICY "System can insert purchases"
  ON shop_product_purchases
  FOR INSERT
  WITH CHECK (true);

-- 4) Comments
COMMENT ON TABLE shop_product_purchases IS 'Records of product purchases made with Spot currency';
COMMENT ON COLUMN shop_product_purchases.buyer_id IS 'User who bought the product with Spot';
COMMENT ON COLUMN shop_product_purchases.seller_id IS 'Shop owner who received the Spot payment';
COMMENT ON COLUMN shop_product_purchases.spot_amount IS 'Amount of Spot used (1, 2, or 3)';
COMMENT ON COLUMN shop_product_purchases.status IS 'Purchase status: pending, completed, cancelled, refunded';

