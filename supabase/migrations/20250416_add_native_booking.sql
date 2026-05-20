-- Create coach_availability table for booking slots
CREATE TABLE IF NOT EXISTS coach_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(coach_id, day_of_week, start_time)
);

-- Create booked_sessions table
CREATE TABLE IF NOT EXISTS booked_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  athlete_email TEXT NOT NULL,
  athlete_name TEXT NOT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE coach_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE booked_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for coach_availability
CREATE POLICY "Coaches can manage their availability" 
  ON coach_availability FOR ALL 
  USING (coach_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can view coach availability" 
  ON coach_availability FOR SELECT 
  TO authenticated, anon
  USING (is_active = true);

-- Policies for booked_sessions
CREATE POLICY "Coaches can view their sessions" 
  ON booked_sessions FOR SELECT 
  USING (coach_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Athletes can view their sessions" 
  ON booked_sessions FOR SELECT 
  USING (athlete_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can book a session" 
  ON booked_sessions FOR INSERT 
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Coaches can update their sessions" 
  ON booked_sessions FOR UPDATE 
  USING (coach_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_availability_coach ON coach_availability(coach_id);
CREATE INDEX IF NOT EXISTS idx_sessions_coach ON booked_sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_sessions_athlete ON booked_sessions(athlete_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON booked_sessions(session_date);

COMMENT ON TABLE coach_availability IS 'Weekly recurring availability slots for coaches';
COMMENT ON TABLE booked_sessions IS 'Booked coaching sessions';
