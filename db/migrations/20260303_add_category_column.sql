-- migration: add category column to social_posts table
-- run this against your Supabase/Postgres database

-- add category column to store product/content categories
ALTER TABLE social_posts
  ADD COLUMN IF NOT EXISTS category text;

-- create index for category filtering
CREATE INDEX IF NOT EXISTS social_posts_category_idx ON social_posts(category);

-- add comment for documentation
COMMENT ON COLUMN social_posts.category IS 'Content category: elektronik, giyim, ev, koleksiyon, kitap, oyuncak, spor, arac, saat, mutfak, bahce, diger';
