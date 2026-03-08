-- =============================================
-- PHASE 4.1: Messaging core infrastructure
-- =============================================
-- Description:
--   Unified conversation infrastructure for:
--   - Buyer/Seller deal completion
--   - Social user chat
--   - Spot seeker/helper chat
--   - Reward agreement coordination (platform is not payment party)
-- Created: 2026-03-08

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE IF NOT EXISTS message_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
  participant2_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
  subject text,
  thread_type varchar(30) NOT NULL DEFAULT 'general' CHECK (thread_type IN ('general', 'social', 'shop', 'spot', 'help', 'reward', 'trade')),
  spot_id uuid REFERENCES spots(id) ON DELETE SET NULL,
  product_id uuid REFERENCES shop_inventory(id) ON DELETE SET NULL,
  shop_id uuid REFERENCES shops(id) ON DELETE SET NULL,
  status varchar(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
  unread_count_p1 integer NOT NULL DEFAULT 0 CHECK (unread_count_p1 >= 0),
  unread_count_p2 integer NOT NULL DEFAULT 0 CHECK (unread_count_p2 >= 0),
  last_message_at timestamptz NOT NULL DEFAULT now(),
  last_message_preview text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT message_threads_participants_different CHECK (participant1_id <> participant2_id)
);

CREATE INDEX IF NOT EXISTS message_threads_participant1_idx ON message_threads(participant1_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS message_threads_participant2_idx ON message_threads(participant2_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS message_threads_status_idx ON message_threads(status, last_message_at DESC);
CREATE INDEX IF NOT EXISTS message_threads_type_idx ON message_threads(thread_type, last_message_at DESC);
CREATE INDEX IF NOT EXISTS message_threads_spot_idx ON message_threads(spot_id);
CREATE INDEX IF NOT EXISTS message_threads_product_idx ON message_threads(product_id);
CREATE INDEX IF NOT EXISTS message_threads_shop_idx ON message_threads(shop_id);

DROP TRIGGER IF EXISTS update_message_threads_updated_at ON message_threads;
CREATE TRIGGER update_message_threads_updated_at
  BEFORE UPDATE ON message_threads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS thread_participants (
  thread_id uuid NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role varchar(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member', 'observer')),
  last_read_at timestamptz,
  is_muted boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (thread_id, user_id)
);

CREATE INDEX IF NOT EXISTS thread_participants_user_idx ON thread_participants(user_id);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
  receiver_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  content text NOT NULL DEFAULT '',
  attachments text[],
  type varchar(20) NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'file', 'agreement', 'system')),
  content_type varchar(30) NOT NULL DEFAULT 'text',
  topic text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_system_message boolean NOT NULL DEFAULT false,
  system_message_type varchar(40),
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_thread_idx ON messages(thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_sender_idx ON messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_receiver_idx ON messages(receiver_id, is_read, created_at DESC);

DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS trade_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
  seller_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
  product_description text NOT NULL,
  agreed_price numeric(12,2) NOT NULL CHECK (agreed_price >= 0),
  price_currency varchar(10) NOT NULL DEFAULT 'TRY',
  delivery_method varchar(30) NOT NULL DEFAULT 'local_pickup',
  delivery_address text,
  meeting_location text,
  meeting_time timestamptz,
  payment_method varchar(30) NOT NULL DEFAULT 'cash',
  payment_details text,
  warranty_days integer NOT NULL DEFAULT 0 CHECK (warranty_days >= 0),
  return_policy text,
  disclaimer_accepted boolean NOT NULL DEFAULT false,
  disclaimer_text text,
  status varchar(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'completed')),
  accepted_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT trade_agreements_buyer_not_seller CHECK (buyer_id <> seller_id)
);

CREATE INDEX IF NOT EXISTS trade_agreements_thread_idx ON trade_agreements(thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS trade_agreements_buyer_idx ON trade_agreements(buyer_id, status);
CREATE INDEX IF NOT EXISTS trade_agreements_seller_idx ON trade_agreements(seller_id, status);

DROP TRIGGER IF EXISTS update_trade_agreements_updated_at ON trade_agreements;
CREATE TRIGGER update_trade_agreements_updated_at
  BEFORE UPDATE ON trade_agreements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION set_message_receiver_from_thread()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  p1 uuid;
  p2 uuid;
BEGIN
  SELECT participant1_id, participant2_id
  INTO p1, p2
  FROM message_threads
  WHERE id = NEW.thread_id;

  IF p1 IS NULL OR p2 IS NULL THEN
    RAISE EXCEPTION 'Thread not found for message insert';
  END IF;

  IF NEW.sender_id <> p1 AND NEW.sender_id <> p2 THEN
    RAISE EXCEPTION 'Sender is not a participant in this thread';
  END IF;

  IF NEW.receiver_id IS NULL THEN
    NEW.receiver_id := CASE WHEN NEW.sender_id = p1 THEN p2 ELSE p1 END;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_message_receiver_before_insert ON messages;
CREATE TRIGGER set_message_receiver_before_insert
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION set_message_receiver_from_thread();

CREATE OR REPLACE FUNCTION update_thread_on_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE message_threads
  SET
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(COALESCE(NULLIF(TRIM(NEW.content), ''), '[Ek mesaj]'), 100),
    unread_count_p1 = CASE
      WHEN NEW.sender_id = participant2_id THEN unread_count_p1 + 1
      ELSE unread_count_p1
    END,
    unread_count_p2 = CASE
      WHEN NEW.sender_id = participant1_id THEN unread_count_p2 + 1
      ELSE unread_count_p2
    END,
    updated_at = now()
  WHERE id = NEW.thread_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_thread_after_message_insert ON messages;
CREATE TRIGGER update_thread_after_message_insert
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_on_new_message();

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

ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_agreements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "message_threads_select_participants" ON message_threads;
CREATE POLICY "message_threads_select_participants"
  ON message_threads FOR SELECT
  USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

DROP POLICY IF EXISTS "message_threads_insert_participants" ON message_threads;
CREATE POLICY "message_threads_insert_participants"
  ON message_threads FOR INSERT
  WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

DROP POLICY IF EXISTS "message_threads_update_participants" ON message_threads;
CREATE POLICY "message_threads_update_participants"
  ON message_threads FOR UPDATE
  USING (auth.uid() = participant1_id OR auth.uid() = participant2_id)
  WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

DROP POLICY IF EXISTS "thread_participants_select_allowed" ON thread_participants;
CREATE POLICY "thread_participants_select_allowed"
  ON thread_participants FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM message_threads mt
      WHERE mt.id = thread_participants.thread_id
      AND (mt.participant1_id = auth.uid() OR mt.participant2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "thread_participants_insert_allowed" ON thread_participants;
CREATE POLICY "thread_participants_insert_allowed"
  ON thread_participants FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM message_threads mt
      WHERE mt.id = thread_participants.thread_id
      AND (mt.participant1_id = auth.uid() OR mt.participant2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "thread_participants_update_allowed" ON thread_participants;
CREATE POLICY "thread_participants_update_allowed"
  ON thread_participants FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM message_threads mt
      WHERE mt.id = thread_participants.thread_id
      AND (mt.participant1_id = auth.uid() OR mt.participant2_id = auth.uid())
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM message_threads mt
      WHERE mt.id = thread_participants.thread_id
      AND (mt.participant1_id = auth.uid() OR mt.participant2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "messages_select_participants" ON messages;
CREATE POLICY "messages_select_participants"
  ON messages FOR SELECT
  USING (
    auth.uid() = sender_id
    OR auth.uid() = receiver_id
    OR EXISTS (
      SELECT 1 FROM message_threads mt
      WHERE mt.id = messages.thread_id
      AND (mt.participant1_id = auth.uid() OR mt.participant2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "messages_insert_sender" ON messages;
CREATE POLICY "messages_insert_sender"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM message_threads mt
      WHERE mt.id = messages.thread_id
      AND (mt.participant1_id = auth.uid() OR mt.participant2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "messages_update_participants" ON messages;
CREATE POLICY "messages_update_participants"
  ON messages FOR UPDATE
  USING (
    auth.uid() = sender_id
    OR auth.uid() = receiver_id
    OR EXISTS (
      SELECT 1 FROM message_threads mt
      WHERE mt.id = messages.thread_id
      AND (mt.participant1_id = auth.uid() OR mt.participant2_id = auth.uid())
    )
  )
  WITH CHECK (
    auth.uid() = sender_id
    OR auth.uid() = receiver_id
    OR EXISTS (
      SELECT 1 FROM message_threads mt
      WHERE mt.id = messages.thread_id
      AND (mt.participant1_id = auth.uid() OR mt.participant2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "trade_agreements_select_participants" ON trade_agreements;
CREATE POLICY "trade_agreements_select_participants"
  ON trade_agreements FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "trade_agreements_insert_participants" ON trade_agreements;
CREATE POLICY "trade_agreements_insert_participants"
  ON trade_agreements FOR INSERT
  WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "trade_agreements_update_participants" ON trade_agreements;
CREATE POLICY "trade_agreements_update_participants"
  ON trade_agreements FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id)
  WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-attachments',
  'message-attachments',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "message_attachments_select_authenticated" ON storage.objects;
CREATE POLICY "message_attachments_select_authenticated"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'message-attachments' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "message_attachments_insert_own_folder" ON storage.objects;
CREATE POLICY "message_attachments_insert_own_folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'message-attachments'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "message_attachments_update_own_folder" ON storage.objects;
CREATE POLICY "message_attachments_update_own_folder"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'message-attachments'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'message-attachments'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "message_attachments_delete_own_folder" ON storage.objects;
CREATE POLICY "message_attachments_delete_own_folder"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'message-attachments'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

COMMENT ON TABLE message_threads IS 'Unified conversation threads for social/shop/spot/reward communication';
COMMENT ON TABLE messages IS 'Thread messages with optional system payloads and attachments';
COMMENT ON TABLE trade_agreements IS 'Optional non-binding agreement records between users';
COMMENT ON VIEW active_conversations IS 'Active conversation list with latest message and participant labels';
