-- migration: create table for saving user rare travel plans

CREATE TABLE IF NOT EXISTS rare_travel_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  from_location text NOT NULL,
  to_location text NOT NULL,
  query_params text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rare_travel_plans_user_created_idx
  ON rare_travel_plans (user_id, created_at DESC);

ALTER TABLE rare_travel_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rare_travel_plans_select_own ON rare_travel_plans;
CREATE POLICY rare_travel_plans_select_own
  ON rare_travel_plans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS rare_travel_plans_insert_own ON rare_travel_plans;
CREATE POLICY rare_travel_plans_insert_own
  ON rare_travel_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS rare_travel_plans_delete_own ON rare_travel_plans;
CREATE POLICY rare_travel_plans_delete_own
  ON rare_travel_plans
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
