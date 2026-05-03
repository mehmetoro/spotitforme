-- Multi-language translation storage for sightings

CREATE TABLE IF NOT EXISTS public.sighting_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sighting_id uuid NOT NULL REFERENCES public.sightings(id) ON DELETE CASCADE,
  language text NOT NULL,
  title text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sighting_id, language)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'sighting_translations_language_check'
  ) THEN
    ALTER TABLE public.sighting_translations
      ADD CONSTRAINT sighting_translations_language_check
      CHECK (language IN ('tr', 'en', 'de', 'fr', 'es', 'ru'));
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.set_sighting_translation_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sighting_translations_updated_at ON public.sighting_translations;
CREATE TRIGGER trg_sighting_translations_updated_at
BEFORE UPDATE ON public.sighting_translations
FOR EACH ROW EXECUTE FUNCTION public.set_sighting_translation_updated_at();

ALTER TABLE public.sighting_translations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sighting_translations_public_read ON public.sighting_translations;
CREATE POLICY sighting_translations_public_read
  ON public.sighting_translations FOR SELECT USING (true);

DROP POLICY IF EXISTS sighting_translations_service_role_write ON public.sighting_translations;
CREATE POLICY sighting_translations_service_role_write
  ON public.sighting_translations FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_sighting_translations_sighting_id ON public.sighting_translations(sighting_id);
CREATE INDEX IF NOT EXISTS idx_sighting_translations_language ON public.sighting_translations(language);
