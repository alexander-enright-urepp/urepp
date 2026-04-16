-- Add athlete_id to booked_sessions
ALTER TABLE booked_sessions 
ADD COLUMN IF NOT EXISTS athlete_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Update RLS policy to allow looking up by athlete_id
DROP POLICY IF EXISTS "Athletes can view their sessions" ON booked_sessions;
CREATE POLICY "Athletes can view their sessions" 
  ON booked_sessions FOR SELECT 
  USING (
    athlete_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR 
    athlete_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
