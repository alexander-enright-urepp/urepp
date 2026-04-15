-- Create appointments table for Calendly bookings
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  calendly_event_id TEXT UNIQUE,
  calendly_invitee_id TEXT,
  event_type_name TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  athlete_email TEXT,
  athlete_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_appointments_coach_id ON appointments(coach_id);
CREATE INDEX IF NOT EXISTS idx_appointments_athlete_id ON appointments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Coaches can see their own appointments
CREATE POLICY "Coaches can view their appointments" 
  ON appointments FOR SELECT 
  USING (coach_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Athletes can see their own appointments
CREATE POLICY "Athletes can view their appointments" 
  ON appointments FOR SELECT 
  USING (athlete_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Coaches can update their appointments
CREATE POLICY "Coaches can update their appointments" 
  ON appointments FOR UPDATE 
  USING (coach_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Comments
COMMENT ON TABLE appointments IS 'Coaching appointments synced from Calendly webhooks';
COMMENT ON COLUMN appointments.calendly_event_id IS 'Calendly event UUID for deduplication';
COMMENT ON COLUMN appointments.status IS 'scheduled, completed, cancelled, or no_show';
