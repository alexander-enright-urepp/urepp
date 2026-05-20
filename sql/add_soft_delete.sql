-- Add soft delete support to profiles table
-- Run this in Supabase SQL Editor

-- Add deleted_at column for soft delete
ALTER TABLE IF EXISTS profiles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Create index for filtering deleted profiles
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at) 
WHERE deleted_at IS NOT NULL;

-- Create index for active profiles (most common query)
CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(is_deleted) 
WHERE is_deleted = FALSE OR is_deleted IS NULL;

-- Optional: Create a view for active profiles only
CREATE OR REPLACE VIEW active_profiles AS
SELECT * FROM profiles 
WHERE deleted_at IS NULL 
   OR is_deleted = FALSE 
   OR is_deleted IS NULL;

COMMENT ON COLUMN profiles.deleted_at IS 'Timestamp when profile was soft deleted';
COMMENT ON COLUMN profiles.is_deleted IS 'Flag for soft delete status';
