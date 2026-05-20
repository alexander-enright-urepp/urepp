-- Add video_room_url to appointments table
-- This allows both coach and athlete to see the room URL
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS video_room_url TEXT;

COMMENT ON COLUMN appointments.video_room_url IS 'Daily.co room URL for video calls';
