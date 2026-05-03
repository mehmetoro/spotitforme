-- Admin helpers: safely delete a user and related records
-- Supports legacy profile rows where user_profiles.id != auth.users.id.

CREATE OR REPLACE FUNCTION public.admin_delete_user_by_id(p_auth_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_profile_ids uuid[];
  has_buyer_id boolean := false;
  has_seller_id boolean := false;
  has_user_id boolean := false;
  q text;
BEGIN
  IF p_auth_id IS NULL THEN
    RAISE EXCEPTION 'auth user id is required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_auth_id) THEN
    RAISE EXCEPTION 'auth user not found: %', p_auth_id;
  END IF;

  IF to_regclass('public.user_profiles') IS NOT NULL THEN
    SELECT COALESCE(array_agg(id), ARRAY[]::uuid[])
    INTO v_profile_ids
    FROM public.user_profiles
    WHERE id = p_auth_id OR user_id = p_auth_id;
  ELSE
    v_profile_ids := ARRAY[]::uuid[];
  END IF;

  IF to_regclass('public.message_threads') IS NOT NULL THEN
    IF to_regclass('public.messages') IS NOT NULL THEN
      DELETE FROM public.messages
      WHERE thread_id IN (
        SELECT id
        FROM public.message_threads
        WHERE participant1_id = ANY(v_profile_ids)
           OR participant2_id = ANY(v_profile_ids)
      );
    END IF;

    IF to_regclass('public.thread_participants') IS NOT NULL THEN
      DELETE FROM public.thread_participants
      WHERE thread_id IN (
        SELECT id
        FROM public.message_threads
        WHERE participant1_id = ANY(v_profile_ids)
           OR participant2_id = ANY(v_profile_ids)
      );
    END IF;

    DELETE FROM public.message_threads
    WHERE participant1_id = ANY(v_profile_ids)
       OR participant2_id = ANY(v_profile_ids);
  END IF;

  IF to_regclass('public.trade_agreements') IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'trade_agreements' AND column_name = 'buyer_id'
    ) INTO has_buyer_id;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'trade_agreements' AND column_name = 'seller_id'
    ) INTO has_seller_id;

    IF has_buyer_id OR has_seller_id THEN
      q := 'DELETE FROM public.trade_agreements WHERE 1=0';
      IF has_buyer_id THEN
        q := q || ' OR buyer_id = ANY($1)';
      END IF;
      IF has_seller_id THEN
        q := q || ' OR seller_id = ANY($1)';
      END IF;
      EXECUTE q USING v_profile_ids;
    END IF;
  END IF;

  IF to_regclass('public.spots') IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'spots' AND column_name = 'user_id'
    ) INTO has_user_id;

    IF has_user_id THEN
      DELETE FROM public.spots WHERE user_id = p_auth_id;
    END IF;
  END IF;

  IF to_regclass('public.sightings') IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'sightings' AND column_name = 'user_id'
    ) INTO has_user_id;

    IF has_user_id THEN
      DELETE FROM public.sightings WHERE user_id = p_auth_id;
    END IF;
  END IF;

  IF to_regclass('public.quick_sightings') IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'quick_sightings' AND column_name = 'user_id'
    ) INTO has_user_id;

    IF has_user_id THEN
      DELETE FROM public.quick_sightings WHERE user_id = p_auth_id;
    END IF;
  END IF;

  IF to_regclass('public.shop_product_discount_requests') IS NOT NULL THEN
    DELETE FROM public.shop_product_discount_requests
    WHERE buyer_id = p_auth_id
       OR seller_id = p_auth_id;
  END IF;

  IF to_regclass('public.shop_product_purchases') IS NOT NULL THEN
    DELETE FROM public.shop_product_purchases
    WHERE buyer_id = p_auth_id
       OR seller_id = p_auth_id;
  END IF;

  IF to_regclass('public.user_profiles') IS NOT NULL THEN
    DELETE FROM public.user_profiles
    WHERE id = ANY(v_profile_ids) OR user_id = p_auth_id;
  END IF;

  DELETE FROM auth.users WHERE id = p_auth_id;

  RETURN format('deleted auth user: %s', p_auth_id::text);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_user_by_email(p_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_auth_id uuid;
BEGIN
  IF p_email IS NULL OR btrim(p_email) = '' THEN
    RAISE EXCEPTION 'email is required';
  END IF;

  SELECT id
  INTO v_auth_id
  FROM auth.users
  WHERE lower(email) = lower(btrim(p_email))
  LIMIT 1;

  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'user not found for email: %', p_email;
  END IF;

  RETURN public.admin_delete_user_by_id(v_auth_id);
END;
$$;

COMMENT ON FUNCTION public.admin_delete_user_by_id(uuid)
IS 'Safely deletes auth user and related rows (profiles, threads, messages, agreements, sightings/spots, shop requests/purchases).';

COMMENT ON FUNCTION public.admin_delete_user_by_email(text)
IS 'Resolves auth user by email, then calls admin_delete_user_by_id(uuid).';
