-- migration: add title column to social_posts table
-- run this against your Supabase/Postgres database

ALTER TABLE social_posts
  ADD COLUMN IF NOT EXISTS title text;

-- create index for title search (optional, for performance)
CREATE INDEX IF NOT EXISTS social_posts_title_idx ON social_posts(title);

-- comment for documentation
COMMENT ON COLUMN social_posts.title IS 'Başlık: sosyal postun öne çıkan başlığı, SEO ve kart görünümü için.';
