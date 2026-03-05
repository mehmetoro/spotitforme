-- =============================================
-- RECREATE SPOTS TABLE - DÜZELTME
-- =============================================
-- Önceki migration'da helps yerine total_helps kullanmalıydık
-- Bu dosya tabloyu siler ve doğru şemayla yeniden oluşturur
-- UYARI: Mevcut spot verileri silinecek!

-- 1. Sightings tablosunu sil (foreign key yüzünden önce bunu silmeliyiz)
DROP TABLE IF EXISTS sightings CASCADE;

-- 2. Spots tablosunu sil
DROP TABLE IF EXISTS spots CASCADE;

-- 3. Spots tablosunu DOĞRU şemayla yeniden oluştur
CREATE TABLE spots (
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

-- 4. Indexler oluştur
CREATE INDEX spots_user_id_idx ON spots(user_id);
CREATE INDEX spots_status_idx ON spots(status);
CREATE INDEX spots_created_at_idx ON spots(created_at DESC);
CREATE INDEX spots_category_idx ON spots(category);

-- 5. RLS aktif et
ALTER TABLE spots ENABLE ROW LEVEL SECURITY;

-- 6. RLS policies
-- Anyone can view active spots
CREATE POLICY "Anyone can view active spots"
  ON spots FOR SELECT
  USING (status = 'active');

-- Authenticated users can create spots
CREATE POLICY "Authenticated users can create spots"
  ON spots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own spots
CREATE POLICY "Users can update their own spots"
  ON spots FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own spots
CREATE POLICY "Users can delete their own spots"
  ON spots FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_spots_updated_at
  BEFORE UPDATE ON spots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Comments
COMMENT ON TABLE spots IS 'User-created spots for items they are looking for';
COMMENT ON COLUMN spots.status IS 'active: still looking, found: item has been found';
COMMENT ON COLUMN spots.views IS 'Number of times this spot has been viewed';
COMMENT ON COLUMN spots.total_helps IS 'Number of sightings/helps received for this spot';

-- 9. Sightings tablosunu yeniden oluştur
CREATE TABLE sightings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id uuid REFERENCES spots(id) ON DELETE CASCADE NOT NULL,
  spotter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url text,
  location_description text NOT NULL,
  price numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 10. Sightings indexleri
CREATE INDEX sightings_spot_id_idx ON sightings(spot_id);
CREATE INDEX sightings_spotter_id_idx ON sightings(spotter_id);
CREATE INDEX sightings_created_at_idx ON sightings(created_at DESC);

-- 11. Sightings RLS
ALTER TABLE sightings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Spot owners can view sightings" 
  ON sightings FOR SELECT
  USING (
    spot_id IN (
      SELECT id FROM spots WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Spotters can view their own sightings"
  ON sightings FOR SELECT
  USING (auth.uid() = spotter_id);

CREATE POLICY "Authenticated users can create sightings"
  ON sightings FOR INSERT
  WITH CHECK (auth.uid() = spotter_id);

CREATE POLICY "Spotters can update their own sightings"
  ON sightings FOR UPDATE
  USING (auth.uid() = spotter_id);

CREATE POLICY "Spotters can delete their own sightings"
  ON sightings FOR DELETE
  USING (auth.uid() = spotter_id);

COMMENT ON TABLE sightings IS 'User-reported sightings of spots (I saw this item)';

-- 12. RPC function
CREATE OR REPLACE FUNCTION increment_spot_helps(spot_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE spots
  SET total_helps = COALESCE(total_helps, 0) + 1
  WHERE id = spot_id;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_spot_helps(uuid) TO authenticated;
COMMENT ON FUNCTION increment_spot_helps IS 'Safely increment the total_helps counter for a spot';

-- BAŞARILI!
SELECT 'Spots ve Sightings tabloları başarıyla yeniden oluşturuldu! total_helps kolonu hazır.' as message;
