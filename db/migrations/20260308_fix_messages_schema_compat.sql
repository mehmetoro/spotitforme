-- =============================================
-- HOTFIX: Messaging messages schema compatibility
-- =============================================
-- Description:
--   Fixes environments where `messages` table existed in older shape
--   and lacks newer columns (notably `receiver_id`).
-- Created: 2026-03-08

DO $$
BEGIN
  IF to_regclass('public.messages') IS NULL THEN
    RAISE NOTICE 'messages table does not exist yet, skipping compatibility patch.';
    RETURN;
  END IF;

  ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS receiver_id uuid;
  ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS content text;
  ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachments text[];
  ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS type varchar(20) DEFAULT 'text';
  ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS content_type varchar(30) DEFAULT 'text';
  ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS topic text;
  ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
  ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_system_message boolean DEFAULT false;
  ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS system_message_type varchar(40);
  ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false;
  ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

  UPDATE public.messages
  SET content = ''
  WHERE content IS NULL;

  ALTER TABLE public.messages ALTER COLUMN content SET DEFAULT '';
  ALTER TABLE public.messages ALTER COLUMN content SET NOT NULL;
  ALTER TABLE public.messages ALTER COLUMN metadata SET DEFAULT '{}'::jsonb;
  ALTER TABLE public.messages ALTER COLUMN metadata SET NOT NULL;
  ALTER TABLE public.messages ALTER COLUMN is_system_message SET DEFAULT false;
  ALTER TABLE public.messages ALTER COLUMN is_system_message SET NOT NULL;
  ALTER TABLE public.messages ALTER COLUMN is_read SET DEFAULT false;
  ALTER TABLE public.messages ALTER COLUMN is_read SET NOT NULL;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'messages_type_valid'
      AND conrelid = 'public.messages'::regclass
  ) THEN
    ALTER TABLE public.messages
      ADD CONSTRAINT messages_type_valid
      CHECK (type IN ('text', 'image', 'file', 'agreement', 'system'));
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS messages_receiver_idx ON public.messages(receiver_id, is_read, created_at DESC);
