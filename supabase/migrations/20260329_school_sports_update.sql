-- Add college and high school sports fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS college_name TEXT,
ADD COLUMN IF NOT EXISTS college_years_played TEXT[], -- Array of years
ADD COLUMN IF NOT EXISTS college_city TEXT,
ADD COLUMN IF NOT EXISTS college_state TEXT,
ADD COLUMN IF NOT EXISTS college_sports TEXT[], -- Array of sports
ADD COLUMN IF NOT EXISTS high_school_sports TEXT[]; -- Array of sports

-- Note: Keep existing 'sport', 'city', 'state' columns for backward compatibility
