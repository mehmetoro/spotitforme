-- Multi-language translation storage for travel routes

CREATE TABLE IF NOT EXISTS public.travel_route_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_route_id uuid NOT NULL REFERENCES public.travel_routes(id) ON DELETE CASCADE,
  language text NOT NULL,
  title text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (travel_route_id, language)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'travel_route_translations_language_check'
  ) THEN
    ALTER TABLE public.travel_route_translations
      ADD CONSTRAINT travel_route_translations_language_check
      CHECK (language IN ('tr', 'en', 'de', 'fr', 'es', 'ru'));
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.set_travel_route_translation_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_travel_route_translations_updated_at ON public.travel_route_translations;
CREATE TRIGGER trg_travel_route_translations_updated_at
BEFORE UPDATE ON public.travel_route_translations
FOR EACH ROW EXECUTE FUNCTION public.set_travel_route_translation_updated_at();

ALTER TABLE public.travel_route_translations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS travel_route_translations_public_read ON public.travel_route_translations;
CREATE POLICY travel_route_translations_public_read
  ON public.travel_route_translations FOR SELECT USING (true);

DROP POLICY IF EXISTS travel_route_translations_service_role_write ON public.travel_route_translations;
CREATE POLICY travel_route_translations_service_role_write
  ON public.travel_route_translations FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_travel_route_translations_route_id ON public.travel_route_translations(travel_route_id);
CREATE INDEX IF NOT EXISTS idx_travel_route_translations_language ON public.travel_route_translations(language);
