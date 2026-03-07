-- =============================================
-- PHASE 5.1: Spot discount request workflow
-- =============================================
-- Description:
--   Buyer creates a discount request (pending)
--   Seller confirms real-world deal first
--   Spot transfer happens only after seller approval
-- Created: 2026-03-08

CREATE TABLE IF NOT EXISTS shop_product_discount_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  product_id uuid NOT NULL REFERENCES shop_inventory(id) ON DELETE RESTRICT,
  shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE RESTRICT,
  spot_amount integer NOT NULL CHECK (spot_amount >= 1 AND spot_amount <= 50),
  discount_amount_usd decimal(10, 2) NOT NULL,
  discount_amount_local decimal(10, 2) NOT NULL,
  original_price decimal(10, 2) NOT NULL,
  final_price decimal(10, 2) NOT NULL,
  currency varchar(3) DEFAULT 'TRY',
  exchange_rate decimal(10, 4) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  request_note text,
  seller_note text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  responded_at timestamp with time zone,
  CONSTRAINT discount_request_buyer_not_seller CHECK (buyer_id <> seller_id)
);

CREATE INDEX IF NOT EXISTS shop_product_discount_requests_buyer_idx
  ON shop_product_discount_requests(buyer_id);

CREATE INDEX IF NOT EXISTS shop_product_discount_requests_seller_idx
  ON shop_product_discount_requests(seller_id);

CREATE INDEX IF NOT EXISTS shop_product_discount_requests_product_idx
  ON shop_product_discount_requests(product_id);

CREATE INDEX IF NOT EXISTS shop_product_discount_requests_status_idx
  ON shop_product_discount_requests(status);

CREATE UNIQUE INDEX IF NOT EXISTS shop_product_discount_requests_pending_unique_idx
  ON shop_product_discount_requests(buyer_id, product_id)
  WHERE status = 'pending';

ALTER TABLE shop_product_discount_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Discount requests select own" ON shop_product_discount_requests;
CREATE POLICY "Discount requests select own"
  ON shop_product_discount_requests
  FOR SELECT
  USING (
    auth.uid() = buyer_id
    OR auth.uid() = seller_id
    OR EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_product_discount_requests.shop_id
      AND shops.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Discount requests insert buyer" ON shop_product_discount_requests;
CREATE POLICY "Discount requests insert buyer"
  ON shop_product_discount_requests
  FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Discount requests update seller" ON shop_product_discount_requests;
CREATE POLICY "Discount requests update seller"
  ON shop_product_discount_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_product_discount_requests.shop_id
      AND shops.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_product_discount_requests.shop_id
      AND shops.owner_id = auth.uid()
    )
  );

COMMENT ON TABLE shop_product_discount_requests IS 'Buyer discount requests for spot-based discount flow';
COMMENT ON COLUMN shop_product_discount_requests.status IS 'pending/approved/rejected/completed/cancelled';
COMMENT ON COLUMN shop_product_discount_requests.spot_amount IS 'Requested Spot discount amount (1-50)';
COMMENT ON COLUMN shop_product_discount_requests.discount_amount_usd IS 'Discount calculated in USD (1 Spot = 1 USD)';
COMMENT ON COLUMN shop_product_discount_requests.discount_amount_local IS 'Discount amount in product local currency';
COMMENT ON COLUMN shop_product_discount_requests.final_price IS 'Final price after discount (informational)';
COMMENT ON COLUMN shop_product_discount_requests.exchange_rate IS 'USD to local currency rate at request time';
