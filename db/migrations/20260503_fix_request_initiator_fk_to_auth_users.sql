-- Align request_initiator_id with application logic (auth user id)
-- Previous FK targeted user_profiles(id), which can differ across environments.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'message_threads_request_initiator_id_fkey'
  ) THEN
    ALTER TABLE message_threads
      DROP CONSTRAINT message_threads_request_initiator_id_fkey;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'message_thereads_request_initiator_id_fkey'
  ) THEN
    ALTER TABLE message_threads
      DROP CONSTRAINT message_thereads_request_initiator_id_fkey;
  END IF;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_profiles'
      AND column_name = 'user_id'
  ) THEN
    UPDATE message_threads mt
    SET request_initiator_id = up.user_id
    FROM user_profiles up
    WHERE mt.request_initiator_id = up.id
      AND mt.request_initiator_id IS NOT NULL
      AND up.user_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM auth.users au
        WHERE au.id = mt.request_initiator_id
      );
  END IF;
END;
$$;

UPDATE message_threads mt
SET request_initiator_id = NULL
WHERE mt.request_initiator_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM auth.users au
    WHERE au.id = mt.request_initiator_id
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'message_threads_request_initiator_id_fkey'
  ) THEN
    ALTER TABLE message_threads
      ADD CONSTRAINT message_threads_request_initiator_id_fkey
      FOREIGN KEY (request_initiator_id)
      REFERENCES auth.users(id)
      ON DELETE SET NULL;
  END IF;
END;
$$;
