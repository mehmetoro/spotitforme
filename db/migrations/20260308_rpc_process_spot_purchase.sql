-- =============================================
-- PHASE 5: RPC Function for Spot-based purchases
-- =============================================
-- Function: process_spot_purchase
-- Description:
--   Complete a product purchase using Spot currency
--   Transfer Spot from buyer to seller
--   Create ledger entries for both parties
--   Record purchase transaction
-- Security: SECURITY DEFINER (runs as owner)
-- Created: 2026-03-08

CREATE OR REPLACE FUNCTION process_spot_purchase(
  p_buyer_id uuid,
  p_seller_id uuid,
  p_product_id uuid,
  p_shop_id uuid,
  p_spot_amount integer
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product RECORD;
  v_buyer_wallet RECORD;
  v_seller_wallet RECORD;
  v_new_purchase_id uuid;
  v_error_msg text;
BEGIN
  -- 1) Validate: Product exists and belongs to shop
  SELECT id, title, price, price_currency, shop_id
  INTO v_product
  FROM shop_inventory
  WHERE id = p_product_id AND shop_id = p_shop_id AND status = 'active';
  
  IF v_product IS NULL THEN
    v_error_msg := 'Ürün bulunamadı veya aktif değil';
    RAISE EXCEPTION 'PRODUCT_NOT_FOUND: %', v_error_msg;
  END IF;
  
  -- 2) Validate: Spot amount is valid (1, 2, or 3)
  IF p_spot_amount NOT IN (1, 2, 3) THEN
    v_error_msg := 'Geçersiz Spot miktarı (1, 2 veya 3 olmalı)';
    RAISE EXCEPTION 'INVALID_SPOT_AMOUNT: %', v_error_msg;
  END IF;
  
  -- 3) Validate: Buyer is different from seller
  IF p_buyer_id = p_seller_id THEN
    v_error_msg := 'Alıcı ve satıcı aynı olamaz';
    RAISE EXCEPTION 'SAME_USER: %', v_error_msg;
  END IF;
  
  -- 4) Check: Buyer has sufficient Spot balance
  SELECT balance
  INTO v_buyer_wallet
  FROM spot_wallet
  WHERE user_id = p_buyer_id;
  
  IF v_buyer_wallet IS NULL THEN
    v_error_msg := 'Alıcının Spot cüzdanı bulunamadı';
    RAISE EXCEPTION 'WALLET_NOT_FOUND: %', v_error_msg;
  END IF;
  
  IF v_buyer_wallet.balance < p_spot_amount THEN
    v_error_msg := 'Yetersiz Spot bakiyesi. Gerekli: ' || p_spot_amount || ', Mevcut: ' || v_buyer_wallet.balance;
    RAISE EXCEPTION 'INSUFFICIENT_BALANCE: %', v_error_msg;
  END IF;
  
  -- 5) Check: Seller wallet exists
  SELECT balance
  INTO v_seller_wallet
  FROM spot_wallet
  WHERE user_id = p_seller_id;
  
  IF v_seller_wallet IS NULL THEN
    v_error_msg := 'Satıcının Spot cüzdanı bulunamadı';
    RAISE EXCEPTION 'SELLER_WALLET_NOT_FOUND: %', v_error_msg;
  END IF;
  
  -- 6) Create purchase record
  INSERT INTO shop_product_purchases (
    buyer_id,
    seller_id,
    product_id,
    shop_id,
    spot_amount,
    purchase_price,
    currency,
    payment_method,
    status,
    created_at,
    updated_at
  ) VALUES (
    p_buyer_id,
    p_seller_id,
    p_product_id,
    p_shop_id,
    p_spot_amount,
    v_product.price,
    v_product.price_currency,
    'spot',
    'completed',
    now(),
    now()
  )
  RETURNING id INTO v_new_purchase_id;
  
  -- 7) Deduct Spot from buyer wallet
  UPDATE spot_wallet
  SET balance = balance - p_spot_amount,
      updated_at = now()
  WHERE user_id = p_buyer_id;
  
  -- 8) Add Spot to seller wallet
  UPDATE spot_wallet
  SET balance = balance + p_spot_amount,
      updated_at = now()
  WHERE user_id = p_seller_id;
  
  -- 9) Create ledger entry for buyer (spend)
  INSERT INTO spot_ledger (
    user_id,
    amount,
    type,
    reference_type,
    reference_id,
    description,
    created_at
  ) VALUES (
    p_buyer_id,
    -p_spot_amount,
    'spend',
    'purchase',
    v_new_purchase_id,
    'Ürün satın alma: ' || v_product.title,
    now()
  );
  
  -- 10) Create ledger entry for seller (earn)
  INSERT INTO spot_ledger (
    user_id,
    amount,
    type,
    reference_type,
    reference_id,
    description,
    created_at
  ) VALUES (
    p_seller_id,
    p_spot_amount,
    'earn',
    'purchase',
    v_new_purchase_id,
    'Ürün satışı: ' || v_product.title,
    now()
  );
  
  -- 11) Return success response
  RETURN json_build_object(
    'success', true,
    'purchase_id', v_new_purchase_id,
    'message', 'Satın alma başarılı',
    'buyer_spot_balance', v_buyer_wallet.balance - p_spot_amount,
    'seller_spot_balance', v_seller_wallet.balance + p_spot_amount
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM,
    'error_code', SQLSTATE
  );
END;
$$;

-- Grant permissions to anon and authenticated roles
GRANT EXECUTE ON FUNCTION process_spot_purchase(uuid, uuid, uuid, uuid, integer) 
  TO anon, authenticated;

