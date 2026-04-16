-- Create video_sessions table for Daily.co video calls
CREATE TABLE IF NOT EXISTS video_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  room_url TEXT NOT NULL,
  room_name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended', 'cancelled')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(appointment_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_video_sessions_appointment_id ON video_sessions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_video_sessions_created_by ON video_sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_video_sessions_status ON video_sessions(status);

-- Enable RLS
ALTER TABLE video_sessions ENABLE ROW LEVEL SECURITY;

-- Coaches can view sessions for their appointments
CREATE POLICY "Coaches can view their video sessions" 
  ON video_sessions FOR SELECT 
  USING (
    appointment_id IN (
      SELECT id FROM appointments 
      WHERE coach_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

-- Athletes can view sessions for their appointments
CREATE POLICY "Athletes can view their video sessions" 
  ON video_sessions FOR SELECT 
  USING (
    appointment_id IN (
      SELECT id FROM appointments 
      WHERE athlete_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

-- Coaches can create sessions
CREATE POLICY "Coaches can create video sessions" 
  ON video_sessions FOR INSERT 
  WITH CHECK (
    appointment_id IN (
      SELECT id FROM appointments 
      WHERE coach_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

-- Coaches can update their sessions
CREATE POLICY "Coaches can update their video sessions" 
  ON video_sessions FOR UPDATE 
  USING (
    appointment_id IN (
      SELECT id FROM appointments 
      WHERE coach_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

COMMENT ON TABLE video_sessions IS 'Daily.co video call sessions linked to appointments';
