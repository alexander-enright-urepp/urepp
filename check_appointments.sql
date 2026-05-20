-- Check if athlete_id column exists in appointments table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'appointments';

-- If athlete_id doesn't exist, add it
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS athlete_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Then create the index
CREATE INDEX IF NOT EXISTS idx_appointments_athlete_id ON appointments(athlete_id);

-- Then create the RLS policies
DROP POLICY IF EXISTS "Athletes can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Athletes can update their appointments" ON appointments;

CREATE POLICY "Athletes can view their appointments" 
  ON appointments FOR SELECT 
  USING (athlete_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Athletes can update their appointments" 
  ON appointments FOR UPDATE 
  USING (athlete_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
