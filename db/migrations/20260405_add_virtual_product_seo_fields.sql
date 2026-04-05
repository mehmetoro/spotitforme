-- migration: add seo/product metadata fields for virtual product pages

ALTER TABLE sightings
  ADD COLUMN IF NOT EXISTS link_preview_description TEXT,
  ADD COLUMN IF NOT EXISTS link_preview_brand TEXT,
  ADD COLUMN IF NOT EXISTS link_preview_availability TEXT;

ALTER TABLE quick_sightings
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS link_preview_description TEXT,
  ADD COLUMN IF NOT EXISTS link_preview_brand TEXT,
  ADD COLUMN IF NOT EXISTS link_preview_availability TEXT;

CREATE INDEX IF NOT EXISTS quick_sightings_title_idx
  ON quick_sightings(title);
