-- Age Verification Schema Migration
-- Run this in Supabase SQL Editor

-- Add age verification columns to profiles table
ALTER TABLE IF EXISTS profiles 
ADD COLUMN IF NOT EXISTS age_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS age_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS consent_given_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS consent_app_version TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS terms_version_accepted TEXT;

-- Create index for age_verified lookups
CREATE INDEX IF NOT EXISTS idx_profiles_age_verified ON profiles(age_verified);

-- Create RLS policy to allow users to update their own age verification
-- (Note: This should be restricted - users shouldn't directly set age_verified=true)

-- Add comment for documentation
COMMENT ON COLUMN profiles.age_verified IS 'COPPA compliance: true if user confirmed 13+ and consented';
COMMENT ON COLUMN profiles.date_of_birth IS 'User birth date - stored only for 13+ users per COPPA';

-- Create a function to verify age (used by app, not direct DB access)
CREATE OR REPLACE FUNCTION verify_user_age(
    user_uuid UUID,
    birth_date DATE,
    app_version TEXT DEFAULT '1.0.0'
) RETURNS BOOLEAN AS $$
DECLARE
    user_age INTEGER;
BEGIN
    -- Calculate age
    user_age := EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date));
    
    -- Only proceed if 13 or older
    IF user_age >= 13 THEN
        UPDATE profiles 
        SET 
            age_verified = TRUE,
            age_verified_at = NOW(),
            consent_given_at = NOW(),
            consent_app_version = app_version,
            date_of_birth = birth_date,
            updated_at = NOW()
        WHERE user_id = user_uuid;
        
        RETURN TRUE;
    ELSE
        -- Log attempt but don't store DOB for under-13s (COPPA)
        -- Store anonymous flag only
        UPDATE profiles 
        SET 
            age_verified = FALSE,
            updated_at = NOW()
        WHERE user_id = user_uuid;
        
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION verify_user_age TO authenticated;
GRANT EXECUTE ON FUNCTION verify_user_age TO anon;