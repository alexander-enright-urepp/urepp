-- Add OneSignal player ID column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onesignal_player_id TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_onesignal_player_id ON profiles(onesignal_player_id);

-- Comment for documentation
COMMENT ON COLUMN profiles.onesignal_player_id IS 'OneSignal push notification player/subscription ID for sending push notifications';
