-- Multi-language translation storage for social posts

CREATE TABLE IF NOT EXISTS public.social_post_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  social_post_id uuid NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  language text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  translated_at timestamptz,
  translation_status text NOT NULL DEFAULT 'pending',
  translation_service text NOT NULL DEFAULT 'libretranslate',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (social_post_id, language)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'social_post_translations_language_check'
  ) THEN
    ALTER TABLE public.social_post_translations
      ADD CONSTRAINT social_post_translations_language_check
      CHECK (language IN ('tr', 'en', 'de', 'fr', 'es', 'ru'));
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.set_social_post_translation_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_social_post_translations_updated_at ON public.social_post_translations;
CREATE TRIGGER trg_social_post_translations_updated_at
BEFORE UPDATE ON public.social_post_translations
FOR EACH ROW
EXECUTE FUNCTION public.set_social_post_translation_updated_at();

ALTER TABLE public.social_post_translations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS social_post_translations_public_read ON public.social_post_translations;
CREATE POLICY social_post_translations_public_read
ON public.social_post_translations
FOR SELECT
USING (true);

DROP POLICY IF EXISTS social_post_translations_service_role_write ON public.social_post_translations;
CREATE POLICY social_post_translations_service_role_write
ON public.social_post_translations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_social_post_translations_post_id
  ON public.social_post_translations(social_post_id);

CREATE INDEX IF NOT EXISTS idx_social_post_translations_language
  ON public.social_post_translations(language);
