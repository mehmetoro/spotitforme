-- migration: add virtual help channel fields for sightings and quick_sightings

ALTER TABLE sightings
  ADD COLUMN IF NOT EXISTS source_channel TEXT NOT NULL DEFAULT 'physical',
  ADD COLUMN IF NOT EXISTS product_url TEXT,
  ADD COLUMN IF NOT EXISTS marketplace TEXT,
  ADD COLUMN IF NOT EXISTS seller_name TEXT,
  ADD COLUMN IF NOT EXISTS link_preview_title TEXT,
  ADD COLUMN IF NOT EXISTS link_preview_image TEXT,
  ADD COLUMN IF NOT EXISTS source_domain TEXT;

ALTER TABLE quick_sightings
  ADD COLUMN IF NOT EXISTS source_channel TEXT NOT NULL DEFAULT 'physical',
  ADD COLUMN IF NOT EXISTS product_url TEXT,
  ADD COLUMN IF NOT EXISTS marketplace TEXT,
  ADD COLUMN IF NOT EXISTS seller_name TEXT,
  ADD COLUMN IF NOT EXISTS link_preview_title TEXT,
  ADD COLUMN IF NOT EXISTS link_preview_image TEXT,
  ADD COLUMN IF NOT EXISTS source_domain TEXT;

ALTER TABLE sightings
  DROP CONSTRAINT IF EXISTS sightings_source_channel_check;
ALTER TABLE sightings
  ADD CONSTRAINT sightings_source_channel_check
  CHECK (source_channel IN ('physical', 'virtual'));

ALTER TABLE quick_sightings
  DROP CONSTRAINT IF EXISTS quick_sightings_source_channel_check;
ALTER TABLE quick_sightings
  ADD CONSTRAINT quick_sightings_source_channel_check
  CHECK (source_channel IN ('physical', 'virtual'));

CREATE INDEX IF NOT EXISTS sightings_source_channel_idx
  ON sightings(source_channel, created_at DESC);

CREATE INDEX IF NOT EXISTS quick_sightings_source_channel_idx
  ON quick_sightings(source_channel, created_at DESC);

CREATE INDEX IF NOT EXISTS sightings_product_url_idx
  ON sightings(product_url);

CREATE INDEX IF NOT EXISTS quick_sightings_product_url_idx
  ON quick_sightings(product_url);
