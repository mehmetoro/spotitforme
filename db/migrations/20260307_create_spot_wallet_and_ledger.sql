-- =============================================
-- SPOT ECONOMY: wallet + ledger
-- =============================================
-- Description:
--   Phase 1 foundation for Spot (discount credit) economy.
--   Creates wallet balances, immutable ledger, and safe RPC functions.
-- Created: 2026-03-07

-- shared trigger helper (safe to re-run)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- 1) spot_wallets
-- =============================================
CREATE TABLE IF NOT EXISTS spot_wallets (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 0 CHECK (balance >= 0),
  lifetime_earned integer NOT NULL DEFAULT 0 CHECK (lifetime_earned >= 0),
  lifetime_spent integer NOT NULL DEFAULT 0 CHECK (lifetime_spent >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS spot_wallets_balance_idx ON spot_wallets(balance DESC);

DROP TRIGGER IF EXISTS update_spot_wallets_updated_at ON spot_wallets;
CREATE TRIGGER update_spot_wallets_updated_at
  BEFORE UPDATE ON spot_wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE spot_wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own wallet" ON spot_wallets;
CREATE POLICY "Users can view own wallet"
  ON spot_wallets FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own wallet" ON spot_wallets;
CREATE POLICY "Users can insert own wallet"
  ON spot_wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- no direct update/delete policy for authenticated users.
-- balance mutations should go through RPC functions below.

-- =============================================
-- 2) spot_ledger (append-only)
-- =============================================
CREATE TABLE IF NOT EXISTS spot_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  to_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  amount integer NOT NULL CHECK (amount > 0),
  transaction_type text NOT NULL CHECK (
    transaction_type IN ('earn', 'spend', 'transfer', 'upgrade', 'discount_purchase', 'discount_sale', 'adjustment')
  ),
  reason text NOT NULL,
  reference_type text,
  reference_id uuid,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'reversed')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS spot_ledger_from_user_idx ON spot_ledger(from_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS spot_ledger_to_user_idx ON spot_ledger(to_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS spot_ledger_type_idx ON spot_ledger(transaction_type, created_at DESC);
CREATE INDEX IF NOT EXISTS spot_ledger_reference_idx ON spot_ledger(reference_type, reference_id);

ALTER TABLE spot_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own spot ledger" ON spot_ledger;
CREATE POLICY "Users can view own spot ledger"
  ON spot_ledger FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- no insert/update/delete policy for authenticated users.
-- writes are done through SECURITY DEFINER RPC functions.

-- =============================================
-- 3) helper function: ensure wallet exists
-- =============================================
CREATE OR REPLACE FUNCTION ensure_spot_wallet(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO spot_wallets (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- =============================================
-- 4) read function: get balance
-- =============================================
CREATE OR REPLACE FUNCTION get_spot_balance(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance integer;
BEGIN
  -- owner or service_role can read
  IF auth.uid() IS DISTINCT FROM p_user_id
     AND current_setting('request.jwt.claim.role', true) <> 'service_role' THEN
    RAISE EXCEPTION 'Not authorized to read this wallet';
  END IF;

  PERFORM ensure_spot_wallet(p_user_id);

  SELECT balance INTO v_balance
  FROM spot_wallets
  WHERE user_id = p_user_id;

  RETURN COALESCE(v_balance, 0);
END;
$$;

-- =============================================
-- 5) earn function: award spot
-- =============================================
CREATE OR REPLACE FUNCTION award_spot(
  p_user_id uuid,
  p_amount integer DEFAULT 1,
  p_reason text DEFAULT 'help_approved',
  p_reference_type text DEFAULT NULL,
  p_reference_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ledger_id uuid;
BEGIN
  -- only service_role should award
  IF current_setting('request.jwt.claim.role', true) <> 'service_role' THEN
    RAISE EXCEPTION 'Only service role can award spot';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than 0';
  END IF;

  PERFORM ensure_spot_wallet(p_user_id);

  UPDATE spot_wallets
  SET
    balance = balance + p_amount,
    lifetime_earned = lifetime_earned + p_amount
  WHERE user_id = p_user_id;

  INSERT INTO spot_ledger (
    from_user_id,
    to_user_id,
    amount,
    transaction_type,
    reason,
    reference_type,
    reference_id,
    metadata,
    created_by
  ) VALUES (
    NULL,
    p_user_id,
    p_amount,
    'earn',
    p_reason,
    p_reference_type,
    p_reference_id,
    COALESCE(p_metadata, '{}'::jsonb),
    auth.uid()
  )
  RETURNING id INTO v_ledger_id;

  RETURN v_ledger_id;
END;
$$;

-- =============================================
-- 6) spend function: deduct spot (e.g. upgrade)
-- =============================================
CREATE OR REPLACE FUNCTION spend_spot(
  p_user_id uuid,
  p_amount integer,
  p_reason text,
  p_reference_type text DEFAULT NULL,
  p_reference_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ledger_id uuid;
BEGIN
  -- owner or service_role
  IF auth.uid() IS DISTINCT FROM p_user_id
     AND current_setting('request.jwt.claim.role', true) <> 'service_role' THEN
    RAISE EXCEPTION 'Not authorized to spend from this wallet';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than 0';
  END IF;

  PERFORM ensure_spot_wallet(p_user_id);

  UPDATE spot_wallets
  SET
    balance = balance - p_amount,
    lifetime_spent = lifetime_spent + p_amount
  WHERE user_id = p_user_id
    AND balance >= p_amount;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient spot balance';
  END IF;

  INSERT INTO spot_ledger (
    from_user_id,
    to_user_id,
    amount,
    transaction_type,
    reason,
    reference_type,
    reference_id,
    metadata,
    created_by
  ) VALUES (
    p_user_id,
    NULL,
    p_amount,
    'spend',
    p_reason,
    p_reference_type,
    p_reference_id,
    COALESCE(p_metadata, '{}'::jsonb),
    auth.uid()
  )
  RETURNING id INTO v_ledger_id;

  RETURN v_ledger_id;
END;
$$;

-- =============================================
-- 7) transfer function: user-to-user spot transfer
-- =============================================
CREATE OR REPLACE FUNCTION transfer_spot(
  p_from_user_id uuid,
  p_to_user_id uuid,
  p_amount integer,
  p_reason text DEFAULT 'transfer',
  p_reference_type text DEFAULT NULL,
  p_reference_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ledger_id uuid;
BEGIN
  -- sender or service_role
  IF auth.uid() IS DISTINCT FROM p_from_user_id
     AND current_setting('request.jwt.claim.role', true) <> 'service_role' THEN
    RAISE EXCEPTION 'Not authorized to transfer from this wallet';
  END IF;

  IF p_from_user_id = p_to_user_id THEN
    RAISE EXCEPTION 'Sender and receiver cannot be the same';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than 0';
  END IF;

  PERFORM ensure_spot_wallet(p_from_user_id);
  PERFORM ensure_spot_wallet(p_to_user_id);

  UPDATE spot_wallets
  SET
    balance = balance - p_amount,
    lifetime_spent = lifetime_spent + p_amount
  WHERE user_id = p_from_user_id
    AND balance >= p_amount;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient spot balance';
  END IF;

  UPDATE spot_wallets
  SET
    balance = balance + p_amount,
    lifetime_earned = lifetime_earned + p_amount
  WHERE user_id = p_to_user_id;

  INSERT INTO spot_ledger (
    from_user_id,
    to_user_id,
    amount,
    transaction_type,
    reason,
    reference_type,
    reference_id,
    metadata,
    created_by
  ) VALUES (
    p_from_user_id,
    p_to_user_id,
    p_amount,
    'transfer',
    p_reason,
    p_reference_type,
    p_reference_id,
    COALESCE(p_metadata, '{}'::jsonb),
    auth.uid()
  )
  RETURNING id INTO v_ledger_id;

  RETURN v_ledger_id;
END;
$$;

-- =============================================
-- 8) permissions
-- =============================================
REVOKE ALL ON FUNCTION ensure_spot_wallet(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION get_spot_balance(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION award_spot(uuid, integer, text, text, uuid, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION spend_spot(uuid, integer, text, text, uuid, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION transfer_spot(uuid, uuid, integer, text, text, uuid, jsonb) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION get_spot_balance(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION spend_spot(uuid, integer, text, text, uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION transfer_spot(uuid, uuid, integer, text, text, uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION award_spot(uuid, integer, text, text, uuid, jsonb) TO service_role;

-- =============================================
-- 9) comments
-- =============================================
COMMENT ON TABLE spot_wallets IS 'Spot balances per user for in-platform discount credits';
COMMENT ON TABLE spot_ledger IS 'Immutable Spot movement history (earn/spend/transfer/upgrade)';
COMMENT ON FUNCTION get_spot_balance(uuid) IS 'Returns current Spot balance for owner (or service role).';
COMMENT ON FUNCTION award_spot(uuid, integer, text, text, uuid, jsonb) IS 'Service role only: adds Spot to user wallet and writes ledger row.';
COMMENT ON FUNCTION spend_spot(uuid, integer, text, text, uuid, jsonb) IS 'Deducts Spot from user wallet and writes ledger row.';
COMMENT ON FUNCTION transfer_spot(uuid, uuid, integer, text, text, uuid, jsonb) IS 'Transfers Spot from one user wallet to another and writes ledger row.';
