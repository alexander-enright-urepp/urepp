-- Add calendly_link column to profiles table for mental performance coaching
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS calendly_link TEXT;

-- Add comment to document the field
COMMENT ON COLUMN profiles.calendly_link IS 'Calendly scheduling link for coaches (e.g., username/call-type)';
