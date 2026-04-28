-- FIX: Add missing columns to existing appointments table
-- Run this if you get "column does not exist" errors

-- Add missing columns if they don't exist
DO $$
BEGIN
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
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_requested_by ON appointments(requested_by);
CREATE INDEX IF NOT EXISTS idx_appointments_recipient ON appointments(recipient_id);

-- Enable RLS if not already enabled
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
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
) WITH CHECK (
    auth.uid() IN (SELECT user_id FROM profiles WHERE id = recipient_id)
);

-- Create trigger for responded_at
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

-- Show columns to verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'appointments' 
ORDER BY ordinal_position;
