-- MIGRATION: booked_sessions → appointments with approval workflow
-- Run this in Supabase SQL Editor to enable proper booking approval system

-- ============================================================
-- STEP 1: Create new appointments table with approval workflow
-- ============================================================

CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Who initiated the booking
    requested_by UUID NOT NULL REFERENCES profiles(id),
    requested_by_name VARCHAR(255),
    
    -- The recipient (coach) who needs to approve
    recipient_id UUID NOT NULL REFERENCES profiles(id),
    
    -- Athlete info (could be same as requested_by or different)
    athlete_id UUID REFERENCES profiles(id),
    athlete_name VARCHAR(255),
    athlete_email VARCHAR(255),
    
    -- Coach info
    coach_id UUID REFERENCES profiles(id),
    coach_name VARCHAR(255),
    
    -- Session details
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone VARCHAR(50) DEFAULT 'America/Los_Angeles',
    
    -- Status workflow
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    
    -- OneSignal notification tracking
    onesignal_notification_sent BOOLEAN DEFAULT false,
    
    -- Video call room (created after acceptance)
    room_url TEXT,
    room_created_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    booked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    notes TEXT,
    calendly_event_id VARCHAR(255),
    
    -- Constraints
    CONSTRAINT appointments_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'completed')),
    CONSTRAINT appointments_time_check CHECK (end_time > start_time)
);

-- ============================================================
-- STEP 2: Create indexes for performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_requested_by ON appointments(requested_by);
CREATE INDEX IF NOT EXISTS idx_appointments_recipient ON appointments(recipient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_athlete ON appointments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_appointments_coach ON appointments(coach_id);
CREATE INDEX IF NOT EXISTS idx_appointments_session_date ON appointments(session_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status_recipient ON appointments(status, recipient_id);

-- ============================================================
-- STEP 3: Migrate existing booked_sessions data
-- ============================================================

DO $$
DECLARE
    bs_record RECORD;
    requester_profile_id UUID;
    athlete_profile_id UUID;
    coach_profile_id UUID;
BEGIN
    -- Loop through all existing booked_sessions
    FOR bs_record IN 
        SELECT 
            bs.*,
            ap.id as athlete_profile_id,
            cp.id as coach_profile_id
        FROM booked_sessions bs
        LEFT JOIN profiles ap ON ap.id = bs.athlete_id
        LEFT JOIN profiles cp ON cp.id = bs.coach_id
    LOOP
        -- For existing sessions, assume athlete requested (most common case)
        -- Or use athlete_id as requested_by
        INSERT INTO appointments (
            requested_by,
            requested_by_name,
            recipient_id,
            athlete_id,
            athlete_name,
            athlete_email,
            coach_id,
            coach_name,
            session_date,
            start_time,
            end_time,
            status,
            booked_at,
            responded_at,
            notes
        ) VALUES (
            bs_record.athlete_id, -- athlete requested the booking
            bs_record.athlete_name,
            bs_record.coach_id, -- coach is recipient who needs to approve
            bs_record.athlete_id,
            bs_record.athlete_name,
            bs_record.athlete_email,
            bs_record.coach_id,
            bs_record.coach_name,
            bs_record.session_date,
            bs_record.start_time,
            bs_record.end_time,
            'accepted', -- Mark existing sessions as already accepted
            bs_record.created_at,
            bs_record.created_at, -- Assume accepted at creation for existing
            bs_record.notes
        )
        ON CONFLICT DO NOTHING;
        
    END LOOP;
    
    RAISE NOTICE 'Migrated % booked_sessions to appointments', 
        (SELECT COUNT(*) FROM booked_sessions);
END $$;

-- ============================================================
-- STEP 4: Add notifications_enabled column to profiles if not exists
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'notifications_enabled'
    ) THEN
        ALTER TABLE profiles ADD COLUMN notifications_enabled BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'onesignal_player_id'
    ) THEN
        ALTER TABLE profiles ADD COLUMN onesignal_player_id TEXT;
    END IF;
END $$;

-- ============================================================
-- STEP 5: Create function to update responded_at timestamp
-- ============================================================

CREATE OR REPLACE FUNCTION update_appointment_responded_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Update responded_at when status changes from pending
    IF OLD.status = 'pending' AND NEW.status IN ('accepted', 'declined') THEN
        NEW.responded_at := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trg_update_responded_at ON appointments;

-- Create trigger
CREATE TRIGGER trg_update_responded_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_appointment_responded_at();

-- ============================================================
-- STEP 6: Enable RLS on appointments table
-- ============================================================

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON appointments;
DROP POLICY IF EXISTS "Recipients can update appointment status" ON appointments;

-- Policy: Users can view appointments where they're involved
CREATE POLICY "Users can view their own appointments" ON appointments
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE id = requested_by
            UNION
            SELECT user_id FROM profiles WHERE id = recipient_id
            UNION
            SELECT user_id FROM profiles WHERE id = athlete_id
            UNION
            SELECT user_id FROM profiles WHERE id = coach_id
        )
    );

-- Policy: Users can create appointments
CREATE POLICY "Users can create appointments" ON appointments
    FOR INSERT
    WITH CHECK (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = requested_by)
    );

-- Policy: Recipients can update status (accept/decline)
CREATE POLICY "Recipients can update appointment status" ON appointments
    FOR UPDATE
    USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = recipient_id)
    )
    WITH CHECK (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = recipient_id)
    );

-- ============================================================
-- STEP 7: Create view for pending bookings that need approval
-- ============================================================

CREATE OR REPLACE VIEW pending_bookings AS
SELECT 
    a.*,
    p.first_name as requester_first_name,
    p.last_name as requester_last_name,
    p.profile_picture_url as requester_picture
FROM appointments a
JOIN profiles p ON p.id = a.requested_by
WHERE a.status = 'pending'
ORDER BY a.booked_at DESC;

-- ============================================================
-- STEP 8: Verify migration
-- ============================================================

DO $$
DECLARE
    old_count INTEGER;
    new_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO old_count FROM booked_sessions;
    SELECT COUNT(*) INTO new_count FROM appointments;
    
    RAISE NOTICE 'Migration Summary:';
    RAISE NOTICE '  - booked_sessions (old): %', old_count;
    RAISE NOTICE '  - appointments (new): %', new_count;
    RAISE NOTICE '  - migrated: %', new_count;
END $$;

-- ============================================================
-- STEP 9: Optional - Create function to auto-create room on acceptance
-- ============================================================

CREATE OR REPLACE FUNCTION create_room_on_acceptance()
RETURNS TRIGGER AS $$
BEGIN
    -- When status changes to accepted, could auto-create room here
    -- For now, just log it
    IF OLD.status = 'pending' AND NEW.status = 'accepted' THEN
        RAISE NOTICE 'Appointment % accepted - ready for room creation', NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_room ON appointments;

CREATE TRIGGER trg_create_room
    AFTER UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION create_room_on_acceptance();

-- ============================================================
-- FINAL: Show confirmation
-- ============================================================

SELECT 
    'Migration Complete!' as status,
    (SELECT COUNT(*) FROM appointments WHERE status = 'pending') as pending_count,
    (SELECT COUNT(*) FROM appointments WHERE status = 'accepted') as accepted_count,
    (SELECT COUNT(*) FROM appointments) as total_count;
