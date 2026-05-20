-- Add calendly_link column to profiles table for mental performance coaching
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS calendly_link TEXT;

-- Add is_coaching_enabled column for coaches to toggle availability
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_coaching_enabled BOOLEAN DEFAULT false;

-- Add comment to document the field
COMMENT ON COLUMN profiles.calendly_link IS 'Calendly scheduling link for coaches (e.g., username/call-type)';
COMMENT ON COLUMN profiles.is_coaching_enabled IS 'Whether coach is accepting bookings';
