-- FIX: Add ALL missing columns to existing appointments table
-- This handles tables created with partial schema

DO $$
BEGIN
    -- Core columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'athlete_id') THEN
        ALTER TABLE appointments ADD COLUMN athlete_id UUID REFERENCES profiles(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'athlete_name') THEN
        ALTER TABLE appointments ADD COLUMN athlete_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'athlete_email') THEN
        ALTER TABLE appointments ADD COLUMN athlete_email VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'coach_id') THEN
        ALTER TABLE appointments ADD COLUMN coach_id UUID REFERENCES profiles(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'coach_name') THEN
        ALTER TABLE appointments ADD COLUMN coach_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'session_date') THEN
        ALTER TABLE appointments ADD COLUMN session_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'start_time') THEN
        ALTER TABLE appointments ADD COLUMN start_time TIME;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'end_time') THEN
        ALTER TABLE appointments ADD COLUMN end_time TIME;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'timezone') THEN
        ALTER TABLE appointments ADD COLUMN timezone VARCHAR(50) DEFAULT 'America/Los_Angeles';
    END IF;
    
    -- Approval workflow columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'requested_by') THEN
        ALTER TABLE appointments ADD COLUMN requested_by UUID REFERENCES profiles(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'requested_by_name') THEN
        ALTER TABLE appointments ADD COLUMN requested_by_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'recipient_id') THEN
        ALTER TABLE appointments ADD COLUMN recipient_id UUID REFERENCES profiles(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'status') THEN
        ALTER TABLE appointments ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'booked_at') THEN
        ALTER TABLE appointments ADD COLUMN booked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'responded_at') THEN
        ALTER TABLE appointments ADD COLUMN responded_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Video call columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'room_url') THEN
        ALTER TABLE appointments ADD COLUMN room_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'room_created_at') THEN
        ALTER TABLE appointments ADD COLUMN room_created_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Notification columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'onesignal_notification_sent') THEN
        ALTER TABLE appointments ADD COLUMN onesignal_notification_sent BOOLEAN DEFAULT false;
    END IF;
    
    -- Metadata
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'notes') THEN
        ALTER TABLE appointments ADD COLUMN notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'calendly_event_id') THEN
        ALTER TABLE appointments ADD COLUMN calendly_event_id VARCHAR(255);
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_requested_by ON appointments(requested_by);
CREATE INDEX IF NOT EXISTS idx_appointments_recipient ON appointments(recipient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_athlete ON appointments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_appointments_coach ON appointments(coach_id);
CREATE INDEX IF NOT EXISTS idx_appointments_session_date ON appointments(session_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status_recipient ON appointments(status, recipient_id);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Update policies
DROP POLICY IF EXISTS "Users can view their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON appointments;
DROP POLICY IF EXISTS "Recipients can update appointment status" ON appointments;

CREATE POLICY "Users can view their own appointments" ON appointments FOR SELECT USING (
    auth.uid() IN (
        SELECT user_id FROM profiles WHERE id IN (requested_by, recipient_id, athlete_id, coach_id)
    )
);

CREATE POLICY "Users can create appointments" ON appointments FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM profiles WHERE id = requested_by)
);

CREATE POLICY "Recipients can update appointment status" ON appointments FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM profiles WHERE id = recipient_id)
);

-- Trigger for responded_at
CREATE OR REPLACE FUNCTION update_appointment_responded_at()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'pending' AND NEW.status IN ('accepted', 'declined') THEN
        NEW.responded_at := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_responded_at ON appointments;
CREATE TRIGGER trg_update_responded_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_appointment_responded_at();

-- Verify
SELECT 'All columns added successfully' as status;
