-- =============================================
-- PHASE 3: shop product limits + Spot upgrade
-- =============================================
-- Description:
--   Starter shops: 20 products
--   Pro shops: 100 products
--   Pro upgrade can be purchased with 10 Spot (no payment provider needed)
-- Created: 2026-03-08

-- 1) Add shop product limit column
ALTER TABLE shops
  ADD COLUMN IF NOT EXISTS product_limit integer;

UPDATE shops
SET product_limit = CASE
  WHEN COALESCE(subscription_type, 'free') = 'free' THEN 20
  ELSE 100
END
WHERE product_limit IS NULL;

ALTER TABLE shops
  ALTER COLUMN product_limit SET DEFAULT 20;

-- keep data safe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'shops_product_limit_positive'
  ) THEN
    ALTER TABLE shops
      ADD CONSTRAINT shops_product_limit_positive CHECK (product_limit > 0);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS shops_subscription_type_idx
  ON shops(subscription_type);

-- 2) Keep product_limit in sync on new/updated rows
CREATE OR REPLACE FUNCTION sync_shop_product_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.subscription_type := COALESCE(NEW.subscription_type, 'free');
  NEW.product_limit := CASE
    WHEN NEW.subscription_type = 'free' THEN 20
    ELSE 100
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_sync_shop_product_limit ON shops;
CREATE TRIGGER trigger_sync_shop_product_limit
  BEFORE INSERT OR UPDATE OF subscription_type, product_limit
  ON shops
  FOR EACH ROW
  EXECUTE FUNCTION sync_shop_product_limit();

-- 3) Enforce product limit at DB level
CREATE OR REPLACE FUNCTION enforce_shop_inventory_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_limit integer;
  v_subscription text;
  v_count integer;
BEGIN
  SELECT
    COALESCE(product_limit, CASE WHEN COALESCE(subscription_type, 'free') = 'free' THEN 20 ELSE 100 END),
    COALESCE(subscription_type, 'free')
  INTO v_limit, v_subscription
  FROM shops
  WHERE id = NEW.shop_id;

  IF v_limit IS NULL THEN
    RAISE EXCEPTION 'Shop not found for inventory insert';
  END IF;

  SELECT COUNT(*)
  INTO v_count
  FROM shop_inventory
  WHERE shop_id = NEW.shop_id;

  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'Product limit exceeded for % plan. Current: %, Limit: %', v_subscription, v_count, v_limit;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_enforce_shop_inventory_limit ON shop_inventory;
CREATE TRIGGER trigger_enforce_shop_inventory_limit
  BEFORE INSERT ON shop_inventory
  FOR EACH ROW
  EXECUTE FUNCTION enforce_shop_inventory_limit();

-- 4) Spot-based shop upgrade (free -> pro)
CREATE OR REPLACE FUNCTION upgrade_shop_to_pro_with_spot(p_shop_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_actor_id uuid;
  v_actor_role text;
  v_owner_id uuid;
  v_subscription text;
  v_ledger_id uuid;
BEGIN
  v_actor_id := auth.uid();
  v_actor_role := current_setting('request.jwt.claim.role', true);

  SELECT owner_id, COALESCE(subscription_type, 'free')
    INTO v_owner_id, v_subscription
  FROM shops
  WHERE id = p_shop_id
  FOR UPDATE;

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Shop not found';
  END IF;

  IF v_actor_role <> 'service_role' AND v_actor_id IS DISTINCT FROM v_owner_id THEN
    RAISE EXCEPTION 'Only shop owner can upgrade this shop';
  END IF;

  IF v_subscription IN ('pro', 'premium') THEN
    UPDATE shops
    SET product_limit = 100
    WHERE id = p_shop_id;

    RETURN jsonb_build_object(
      'success', true,
      'already_pro', true,
      'subscription_type', v_subscription,
      'product_limit', 100
    );
  END IF;

  -- Costs 10 Spot
  SELECT spend_spot(
    v_owner_id,
    10,
    'shop_upgrade_pro',
    'shop',
    p_shop_id,
    jsonb_build_object('target_plan', 'pro', 'product_limit', 100)
  )
  INTO v_ledger_id;

  UPDATE shops
  SET
    subscription_type = 'pro',
    product_limit = 100
  WHERE id = p_shop_id;

  RETURN jsonb_build_object(
    'success', true,
    'already_pro', false,
    'subscription_type', 'pro',
    'product_limit', 100,
    'spot_spent', 10,
    'ledger_id', v_ledger_id
  );
END;
$$;

-- 5) Grants
REVOKE ALL ON FUNCTION enforce_shop_inventory_limit() FROM PUBLIC;
REVOKE ALL ON FUNCTION upgrade_shop_to_pro_with_spot(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION upgrade_shop_to_pro_with_spot(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION upgrade_shop_to_pro_with_spot(uuid) TO service_role;

-- 6) Comments
COMMENT ON COLUMN shops.product_limit IS 'Maximum number of products a shop can create based on plan';
COMMENT ON FUNCTION enforce_shop_inventory_limit() IS 'Prevents inserting shop_inventory rows above plan product limit';
COMMENT ON FUNCTION upgrade_shop_to_pro_with_spot(uuid) IS 'Spends 10 Spot and upgrades shop to pro (100 product limit)';
