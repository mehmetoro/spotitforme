-- migration: create table for live travel tracking during active trips

CREATE TABLE IF NOT EXISTS live_travel_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES rare_travel_plans(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  posts_collected text[] DEFAULT '{}',
  total_km numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS live_travel_sessions_user_active_idx
  ON live_travel_sessions (user_id, status) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS live_travel_sessions_plan_idx
  ON live_travel_sessions (plan_id);

ALTER TABLE live_travel_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS live_travel_sessions_select_own ON live_travel_sessions;
CREATE POLICY live_travel_sessions_select_own
  ON live_travel_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS live_travel_sessions_insert_own ON live_travel_sessions;
CREATE POLICY live_travel_sessions_insert_own
  ON live_travel_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS live_travel_sessions_update_own ON live_travel_sessions;
CREATE POLICY live_travel_sessions_update_own
  ON live_travel_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add is_archived column to rare_travel_plans
ALTER TABLE rare_travel_plans ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false;

-- Add visibility setting to live_travel_sessions
ALTER TABLE live_travel_sessions ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'private' CHECK (visibility IN ('private', 'friends', 'public'));
