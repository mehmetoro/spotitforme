-- migration: create spots table for spot system
-- run this against your Supabase/Postgres database

-- create spots table
CREATE TABLE IF NOT EXISTS spots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  category text,
  location text,
  image_url text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'found')),
  views integer DEFAULT 0,
  total_helps integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- create indexes for performance
CREATE INDEX IF NOT EXISTS spots_user_id_idx ON spots(user_id);
CREATE INDEX IF NOT EXISTS spots_status_idx ON spots(status);
CREATE INDEX IF NOT EXISTS spots_created_at_idx ON spots(created_at DESC);
CREATE INDEX IF NOT EXISTS spots_category_idx ON spots(category);

-- create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_spots_updated_at 
  BEFORE UPDATE ON spots 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- enable RLS (Row Level Security)
ALTER TABLE spots ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- anyone can view active spots
CREATE POLICY "Anyone can view active spots"
  ON spots FOR SELECT
  USING (status = 'active' OR auth.uid() = user_id);

-- users can create their own spots
CREATE POLICY "Users can create their own spots"
  ON spots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- users can update their own spots
CREATE POLICY "Users can update their own spots"
  ON spots FOR UPDATE
  USING (auth.uid() = user_id);

-- users can delete their own spots
CREATE POLICY "Users can delete their own spots"
  ON spots FOR DELETE
  USING (auth.uid() = user_id);

-- add comments for documentation
COMMENT ON TABLE spots IS 'User-created spots for items they are looking for';
COMMENT ON COLUMN spots.status IS 'Spot status: active (still looking) or found (item found)';
COMMENT ON COLUMN spots.views IS 'Number of times this spot has been viewed';
COMMENT ON COLUMN spots.total_helps IS 'Number of sightings/helps received for this spot';
