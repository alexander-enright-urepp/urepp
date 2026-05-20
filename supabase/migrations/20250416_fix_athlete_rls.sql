-- Fix athlete RLS policy to check both athlete_id AND athlete_email
DROP POLICY IF EXISTS "Athletes can view their sessions" ON booked_sessions;

CREATE POLICY "Athletes can view their sessions" 
  ON booked_sessions FOR SELECT 
  USING (
    athlete_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR 
    athlete_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
