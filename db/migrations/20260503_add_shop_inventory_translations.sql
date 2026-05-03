-- Multi-language translation storage for shop inventory products

CREATE TABLE IF NOT EXISTS public.shop_inventory_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_inventory_id uuid NOT NULL REFERENCES public.shop_inventory(id) ON DELETE CASCADE,
  language text NOT NULL,
  title text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (shop_inventory_id, language)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'shop_inventory_translations_language_check'
  ) THEN
    ALTER TABLE public.shop_inventory_translations
      ADD CONSTRAINT shop_inventory_translations_language_check
      CHECK (language IN ('tr', 'en', 'de', 'fr', 'es', 'ru'));
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.set_shop_inventory_translation_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_shop_inventory_translations_updated_at ON public.shop_inventory_translations;
CREATE TRIGGER trg_shop_inventory_translations_updated_at
BEFORE UPDATE ON public.shop_inventory_translations
FOR EACH ROW EXECUTE FUNCTION public.set_shop_inventory_translation_updated_at();

ALTER TABLE public.shop_inventory_translations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS shop_inventory_translations_public_read ON public.shop_inventory_translations;
CREATE POLICY shop_inventory_translations_public_read
  ON public.shop_inventory_translations FOR SELECT USING (true);

DROP POLICY IF EXISTS shop_inventory_translations_service_role_write ON public.shop_inventory_translations;
CREATE POLICY shop_inventory_translations_service_role_write
  ON public.shop_inventory_translations FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_shop_inventory_translations_product_id ON public.shop_inventory_translations(shop_inventory_id);
CREATE INDEX IF NOT EXISTS idx_shop_inventory_translations_language ON public.shop_inventory_translations(language);
