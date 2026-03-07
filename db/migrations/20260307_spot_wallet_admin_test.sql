-- =============================================
-- SPOT ECONOMY: admin test script
-- =============================================
-- Description:
--   Manual verification for Phase 1 wallet/ledger flow.
--   Run in Supabase SQL Editor after 20260307_create_spot_wallet_and_ledger.sql.
-- IMPORTANT:
--   This script auto-picks 2 real users from auth.users.
--   If you have fewer than 2 users, it will stop with an error.

DROP TABLE IF EXISTS temp_spot_test_users;
CREATE TEMP TABLE temp_spot_test_users (
  sender_user_id uuid NOT NULL,
  receiver_user_id uuid NOT NULL
);

DO $$
DECLARE
  v_sender uuid;
  v_receiver uuid;
  v_award_id uuid;
  v_transfer_id uuid;
  v_spend_id uuid;
BEGIN
  SELECT id INTO v_sender
  FROM auth.users
  ORDER BY created_at
  LIMIT 1;

  SELECT id INTO v_receiver
  FROM auth.users
  WHERE id <> v_sender
  ORDER BY created_at
  LIMIT 1;

  IF v_sender IS NULL OR v_receiver IS NULL THEN
    RAISE EXCEPTION 'En az 2 kullanıcı gerekli. Önce auth.users tablosunda en az iki hesap oluşturun.';
  END IF;

  TRUNCATE temp_spot_test_users;
  INSERT INTO temp_spot_test_users (sender_user_id, receiver_user_id)
  VALUES (v_sender, v_receiver);

  PERFORM ensure_spot_wallet(v_sender);
  PERFORM ensure_spot_wallet(v_receiver);

  SELECT award_spot(
    v_sender,
    10,
    'admin_test_award',
    'manual_test',
    NULL,
    '{"note":"phase1 test award"}'::jsonb
  ) INTO v_award_id;

  SELECT transfer_spot(
    v_sender,
    v_receiver,
    3,
    'admin_test_transfer',
    'manual_test',
    NULL,
    '{"note":"phase1 test transfer"}'::jsonb
  ) INTO v_transfer_id;

  SELECT spend_spot(
    v_sender,
    2,
    'admin_test_spend',
    'manual_test',
    NULL,
    '{"note":"phase1 test spend"}'::jsonb
  ) INTO v_spend_id;

  RAISE NOTICE 'Sender: %, Receiver: %', v_sender, v_receiver;
  RAISE NOTICE 'Ledger IDs -> award: %, transfer: %, spend: %', v_award_id, v_transfer_id, v_spend_id;
END $$;

-- 1) Check selected users
SELECT * FROM temp_spot_test_users;

-- 2) Check final balances
SELECT
  user_id,
  balance,
  lifetime_earned,
  lifetime_spent,
  updated_at
FROM spot_wallets
WHERE user_id IN (
  SELECT sender_user_id FROM temp_spot_test_users
  UNION
  SELECT receiver_user_id FROM temp_spot_test_users
)
ORDER BY user_id;

-- 3) Check ledger rows
SELECT
  id,
  from_user_id,
  to_user_id,
  amount,
  transaction_type,
  reason,
  status,
  metadata,
  created_at
FROM spot_ledger
WHERE reason IN ('admin_test_award', 'admin_test_transfer', 'admin_test_spend')
  AND (
    from_user_id IN (
      SELECT sender_user_id FROM temp_spot_test_users
      UNION
      SELECT receiver_user_id FROM temp_spot_test_users
    )
    OR
    to_user_id IN (
      SELECT sender_user_id FROM temp_spot_test_users
      UNION
      SELECT receiver_user_id FROM temp_spot_test_users
    )
  )
ORDER BY created_at DESC;

-- 4) Optional cleanup (uncomment if needed)
-- DELETE FROM spot_ledger WHERE reason IN ('admin_test_award', 'admin_test_transfer', 'admin_test_spend');
-- UPDATE spot_wallets
-- SET balance = 0, lifetime_earned = 0, lifetime_spent = 0
-- WHERE user_id IN (
--   SELECT sender_user_id FROM temp_spot_test_users
--   UNION
--   SELECT receiver_user_id FROM temp_spot_test_users
-- );
