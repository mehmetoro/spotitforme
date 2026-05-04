-- Migration: create social_post_translations table if not exists
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS social_post_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  social_post_id uuid NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  language text NOT NULL CHECK (language IN ('tr', 'en', 'de', 'fr', 'es', 'ru')),
  title text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (social_post_id, language)
);

CREATE INDEX IF NOT EXISTS spt_post_lang_idx ON social_post_translations (social_post_id, language);

ALTER TABLE social_post_translations ENABLE ROW LEVEL SECURITY;

-- Anyone can read translations (public posts)
DROP POLICY IF EXISTS spt_select_all ON social_post_translations;
CREATE POLICY spt_select_all ON social_post_translations FOR SELECT USING (true);

-- Only service role / admin inserts (done via seed API with service key)
DROP POLICY IF EXISTS spt_insert_service ON social_post_translations;
CREATE POLICY spt_insert_service ON social_post_translations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS spt_update_service ON social_post_translations;
CREATE POLICY spt_update_service ON social_post_translations FOR UPDATE USING (true);

DROP POLICY IF EXISTS spt_delete_service ON social_post_translations;
CREATE POLICY spt_delete_service ON social_post_translations FOR DELETE USING (true);
