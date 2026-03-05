-- migration: create sightings table for spot sightings system
-- run this against your Supabase/Postgres database

-- create sightings table
CREATE TABLE IF NOT EXISTS sightings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id uuid REFERENCES spots(id) ON DELETE CASCADE NOT NULL,
  spotter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url text,
  location_description text NOT NULL,
  price numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- create indexes for performance
CREATE INDEX IF NOT EXISTS sightings_spot_id_idx ON sightings(spot_id);
CREATE INDEX IF NOT EXISTS sightings_spotter_id_idx ON sightings(spotter_id);
CREATE INDEX IF NOT EXISTS sightings_created_at_idx ON sightings(created_at DESC);

-- enable RLS (Row Level Security)
ALTER TABLE sightings ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- spot owner can view all sightings for their spots
CREATE POLICY "Spot owners can view sightings" 
  ON sightings FOR SELECT
  USING (
    spot_id IN (
      SELECT id FROM spots WHERE user_id = auth.uid()
    )
  );

-- spotters can view their own sightings
CREATE POLICY "Spotters can view their own sightings"
  ON sightings FOR SELECT
  USING (auth.uid() = spotter_id);

-- authenticated users can create sightings
CREATE POLICY "Authenticated users can create sightings"
  ON sightings FOR INSERT
  WITH CHECK (auth.uid() = spotter_id);

-- spotters can update their own sightings
CREATE POLICY "Spotters can update their own sightings"
  ON sightings FOR UPDATE
  USING (auth.uid() = spotter_id);

-- spotters can delete their own sightings
CREATE POLICY "Spotters can delete their own sightings"
  ON sightings FOR DELETE
  USING (auth.uid() = spotter_id);

-- add comments for documentation
COMMENT ON TABLE sightings IS 'User-reported sightings of spots (I saw this item)';
COMMENT ON COLUMN sightings.price IS 'Price of the item if spotted (optional)';
COMMENT ON COLUMN sightings.notes IS 'Additional notes from the spotter';
