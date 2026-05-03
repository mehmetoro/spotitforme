-- Multi-language translation storage for share flows

CREATE TABLE IF NOT EXISTS public.quick_sighting_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quick_sighting_id uuid NOT NULL REFERENCES public.quick_sightings(id) ON DELETE CASCADE,
  language text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  translated_at timestamptz,
  translation_status text NOT NULL DEFAULT 'pending',
  translation_service text NOT NULL DEFAULT 'libretranslate',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (quick_sighting_id, language)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'quick_sighting_translations_language_check'
  ) THEN
    ALTER TABLE public.quick_sighting_translations
      ADD CONSTRAINT quick_sighting_translations_language_check
      CHECK (language IN ('tr', 'en', 'de', 'fr', 'es', 'ru'));
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.collection_post_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_post_id uuid NOT NULL REFERENCES public.collection_posts(id) ON DELETE CASCADE,
  language text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  translated_at timestamptz,
  translation_status text NOT NULL DEFAULT 'pending',
  translation_service text NOT NULL DEFAULT 'libretranslate',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (collection_post_id, language)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'collection_post_translations_language_check'
  ) THEN
    ALTER TABLE public.collection_post_translations
      ADD CONSTRAINT collection_post_translations_language_check
      CHECK (language IN ('tr', 'en', 'de', 'fr', 'es', 'ru'));
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.set_translation_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_quick_sighting_translations_updated_at ON public.quick_sighting_translations;
CREATE TRIGGER trg_quick_sighting_translations_updated_at
BEFORE UPDATE ON public.quick_sighting_translations
FOR EACH ROW
EXECUTE FUNCTION public.set_translation_updated_at();

DROP TRIGGER IF EXISTS trg_collection_post_translations_updated_at ON public.collection_post_translations;
CREATE TRIGGER trg_collection_post_translations_updated_at
BEFORE UPDATE ON public.collection_post_translations
FOR EACH ROW
EXECUTE FUNCTION public.set_translation_updated_at();

ALTER TABLE public.quick_sighting_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_post_translations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS quick_sighting_translations_public_read ON public.quick_sighting_translations;
CREATE POLICY quick_sighting_translations_public_read
ON public.quick_sighting_translations
FOR SELECT
USING (true);

DROP POLICY IF EXISTS quick_sighting_translations_service_role_write ON public.quick_sighting_translations;
CREATE POLICY quick_sighting_translations_service_role_write
ON public.quick_sighting_translations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS collection_post_translations_public_read ON public.collection_post_translations;
CREATE POLICY collection_post_translations_public_read
ON public.collection_post_translations
FOR SELECT
USING (true);

DROP POLICY IF EXISTS collection_post_translations_service_role_write ON public.collection_post_translations;
CREATE POLICY collection_post_translations_service_role_write
ON public.collection_post_translations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_quick_sighting_translations_sighting_id
  ON public.quick_sighting_translations(quick_sighting_id);

CREATE INDEX IF NOT EXISTS idx_quick_sighting_translations_language
  ON public.quick_sighting_translations(language);

CREATE INDEX IF NOT EXISTS idx_collection_post_translations_post_id
  ON public.collection_post_translations(collection_post_id);

CREATE INDEX IF NOT EXISTS idx_collection_post_translations_language
  ON public.collection_post_translations(language);
