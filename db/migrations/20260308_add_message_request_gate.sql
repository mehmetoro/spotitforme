-- =============================================
-- PHASE 4.2: Message request gate (first contact approval)
-- =============================================
-- Description:
--   First interaction between users starts as a message request.
--   Chat opens only after receiver accepts request.
-- Created: 2026-03-08

ALTER TABLE message_threads
  ADD COLUMN IF NOT EXISTS request_status varchar(20) DEFAULT 'accepted';

ALTER TABLE message_threads
  ADD COLUMN IF NOT EXISTS request_initiator_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL;

ALTER TABLE message_threads
  ADD COLUMN IF NOT EXISTS request_message text;

ALTER TABLE message_threads
  ADD COLUMN IF NOT EXISTS request_responded_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'message_threads_request_status_valid'
  ) THEN
    ALTER TABLE message_threads
      ADD CONSTRAINT message_threads_request_status_valid
      CHECK (request_status IN ('pending', 'accepted', 'rejected'));
  END IF;
END;
$$;

UPDATE message_threads
SET request_status = 'accepted'
WHERE request_status IS NULL;

CREATE INDEX IF NOT EXISTS message_threads_request_status_idx
  ON message_threads(request_status, last_message_at DESC);

DROP VIEW IF EXISTS active_conversations;
CREATE VIEW active_conversations AS
SELECT
  mt.id,
  mt.participant1_id,
  mt.participant2_id,
  mt.subject,
  mt.thread_type,
  mt.spot_id,
  mt.product_id,
  mt.shop_id,
  mt.status,
  mt.request_status,
  mt.request_initiator_id,
  mt.request_message,
  mt.request_responded_at,
  mt.unread_count_p1,
  mt.unread_count_p2,
  mt.last_message_at,
  mt.last_message_preview,
  mt.created_at,
  mt.updated_at,
  lm.content AS last_message_content,
  COALESCE(to_jsonb(p1) ->> 'full_name', to_jsonb(p1) ->> 'name', 'Kullanıcı') AS participant1_name,
  COALESCE(to_jsonb(p2) ->> 'full_name', to_jsonb(p2) ->> 'name', 'Kullanıcı') AS participant2_name,
  CASE
    WHEN auth.uid() = mt.participant1_id THEN COALESCE(to_jsonb(p2) ->> 'full_name', to_jsonb(p2) ->> 'name', 'Kullanıcı')
    ELSE COALESCE(to_jsonb(p1) ->> 'full_name', to_jsonb(p1) ->> 'name', 'Kullanıcı')
  END AS other_user_name,
  CASE
    WHEN auth.uid() = mt.participant1_id THEN COALESCE(to_jsonb(p2) ->> 'avatar_url', to_jsonb(p2) ->> 'avatar', '')
    ELSE COALESCE(to_jsonb(p1) ->> 'avatar_url', to_jsonb(p1) ->> 'avatar', '')
  END AS other_user_avatar
FROM message_threads mt
LEFT JOIN user_profiles p1 ON p1.id = mt.participant1_id
LEFT JOIN user_profiles p2 ON p2.id = mt.participant2_id
LEFT JOIN LATERAL (
  SELECT m.content
  FROM messages m
  WHERE m.thread_id = mt.id
  ORDER BY m.created_at DESC
  LIMIT 1
) lm ON true
WHERE mt.status = 'active';

COMMENT ON COLUMN message_threads.request_status IS 'Message request gate status: pending/accepted/rejected';
COMMENT ON COLUMN message_threads.request_initiator_id IS 'User who initiated contact request';
COMMENT ON COLUMN message_threads.request_message IS 'Optional initial request note shown before acceptance';
