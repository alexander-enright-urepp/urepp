-- SQL to add account deletion support
-- Run this in your Supabase SQL Editor

-- 1. Add deleted_at column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- 2. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_deleted 
ON profiles(is_deleted) 
WHERE is_deleted = true;

-- 3. Create function to soft delete user
CREATE OR REPLACE FUNCTION soft_delete_user(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  -- Mark profile as deleted
  UPDATE profiles 
  SET 
    is_deleted = true,
    deleted_at = NOW(),
    updated_at = NOW()
  WHERE user_id = user_uuid;
  
  -- Optional: anonymize data
  UPDATE profiles
  SET
    first_name = 'Deleted',
    last_name = 'User',
    email = 'deleted_' || user_id || '@deleted.com',
    username = 'deleted_' || user_id
  WHERE user_id = user_uuid;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create RLS policy to prevent deleted users from accessing data
-- (This assumes you have RLS enabled on profiles table)

-- First, drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create updated policy that excludes deleted users
CREATE POLICY "Users can view their own profile" 
ON profiles 
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND (is_deleted = false OR is_deleted IS NULL)
);

-- 5. Policy for updates (prevent updating deleted accounts)
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
USING (
  auth.uid() = user_id 
  AND (is_deleted = false OR is_deleted IS NULL)
)
WITH CHECK (
  auth.uid() = user_id 
  AND (is_deleted = false OR is_deleted IS NULL)
);

-- 6. Add trigger to prevent login if deleted
-- This requires a custom check in your auth flow

-- Note: To fully prevent login, you'll need to check is_deleted 
-- in your app code before allowing access
