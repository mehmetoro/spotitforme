-- migration: add fields to sightings table for filtering and location
-- created: 2026-03-04

-- Add new columns to sightings table
ALTER TABLE sightings
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS hashtags text,
  ADD COLUMN IF NOT EXISTS latitude numeric,
  ADD COLUMN IF NOT EXISTS longitude numeric;

-- Create indexes for filtering performance
CREATE INDEX IF NOT EXISTS sightings_category_idx ON sightings(category);
CREATE INDEX IF NOT EXISTS sightings_hashtags_idx ON sightings USING gin(to_tsvector('simple', hashtags));
CREATE INDEX IF NOT EXISTS sightings_location_idx ON sightings(latitude, longitude);
