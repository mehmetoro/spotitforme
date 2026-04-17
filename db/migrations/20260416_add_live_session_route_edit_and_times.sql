-- migration: allow manual route edits and per-post timeline hours in live sessions

ALTER TABLE live_travel_sessions
  ADD COLUMN IF NOT EXISTS manual_route_post_ids text[] DEFAULT '{}';

ALTER TABLE live_travel_sessions
  ADD COLUMN IF NOT EXISTS route_overridden boolean NOT NULL DEFAULT false;

ALTER TABLE live_travel_sessions
  ADD COLUMN IF NOT EXISTS post_time_map jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE live_travel_sessions
SET visibility = 'followers'
WHERE visibility = 'friends';

ALTER TABLE live_travel_sessions DROP CONSTRAINT IF EXISTS live_travel_sessions_visibility_check;
ALTER TABLE live_travel_sessions
  ADD CONSTRAINT live_travel_sessions_visibility_check
  CHECK (visibility IN ('private', 'followers', 'public'));

-- Live session icindeki paylasimlar ayridir; discovery/social_posts feed'inden bagimsiz saklanir.
CREATE TABLE IF NOT EXISTS live_trip_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES live_travel_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_social_post_id uuid REFERENCES social_posts(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  image_url text,
  category text,
  location_name text,
  city text,
  latitude double precision,
  longitude double precision,
  visit_time text,
  visibility text NOT NULL DEFAULT 'followers' CHECK (visibility IN ('private', 'followers', 'public')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS live_trip_posts_session_sort_idx
  ON live_trip_posts (session_id, sort_order, created_at);

CREATE INDEX IF NOT EXISTS live_trip_posts_user_idx
  ON live_trip_posts (user_id, created_at DESC);

ALTER TABLE live_trip_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS live_trip_posts_select_own ON live_trip_posts;
CREATE POLICY live_trip_posts_select_own
  ON live_trip_posts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS live_trip_posts_insert_own ON live_trip_posts;
CREATE POLICY live_trip_posts_insert_own
  ON live_trip_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS live_trip_posts_update_own ON live_trip_posts;
CREATE POLICY live_trip_posts_update_own
  ON live_trip_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS live_trip_posts_delete_own ON live_trip_posts;
CREATE POLICY live_trip_posts_delete_own
  ON live_trip_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS travel_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid UNIQUE REFERENCES live_travel_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  from_location text NOT NULL,
  to_location text NOT NULL,
  category text,
  visibility text NOT NULL DEFAULT 'followers' CHECK (visibility IN ('private', 'followers', 'public')),
  cover_collage_url text,
  likes_count integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  shares_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS travel_routes_visibility_popular_idx
  ON travel_routes (visibility, likes_count DESC, comments_count DESC, shares_count DESC, created_at DESC);

ALTER TABLE travel_routes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS travel_routes_select_visible ON travel_routes;
CREATE POLICY travel_routes_select_visible
  ON travel_routes
  FOR SELECT
  TO authenticated
  USING (visibility IN ('followers', 'public') OR auth.uid() = user_id);

DROP POLICY IF EXISTS travel_routes_insert_own ON travel_routes;
CREATE POLICY travel_routes_insert_own
  ON travel_routes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS travel_routes_update_own ON travel_routes;
CREATE POLICY travel_routes_update_own
  ON travel_routes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS travel_route_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL REFERENCES travel_routes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(route_id, user_id)
);

CREATE TABLE IF NOT EXISTS travel_route_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL REFERENCES travel_routes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS travel_route_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL REFERENCES travel_routes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(route_id, user_id)
);

ALTER TABLE travel_route_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_route_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_route_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS travel_route_likes_select_all ON travel_route_likes;
CREATE POLICY travel_route_likes_select_all
  ON travel_route_likes
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS travel_route_likes_insert_own ON travel_route_likes;
CREATE POLICY travel_route_likes_insert_own
  ON travel_route_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS travel_route_comments_select_all ON travel_route_comments;
CREATE POLICY travel_route_comments_select_all
  ON travel_route_comments
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS travel_route_comments_insert_own ON travel_route_comments;
CREATE POLICY travel_route_comments_insert_own
  ON travel_route_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS travel_route_shares_select_all ON travel_route_shares;
CREATE POLICY travel_route_shares_select_all
  ON travel_route_shares
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS travel_route_shares_insert_own ON travel_route_shares;
CREATE POLICY travel_route_shares_insert_own
  ON travel_route_shares
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
