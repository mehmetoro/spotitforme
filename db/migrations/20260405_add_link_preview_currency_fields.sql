-- migration: persist link preview currency for virtual help and rare product shares

ALTER TABLE sightings
  ADD COLUMN IF NOT EXISTS link_preview_currency TEXT;

ALTER TABLE quick_sightings
  ADD COLUMN IF NOT EXISTS link_preview_currency TEXT;
