-- migration: create social_notifications table
-- created: 2026-03-04

-- Drop existing table if exists
DROP TABLE IF EXISTS social_notifications CASCADE;
DROP TABLE IF EXISTS shop_social_notifications CASCADE;

-- Create social_notifications table
CREATE TABLE social_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('spot_sighting', 'spot_found', 'post_liked', 'post_commented', 'post_shared')),
  actor_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  post_id text,
  message text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create shop_social_notifications table (for shop posts notifications)
CREATE TABLE shop_social_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('spot_sighting', 'spot_found', 'post_liked', 'post_commented', 'post_shared')),
  actor_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  post_id text,
  message text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX social_notifications_user_id_idx ON social_notifications(user_id);
CREATE INDEX social_notifications_created_at_idx ON social_notifications(created_at DESC);
CREATE INDEX social_notifications_user_created_idx ON social_notifications(user_id, created_at DESC);
CREATE INDEX social_notifications_read_idx ON social_notifications(user_id, read);

CREATE INDEX shop_social_notifications_user_id_idx ON shop_social_notifications(user_id);
CREATE INDEX shop_social_notifications_created_at_idx ON shop_social_notifications(created_at DESC);
CREATE INDEX shop_social_notifications_user_created_idx ON shop_social_notifications(user_id, created_at DESC);
CREATE INDEX shop_social_notifications_read_idx ON shop_social_notifications(user_id, read);

-- Enable RLS
ALTER TABLE social_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_social_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see their own notifications
CREATE POLICY social_notifications_select_own ON social_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY social_notifications_insert_service ON social_notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY social_notifications_update_own ON social_notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Same RLS policies for shop_social_notifications
CREATE POLICY shop_social_notifications_select_own ON shop_social_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY shop_social_notifications_insert_service ON shop_social_notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY shop_social_notifications_update_own ON shop_social_notifications
  FOR UPDATE
  USING (auth.uid() = user_id);
