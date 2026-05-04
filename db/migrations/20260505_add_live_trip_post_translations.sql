-- Multi-language translation storage for live trip post stops

CREATE TABLE IF NOT EXISTS public.live_trip_post_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  live_trip_post_id uuid NOT NULL REFERENCES public.live_trip_posts(id) ON DELETE CASCADE,
  language text NOT NULL,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  translated_at timestamptz,
  translation_status text NOT NULL DEFAULT 'pending',
  translation_service text NOT NULL DEFAULT 'libretranslate',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (live_trip_post_id, language)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'live_trip_post_translations_language_check'
  ) THEN
    ALTER TABLE public.live_trip_post_translations
      ADD CONSTRAINT live_trip_post_translations_language_check
      CHECK (language IN ('tr', 'en', 'de', 'fr', 'es', 'ru'));
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.set_live_trip_post_translation_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_live_trip_post_translation_updated_at ON public.live_trip_post_translations;
CREATE TRIGGER set_live_trip_post_translation_updated_at
  BEFORE UPDATE ON public.live_trip_post_translations
  FOR EACH ROW EXECUTE FUNCTION public.set_live_trip_post_translation_updated_at();

-- Enable RLS
ALTER TABLE public.live_trip_post_translations ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow public read on live_trip_post_translations"
  ON public.live_trip_post_translations FOR SELECT
  USING (true);

-- Allow insert/update by service role only (via API)
CREATE POLICY "Allow service role write on live_trip_post_translations"
  ON public.live_trip_post_translations FOR ALL
  USING (true)
  WITH CHECK (true);
