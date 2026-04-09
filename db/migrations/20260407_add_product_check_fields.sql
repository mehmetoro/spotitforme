-- migration: add product visibility and check status fields to virtual sightings

-- sightings tablosu
ALTER TABLE sightings
  ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS product_check_status TEXT,
  ADD COLUMN IF NOT EXISTS product_checked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS product_check_notes TEXT;

-- quick_sightings tablosu
ALTER TABLE quick_sightings
  ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS product_check_status TEXT,
  ADD COLUMN IF NOT EXISTS product_checked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS product_check_notes TEXT;

-- Geçerli durum değerleri
ALTER TABLE sightings
  DROP CONSTRAINT IF EXISTS sightings_product_check_status_check;
ALTER TABLE sightings
  ADD CONSTRAINT sightings_product_check_status_check
  CHECK (product_check_status IN (
    'pending', 'pending_review', 'active',
    'out_of_stock', 'removed', 'blocked', 'suspicious'
  ));

ALTER TABLE quick_sightings
  DROP CONSTRAINT IF EXISTS quick_sightings_product_check_status_check;
ALTER TABLE quick_sightings
  ADD CONSTRAINT quick_sightings_product_check_status_check
  CHECK (product_check_status IN (
    'pending', 'pending_review', 'active',
    'out_of_stock', 'removed', 'blocked', 'suspicious'
  ));

-- Kontrol geçmişi tablosu
CREATE TABLE IF NOT EXISTS product_check_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name    TEXT NOT NULL,
  record_id     UUID NOT NULL,
  product_url   TEXT NOT NULL,
  http_status   INTEGER,
  check_result  TEXT NOT NULL,
  check_notes   TEXT,
  checked_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_check_logs_record_idx
  ON product_check_logs(table_name, record_id);

CREATE INDEX IF NOT EXISTS product_check_logs_checked_at_idx
  ON product_check_logs(checked_at DESC);

-- is_hidden ve check_status indexleri
CREATE INDEX IF NOT EXISTS sightings_is_hidden_virtual_idx
  ON sightings(is_hidden, source_channel, created_at DESC);

CREATE INDEX IF NOT EXISTS sightings_product_check_status_idx
  ON sightings(product_check_status)
  WHERE product_check_status IS NOT NULL;

CREATE INDEX IF NOT EXISTS quick_sightings_is_hidden_virtual_idx
  ON quick_sightings(is_hidden, source_channel, created_at DESC);

CREATE INDEX IF NOT EXISTS quick_sightings_product_check_status_idx
  ON quick_sightings(product_check_status)
  WHERE product_check_status IS NOT NULL;
