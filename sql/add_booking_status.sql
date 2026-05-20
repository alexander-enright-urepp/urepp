-- Add booking status columns for approval workflow
-- Run this AFTER testing locally

-- Add status column to appointments
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';

-- Add requested_by to track who initiated the booking
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS requested_by UUID REFERENCES profiles(id);

-- Add booking timestamps
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS booked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP WITH TIME ZONE;

-- Add constraint for status values
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'appointments_status_check'
  ) THEN
    ALTER TABLE appointments 
    ADD CONSTRAINT appointments_status_check 
    CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled'));
  END IF;
END $$;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_requested_by ON appointments(requested_by);
CREATE INDEX IF NOT EXISTS idx_appointments_profile_status ON appointments(profile_id, status);

-- Update existing appointments to 'accepted' so they still work
UPDATE appointments 
SET status = 'accepted', 
    requested_by = profile_id -- Assume profile requested their own booking initially
WHERE status IS NULL OR status = '';

-- Add comments
COMMENT ON COLUMN appointments.status IS 'Booking status: pending, accepted, declined, cancelled';
COMMENT ON COLUMN appointments.requested_by IS 'User ID who initiated the booking request';
COMMENT ON COLUMN appointments.booked_at IS 'When the booking was requested';
COMMENT ON COLUMN appointments.responded_at IS 'When the booking was accepted/declined';

-- Verify changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'appointments' 
AND column_name IN ('status', 'requested_by', 'booked_at', 'responded_at');
