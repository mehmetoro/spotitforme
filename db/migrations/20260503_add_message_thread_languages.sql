ALTER TABLE message_threads
ADD COLUMN IF NOT EXISTS participant1_language text CHECK (participant1_language IN ('tr', 'en', 'de', 'fr', 'es', 'ru')),
ADD COLUMN IF NOT EXISTS participant2_language text CHECK (participant2_language IN ('tr', 'en', 'de', 'fr', 'es', 'ru'));

CREATE OR REPLACE VIEW active_conversations AS
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
  END AS other_user_avatar,
  mt.participant1_language,
  mt.participant2_language
FROM message_threads mt
LEFT JOIN user_profiles p1 ON p1.id = mt.participant1_id
LEFT JOIN user_profiles p2 ON p2.id = mt.participant2_id
LEFT JOIN LATERAL (
  SELECT content
  FROM messages m
  WHERE m.thread_id = mt.id
  ORDER BY m.created_at DESC
  LIMIT 1
) lm ON true
WHERE mt.status <> 'deleted';
