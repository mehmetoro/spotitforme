-- =============================================
-- RPC FUNCTION: increment_spot_helps
-- =============================================
-- Description: Increment the helps counter for a spot safely
-- This function is called when someone reports a sighting
-- Created: 2026-03-04

CREATE OR REPLACE FUNCTION increment_spot_helps(spot_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE spots
  SET total_helps = COALESCE(total_helps, 0) + 1
  WHERE id = spot_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_spot_helps(uuid) TO authenticated;

-- Add comment
COMMENT ON FUNCTION increment_spot_helps IS 'Safely increment the helps counter for a spot when a sighting is reported';
