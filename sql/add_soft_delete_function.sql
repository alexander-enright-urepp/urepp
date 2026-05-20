-- Soft delete function for user accounts
-- Run this in Supabase SQL Editor

-- Create function to soft delete user and their profile
CREATE OR REPLACE FUNCTION soft_delete_user(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Set deleted_at on profile
    UPDATE profiles 
    SET deleted_at = NOW(),
        is_deleted = TRUE,
        updated_at = NOW()
    WHERE user_id = user_uuid;
    
    -- Optionally: anonymize sensitive data
    UPDATE profiles
    SET email = 'deleted_' || id || '@deleted.com',
        phone = NULL,
        social_links = NULL,
        bio = 'This account has been deleted'
    WHERE user_id = user_uuid AND deleted_at IS NOT NULL;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION soft_delete_user TO authenticated;

COMMENT ON FUNCTION soft_delete_user IS 'Soft deletes a user account by setting deleted_at timestamp and anonymizing data';
