-- migration: add likes and comments support for shop social posts
-- run this after 20260301_add_social_columns.sql

-- create shop_social_likes table
CREATE TABLE IF NOT EXISTS shop_social_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES shop_social_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- create shop_social_comments table
CREATE TABLE IF NOT EXISTS shop_social_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES shop_social_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- create indexes for performance
CREATE INDEX IF NOT EXISTS shop_social_likes_post_user_idx ON shop_social_likes(post_id, user_id);
CREATE INDEX IF NOT EXISTS shop_social_likes_post_idx ON shop_social_likes(post_id);
CREATE INDEX IF NOT EXISTS shop_social_comments_post_idx ON shop_social_comments(post_id);
CREATE INDEX IF NOT EXISTS shop_social_comments_user_idx ON shop_social_comments(user_id);

-- update shop_social_posts to track like/comment counts if not exist
ALTER TABLE shop_social_posts
  ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0;

ALTER TABLE shop_social_posts
  ADD COLUMN IF NOT EXISTS comment_count integer DEFAULT 0;
