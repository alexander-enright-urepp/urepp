-- Add video_room_url to booked_sessions table
ALTER TABLE booked_sessions 
ADD COLUMN IF NOT EXISTS video_room_url TEXT;

COMMENT ON COLUMN booked_sessions.video_room_url IS 'Daily.co room URL for video calls';
