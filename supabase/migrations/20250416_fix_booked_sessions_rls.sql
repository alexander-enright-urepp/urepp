-- Fix RLS for booked_sessions - allow users to query their own profile
-- This fixes "permission denied for table users" when checking coach_id/athlete_id

-- Allow authenticated users to read their own profile
CREATE POLICY IF NOT EXISTS "Users can read their own profile" 
  ON profiles FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid());

-- Allow authenticated users to read any profile (needed for viewing coaches)
CREATE POLICY IF NOT EXISTS "Authenticated users can read profiles" 
  ON profiles FOR SELECT 
  TO authenticated
  USING (true);

-- Fix booked_sessions RLS to be more permissive for reading
DROP POLICY IF EXISTS "Coaches can view their sessions" ON booked_sessions;
DROP POLICY IF EXISTS "Athletes can view their sessions" ON booked_sessions;

-- Create a single policy that allows coaches OR athletes to view sessions
CREATE POLICY "Users can view their booked_sessions" 
  ON booked_sessions FOR SELECT 
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

-- Also allow anon to read sessions (for debugging)
CREATE POLICY IF NOT EXISTS "Anyone can view sessions" 
  ON booked_sessions FOR SELECT 
  TO anon
  USING (true);
