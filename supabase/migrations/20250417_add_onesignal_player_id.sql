-- Add OneSignal player ID to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onesignal_player_id TEXT;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_onesignal_id ON profiles(onesignal_player_id);
