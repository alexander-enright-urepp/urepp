-- Fix video_sessions table to reference booked_sessions instead of appointments
-- This aligns with the new native booking system

-- First, drop the existing foreign key constraint
ALTER TABLE video_sessions 
  DROP CONSTRAINT IF EXISTS video_sessions_appointment_id_fkey;

-- Add new foreign key constraint to booked_sessions
ALTER TABLE video_sessions 
  ADD CONSTRAINT video_sessions_booked_session_id_fkey 
  FOREIGN KEY (appointment_id) REFERENCES booked_sessions(id) ON DELETE CASCADE;

-- Update the unique constraint name to be more accurate
ALTER TABLE video_sessions 
  DROP CONSTRAINT IF EXISTS video_sessions_appointment_id_key;

ALTER TABLE video_sessions 
  ADD CONSTRAINT video_sessions_booked_session_id_key 
  UNIQUE(appointment_id);

-- Update RLS policies to use booked_sessions
DROP POLICY IF EXISTS "Coaches can view their video sessions" ON video_sessions;
DROP POLICY IF EXISTS "Athletes can view their video sessions" ON video_sessions;
DROP POLICY IF EXISTS "Coaches can create video sessions" ON video_sessions;
DROP POLICY IF EXISTS "Coaches can update their video sessions" ON video_sessions;

-- Coaches can view sessions for their booked sessions
CREATE POLICY "Coaches can view their video sessions" 
  ON video_sessions FOR SELECT 
  USING (
    appointment_id IN (
      SELECT id FROM booked_sessions 
      WHERE coach_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

-- Athletes can view sessions for their booked sessions
CREATE POLICY "Athletes can view their video sessions" 
  ON video_sessions FOR SELECT 
  USING (
    appointment_id IN (
      SELECT id FROM booked_sessions 
      WHERE athlete_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

-- Coaches can create sessions for their booked sessions
CREATE POLICY "Coaches can create video sessions" 
  ON video_sessions FOR INSERT 
  WITH CHECK (
    appointment_id IN (
      SELECT id FROM booked_sessions 
      WHERE coach_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

-- Coaches can update sessions for their booked sessions
CREATE POLICY "Coaches can update their video sessions" 
  ON video_sessions FOR UPDATE 
  USING (
    appointment_id IN (
      SELECT id FROM booked_sessions 
      WHERE coach_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

-- Add policy for deletion
CREATE POLICY "Coaches can delete their video sessions"
  ON video_sessions FOR DELETE
  USING (
    appointment_id IN (
      SELECT id FROM booked_sessions 
      WHERE coach_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

COMMENT ON TABLE video_sessions IS 'Daily.co video call sessions linked to booked_sessions (native booking system)';