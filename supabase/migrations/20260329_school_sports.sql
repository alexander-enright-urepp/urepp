-- Add college and high school sports columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS college_name TEXT,
ADD COLUMN IF NOT EXISTS college_years_played TEXT,
ADD COLUMN IF NOT EXISTS college_city TEXT,
ADD COLUMN IF NOT EXISTS college_state TEXT,
ADD COLUMN IF NOT EXISTS college_sport TEXT,
ADD COLUMN IF NOT EXISTS high_school_sports TEXT[]; -- Array for multiple sports

-- Remove old single sport column (optional - keep for backward compatibility if needed)
-- ALTER TABLE profiles DROP COLUMN IF EXISTS sport;
