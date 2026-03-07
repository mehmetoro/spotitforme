-- =============================================
-- PHASE 2: sighting verification + spot reward
-- =============================================
-- Description:
--   Adds a state machine to sightings and awards Spot only when a sighting is approved.
--   Includes anti-double-reward protections.
-- Created: 2026-03-08

-- 1) Add verification columns
ALTER TABLE sightings
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'approved', 'rejected', 'cancelled')),
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS spot_reward_granted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS spot_reward_ledger_id uuid REFERENCES spot_ledger(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS sightings_verification_status_idx
  ON sightings(verification_status, created_at DESC);

CREATE INDEX IF NOT EXISTS sightings_spot_owner_review_idx
  ON sightings(spot_id, verification_status, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS sightings_spot_reward_ledger_unique
  ON sightings(spot_reward_ledger_id)
  WHERE spot_reward_ledger_id IS NOT NULL;

-- 2) Approve/reject function (spot owner decision)
CREATE OR REPLACE FUNCTION verify_sighting_and_process_reward(
  p_sighting_id uuid,
  p_decision text,
  p_rejection_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_actor_id uuid;
  v_actor_role text;
  v_sighting sightings%ROWTYPE;
  v_spot_owner_id uuid;
  v_ledger_id uuid;
BEGIN
  v_actor_id := auth.uid();
  v_actor_role := current_setting('request.jwt.claim.role', true);

  IF p_decision NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Decision must be approved or rejected';
  END IF;

  SELECT s.*
    INTO v_sighting
  FROM sightings s
  WHERE s.id = p_sighting_id
  FOR UPDATE;

  IF v_sighting.id IS NULL THEN
    RAISE EXCEPTION 'Sighting not found';
  END IF;

  SELECT sp.user_id
    INTO v_spot_owner_id
  FROM spots sp
  WHERE sp.id = v_sighting.spot_id;

  IF v_spot_owner_id IS NULL THEN
    RAISE EXCEPTION 'Spot owner not found for this sighting';
  END IF;

  -- Only spot owner or service_role can verify
  IF v_actor_role <> 'service_role' AND v_actor_id IS DISTINCT FROM v_spot_owner_id THEN
    RAISE EXCEPTION 'Only spot owner can verify this sighting';
  END IF;

  -- Idempotent protection: pending only
  IF v_sighting.verification_status <> 'pending' THEN
    RETURN jsonb_build_object(
      'success', true,
      'already_processed', true,
      'status', v_sighting.verification_status,
      'reward_granted', v_sighting.spot_reward_granted,
      'spot_reward_ledger_id', v_sighting.spot_reward_ledger_id
    );
  END IF;

  IF p_decision = 'rejected' THEN
    UPDATE sightings
    SET
      verification_status = 'rejected',
      approved_by = v_actor_id,
      approved_at = now(),
      rejection_reason = COALESCE(NULLIF(trim(p_rejection_reason), ''), 'Rejected by spot owner')
    WHERE id = p_sighting_id;

    RETURN jsonb_build_object(
      'success', true,
      'status', 'rejected',
      'reward_granted', false
    );
  END IF;

  -- approved flow
  UPDATE sightings
  SET
    verification_status = 'approved',
    approved_by = v_actor_id,
    approved_at = now(),
    rejection_reason = NULL
  WHERE id = p_sighting_id;

  -- reward only once
  IF NOT v_sighting.spot_reward_granted THEN
    PERFORM ensure_spot_wallet(v_sighting.spotter_id);

    UPDATE spot_wallets
    SET
      balance = balance + 1,
      lifetime_earned = lifetime_earned + 1
    WHERE user_id = v_sighting.spotter_id;

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
      v_sighting.spotter_id,
      1,
      'earn',
      'sighting_approved',
      'sighting',
      v_sighting.id,
      'completed',
      jsonb_build_object('spot_id', v_sighting.spot_id, 'approval_source', 'spot_owner_verification'),
      v_actor_id
    )
    RETURNING id INTO v_ledger_id;

    UPDATE sightings
    SET
      spot_reward_granted = true,
      spot_reward_ledger_id = v_ledger_id
    WHERE id = p_sighting_id;
  END IF;

  -- increase spot help counter only on approval
  PERFORM increment_spot_helps(v_sighting.spot_id);

  RETURN jsonb_build_object(
    'success', true,
    'status', 'approved',
    'reward_granted', true,
    'spot_reward_ledger_id', v_ledger_id
  );
END;
$$;

-- 3) Spotter can cancel own pending sighting
CREATE OR REPLACE FUNCTION cancel_own_pending_sighting(p_sighting_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_actor_id uuid;
  v_sighting sightings%ROWTYPE;
BEGIN
  v_actor_id := auth.uid();

  SELECT * INTO v_sighting
  FROM sightings
  WHERE id = p_sighting_id
  FOR UPDATE;

  IF v_sighting.id IS NULL THEN
    RAISE EXCEPTION 'Sighting not found';
  END IF;

  IF v_actor_id IS DISTINCT FROM v_sighting.spotter_id THEN
    RAISE EXCEPTION 'Only spotter can cancel this sighting';
  END IF;

  IF v_sighting.verification_status <> 'pending' THEN
    RAISE EXCEPTION 'Only pending sightings can be cancelled';
  END IF;

  UPDATE sightings
  SET
    verification_status = 'cancelled',
    rejection_reason = 'Cancelled by spotter',
    approved_by = v_actor_id,
    approved_at = now()
  WHERE id = p_sighting_id;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'cancelled'
  );
END;
$$;

-- 4) grants
REVOKE ALL ON FUNCTION verify_sighting_and_process_reward(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION cancel_own_pending_sighting(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION verify_sighting_and_process_reward(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_sighting_and_process_reward(uuid, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION cancel_own_pending_sighting(uuid) TO authenticated;

-- 5) comments
COMMENT ON COLUMN sightings.verification_status IS 'pending/approved/rejected/cancelled state machine for sighting verification';
COMMENT ON COLUMN sightings.spot_reward_granted IS 'True when +1 Spot reward has been granted to spotter after approval';
COMMENT ON FUNCTION verify_sighting_and_process_reward(uuid, text, text) IS 'Spot owner approval flow: state transition + anti-double-reward + ledger write.';
COMMENT ON FUNCTION cancel_own_pending_sighting(uuid) IS 'Spotter can cancel only own pending sighting before review.';
