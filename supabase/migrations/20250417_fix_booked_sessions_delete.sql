-- Fix DELETE policy for booked_sessions table
-- Allows coaches/athletes to delete their own sessions

-- First drop the existing delete policy if it exists
DROP POLICY IF EXISTS "Coaches can delete their sessions" ON booked_sessions;
DROP POLICY IF EXISTS "Athletes can delete their sessions" ON booked_sessions;
DROP POLICY IF EXISTS "Users can delete their booked_sessions" ON booked_sessions;

-- Create a single policy that allows coaches OR athletes to delete sessions
CREATE POLICY "Users can delete their booked_sessions" 
  ON booked_sessions FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = booked_sessions.coach_id 
      AND profiles.user_id = auth.uid()
    )
    OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = booked_sessions.athlete_id 
      AND profiles.user_id = auth.uid()
    )
  );

-- Also allow UPDATE for editing sessions
DROP POLICY IF EXISTS "Users can update their booked_sessions" ON booked_sessions;

CREATE POLICY "Users can update their booked_sessions" 
  ON booked_sessions FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = booked_sessions.coach_id 
      AND profiles.user_id = auth.uid()
    )
    OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = booked_sessions.athlete_id 
      AND profiles.user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Users can delete their booked_sessions" ON booked_sessions IS 'Allows coaches or athletes to delete sessions they are part of';
COMMENT ON POLICY "Users can update their booked_sessions" ON booked_sessions IS 'Allows coaches or athletes to edit/update sessions they are part of';
