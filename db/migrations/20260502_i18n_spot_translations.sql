-- 1) spots tablosuna orijinal dil alanini ekle
ALTER TABLE public.spots
ADD COLUMN IF NOT EXISTS original_language text NOT NULL DEFAULT 'tr';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'spots_original_language_check'
  ) THEN
    ALTER TABLE public.spots
    ADD CONSTRAINT spots_original_language_check
    CHECK (original_language IN ('tr', 'en', 'de', 'fr', 'es', 'ru'));
  END IF;
END
$$;

-- 2) spot_translations tablosu
CREATE TABLE IF NOT EXISTS public.spot_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id uuid NOT NULL REFERENCES public.spots(id) ON DELETE CASCADE,
  language text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  translated_at timestamptz,
  translation_status text NOT NULL DEFAULT 'pending',
  translation_service text NOT NULL DEFAULT 'libretranslate',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (spot_id, language)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'spot_translations_language_check'
  ) THEN
    ALTER TABLE public.spot_translations
    ADD CONSTRAINT spot_translations_language_check
    CHECK (language IN ('tr', 'en', 'de', 'fr', 'es', 'ru'));
  END IF;
END
$$;

-- 3) Trigger fonksiyonu
CREATE OR REPLACE FUNCTION public.auto_translate_spot()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Kaynak dili her zaman kaydet
  INSERT INTO public.spot_translations (
    spot_id,
    language,
    title,
    description,
    translation_status,
    translation_service,
    translated_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.original_language, 'tr'),
    NEW.title,
    NEW.description,
    'completed',
    'original',
    now(),
    now()
  )
  ON CONFLICT (spot_id, language)
  DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    translation_status = EXCLUDED.translation_status,
    translation_service = EXCLUDED.translation_service,
    translated_at = EXCLUDED.translated_at,
    updated_at = now();

  -- Diger dilleri pending olarak ac
  INSERT INTO public.spot_translations (
    spot_id,
    language,
    title,
    description,
    translation_status,
    translation_service,
    updated_at
  )
  SELECT
    NEW.id,
    lang,
    NEW.title,
    NEW.description,
    'pending',
    'libretranslate',
    now()
  FROM unnest(ARRAY['tr', 'en', 'de', 'fr', 'es', 'ru']) AS lang
  WHERE lang <> COALESCE(NEW.original_language, 'tr')
  ON CONFLICT (spot_id, language) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_translate_spot ON public.spots;
CREATE TRIGGER trg_auto_translate_spot
AFTER INSERT OR UPDATE OF title, description, original_language ON public.spots
FOR EACH ROW
EXECUTE FUNCTION public.auto_translate_spot();

-- 4) Updated_at otomasyonu
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_spot_translations_updated_at ON public.spot_translations;
CREATE TRIGGER trg_spot_translations_updated_at
BEFORE UPDATE ON public.spot_translations
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 5) RLS
ALTER TABLE public.spot_translations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "spot_translations_public_read" ON public.spot_translations;
CREATE POLICY "spot_translations_public_read"
ON public.spot_translations
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "spot_translations_service_role_write" ON public.spot_translations;
CREATE POLICY "spot_translations_service_role_write"
ON public.spot_translations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Spot sahibi kendi spotunun cevirisini guncelleyebilir
DROP POLICY IF EXISTS "spot_owner_can_update_own_translations" ON public.spot_translations;
CREATE POLICY "spot_owner_can_update_own_translations"
ON public.spot_translations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.spots s
    WHERE s.id = spot_translations.spot_id
      AND s.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.spots s
    WHERE s.id = spot_translations.spot_id
      AND s.user_id = auth.uid()
  )
);

CREATE INDEX IF NOT EXISTS idx_spot_translations_spot_id ON public.spot_translations(spot_id);
CREATE INDEX IF NOT EXISTS idx_spot_translations_language ON public.spot_translations(language);
CREATE INDEX IF NOT EXISTS idx_spot_translations_status ON public.spot_translations(translation_status);
