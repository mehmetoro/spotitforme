-- migration: add necessary columns and tables for social posts
-- run this against your Supabase/Postgres database

-- ensure post_type column exists with values for our new post categories
ALTER TABLE social_posts
  ADD COLUMN IF NOT EXISTS post_type text;

-- optional reward amount for spots
ALTER TABLE social_posts
  ADD COLUMN IF NOT EXISTS reward numeric;

-- privacy flag for "found" posts
ALTER TABLE social_posts
  ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true;

-- link back to spot when a 'found' post is created
ALTER TABLE social_posts
  ADD COLUMN IF NOT EXISTS parent_spot_id uuid REFERENCES social_posts(id);

-- allow legacy compatibility: some records may have "type" column
-- we keep it for existing data, though we now use post_type
-- so no modification is strictly required here

-- create social_saves table to support bookmarking
CREATE TABLE IF NOT EXISTS social_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- create indexes to speed up common queries
CREATE INDEX IF NOT EXISTS social_posts_post_type_idx ON social_posts(post_type);
CREATE INDEX IF NOT EXISTS social_posts_is_public_idx ON social_posts(is_public);
CREATE INDEX IF NOT EXISTS social_saves_post_user_idx ON social_saves(post_id, user_id);
