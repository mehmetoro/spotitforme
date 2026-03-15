-- =============================================
-- NOKTA REWARD: quick sighting -> +1 nokta
-- Every 10 nokta automatically converts to +1 Spot
-- =============================================

-- 1) Extend wallet with nokta tracking
ALTER TABLE spot_wallets
  ADD COLUMN IF NOT EXISTS nokta_balance integer NOT NULL DEFAULT 0 CHECK (nokta_balance >= 0),
  ADD COLUMN IF NOT EXISTS lifetime_nokta_earned integer NOT NULL DEFAULT 0 CHECK (lifetime_nokta_earned >= 0),
  ADD COLUMN IF NOT EXISTS lifetime_nokta_converted integer NOT NULL DEFAULT 0 CHECK (lifetime_nokta_converted >= 0);

-- 2) Idempotency table so each quick sighting awards only once
CREATE TABLE IF NOT EXISTS quick_sighting_nokta_rewards (
  quick_sighting_id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nokta_earned integer NOT NULL DEFAULT 1 CHECK (nokta_earned > 0),
  converted_spot integer NOT NULL DEFAULT 0 CHECK (converted_spot >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quick_sighting_nokta_rewards_user_idx
  ON quick_sighting_nokta_rewards(user_id, created_at DESC);

ALTER TABLE quick_sighting_nokta_rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own quick sighting nokta rewards" ON quick_sighting_nokta_rewards;
CREATE POLICY "Users can view own quick sighting nokta rewards"
  ON quick_sighting_nokta_rewards FOR SELECT
  USING (auth.uid() = user_id);

-- 3) Reward processor
CREATE OR REPLACE FUNCTION process_quick_sighting_nokta_reward(
  p_quick_sighting_id text,
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_inserted_id text;
  v_nokta_balance integer;
  v_spot_to_award integer;
  v_nokta_to_convert integer;
BEGIN
  IF p_user_id IS NULL OR p_quick_sighting_id IS NULL OR trim(p_quick_sighting_id) = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'skipped', true,
      'reason', 'missing_user_or_sighting_id'
    );
  END IF;

  INSERT INTO quick_sighting_nokta_rewards (quick_sighting_id, user_id, nokta_earned)
  VALUES (p_quick_sighting_id, p_user_id, 1)
  ON CONFLICT (quick_sighting_id) DO NOTHING
  RETURNING quick_sighting_id INTO v_inserted_id;

  IF v_inserted_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'already_processed', true
    );
  END IF;

  PERFORM ensure_spot_wallet(p_user_id);

  UPDATE spot_wallets
  SET
    nokta_balance = nokta_balance + 1,
    lifetime_nokta_earned = lifetime_nokta_earned + 1
  WHERE user_id = p_user_id
  RETURNING nokta_balance INTO v_nokta_balance;

  v_spot_to_award := FLOOR(v_nokta_balance::numeric / 10)::integer;

  IF v_spot_to_award > 0 THEN
    v_nokta_to_convert := v_spot_to_award * 10;

    UPDATE spot_wallets
    SET
      nokta_balance = nokta_balance - v_nokta_to_convert,
      lifetime_nokta_converted = lifetime_nokta_converted + v_nokta_to_convert,
      balance = balance + v_spot_to_award,
      lifetime_earned = lifetime_earned + v_spot_to_award
    WHERE user_id = p_user_id;

    UPDATE quick_sighting_nokta_rewards
    SET converted_spot = v_spot_to_award
    WHERE quick_sighting_id = p_quick_sighting_id;

    INSERT INTO spot_ledger (
      from_user_id,
      to_user_id,
      amount,
      transaction_type,
      reason,
      reference_type,
      reference_id,
      status,
      metadata,
      created_by
    ) VALUES (
      NULL,
      p_user_id,
      v_spot_to_award,
      'earn',
      'nokta_conversion',
      'quick_sighting',
      NULL,
      'completed',
      jsonb_build_object(
        'quick_sighting_id', p_quick_sighting_id,
        'converted_nokta', v_nokta_to_convert,
        'conversion_rule', '10_nokta_to_1_spot'
      ),
      auth.uid()
    );

    RETURN jsonb_build_object(
      'success', true,
      'nokta_earned', 1,
      'spot_awarded', v_spot_to_award,
      'converted_nokta', v_nokta_to_convert
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'nokta_earned', 1,
    'spot_awarded', 0,
    'converted_nokta', 0
  );
END;
$$;

-- 4) Trigger on quick_sightings insert
CREATE OR REPLACE FUNCTION trg_award_nokta_after_quick_sighting_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM process_quick_sighting_nokta_reward(NEW.id::text, NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS award_nokta_after_quick_sighting_insert ON quick_sightings;
CREATE TRIGGER award_nokta_after_quick_sighting_insert
  AFTER INSERT ON quick_sightings
  FOR EACH ROW
  EXECUTE FUNCTION trg_award_nokta_after_quick_sighting_insert();

-- 5) permissions
REVOKE ALL ON FUNCTION process_quick_sighting_nokta_reward(text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION trg_award_nokta_after_quick_sighting_insert() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION process_quick_sighting_nokta_reward(text, uuid) TO service_role;

-- 6) comments
COMMENT ON COLUMN spot_wallets.nokta_balance IS 'Current nokta balance. 10 nokta converts to 1 Spot.';
COMMENT ON COLUMN spot_wallets.lifetime_nokta_earned IS 'Total nokta earned from quick sightings.';
COMMENT ON COLUMN spot_wallets.lifetime_nokta_converted IS 'Total nokta consumed for Spot conversion.';
COMMENT ON TABLE quick_sighting_nokta_rewards IS 'Tracks quick sighting nokta awards to prevent duplicate rewards.';
COMMENT ON FUNCTION process_quick_sighting_nokta_reward(text, uuid) IS 'Awards 1 nokta per quick sighting and converts each 10 nokta into 1 Spot.';
