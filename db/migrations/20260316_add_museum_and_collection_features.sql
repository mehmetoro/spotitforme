-- =============================================
-- MUSEUM + COLLECTION FEATURES
-- =============================================
-- Adds museum fields to quick_sightings and creates collection_posts table.

-- 1) quick_sightings: museum and commission fields
ALTER TABLE quick_sightings
  ADD COLUMN IF NOT EXISTS is_in_museum boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS helper_commission_rate numeric(5,2) NOT NULL DEFAULT 15
    CHECK (helper_commission_rate >= 0 AND helper_commission_rate <= 100);

CREATE INDEX IF NOT EXISTS quick_sightings_museum_idx
  ON quick_sightings(is_in_museum, created_at DESC);

COMMENT ON COLUMN quick_sightings.is_in_museum IS 'Whether this rare sighting is published in museum feed.';
COMMENT ON COLUMN quick_sightings.helper_commission_rate IS 'Default helper commission rate (%) for contact requests.';

-- 2) collection posts (user-owned physical collection showcase)
CREATE TABLE IF NOT EXISTS collection_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text,
  photo_url text,
  estimated_price numeric,
  city text,
  district text,
  is_public boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS collection_posts_user_idx
  ON collection_posts(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS collection_posts_public_idx
  ON collection_posts(is_public, status, created_at DESC);

ALTER TABLE collection_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active public collections" ON collection_posts;
CREATE POLICY "Public can view active public collections"
  ON collection_posts FOR SELECT
  USING ((is_public = true AND status = 'active') OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own collections" ON collection_posts;
CREATE POLICY "Users can create own collections"
  ON collection_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own collections" ON collection_posts;
CREATE POLICY "Users can update own collections"
  ON collection_posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own collections" ON collection_posts;
CREATE POLICY "Users can delete own collections"
  ON collection_posts FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE collection_posts IS 'Public/owned showcase posts for user physical collections.';
