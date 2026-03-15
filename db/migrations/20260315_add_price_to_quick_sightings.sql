-- migration: add price column to quick_sightings for rare item sighting feature
-- created: 2026-03-15
-- run this in Supabase SQL Editor

-- Add price column to quick_sightings
ALTER TABLE quick_sightings
  ADD COLUMN IF NOT EXISTS price numeric,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'TRY';

-- Add index for price filtering
CREATE INDEX IF NOT EXISTS quick_sightings_price_idx ON quick_sightings(price);
CREATE INDEX IF NOT EXISTS quick_sightings_status_idx ON quick_sightings(status);
CREATE INDEX IF NOT EXISTS quick_sightings_user_id_idx ON quick_sightings(user_id);

COMMENT ON COLUMN quick_sightings.price IS 'Observed price of the rare item (optional)';
COMMENT ON COLUMN quick_sightings.currency IS 'Currency code, default TRY';
