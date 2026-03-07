-- =============================================
-- SPOT ECONOMY: admin test script
-- =============================================
-- Description:
--   Manual verification for Phase 1 wallet/ledger flow.
--   Run in Supabase SQL Editor after 20260307_create_spot_wallet_and_ledger.sql.
-- IMPORTANT:
--   Replace the sample UUID values below with real user IDs from auth.users.

-- 1) Replace these UUIDs before running:
--    sender user (helping user)
--    receiver user (store owner)
-- Example placeholders:
-- SELECT '11111111-1111-1111-1111-111111111111'::uuid AS sender_user_id,
--        '22222222-2222-2222-2222-222222222222'::uuid AS receiver_user_id;

-- 2) Ensure both wallets exist
SELECT ensure_spot_wallet('11111111-1111-1111-1111-111111111111'::uuid);
SELECT ensure_spot_wallet('22222222-2222-2222-2222-222222222222'::uuid);

-- 3) Award 10 Spot to sender (service_role required)
SELECT award_spot(
  '11111111-1111-1111-1111-111111111111'::uuid,
  10,
  'admin_test_award',
  'manual_test',
  NULL,
  '{"note":"phase1 test award"}'::jsonb
) AS award_ledger_id;

-- 4) Transfer 3 Spot sender -> receiver
SELECT transfer_spot(
  '11111111-1111-1111-1111-111111111111'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  3,
  'admin_test_transfer',
  'manual_test',
  NULL,
  '{"note":"phase1 test transfer"}'::jsonb
) AS transfer_ledger_id;

-- 5) Spend 2 Spot from sender wallet (simulate upgrade/fee)
SELECT spend_spot(
  '11111111-1111-1111-1111-111111111111'::uuid,
  2,
  'admin_test_spend',
  'manual_test',
  NULL,
  '{"note":"phase1 test spend"}'::jsonb
) AS spend_ledger_id;

-- 6) Check final balances
SELECT
  user_id,
  balance,
  lifetime_earned,
  lifetime_spent,
  updated_at
FROM spot_wallets
WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid
)
ORDER BY user_id;

-- 7) Check ledger rows
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
ORDER BY created_at DESC;

-- 8) Optional cleanup (uncomment if needed)
-- DELETE FROM spot_ledger WHERE reason IN ('admin_test_award', 'admin_test_transfer', 'admin_test_spend');
-- UPDATE spot_wallets
-- SET balance = 0, lifetime_earned = 0, lifetime_spent = 0
-- WHERE user_id IN (
--   '11111111-1111-1111-1111-111111111111'::uuid,
--   '22222222-2222-2222-2222-222222222222'::uuid
-- );
