-- Add subscription details to profiles table
-- Run this in Supabase SQL Editor

-- Add columns to track subscription details
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS premium_type VARCHAR(20), -- 'monthly' or 'yearly'
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_transaction_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_product_id VARCHAR(255);

-- Add index for subscription expiration queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_expires 
ON profiles(subscription_expires_at) 
WHERE is_premium = true;

-- Optional: Add a function to check if subscription is active
CREATE OR REPLACE FUNCTION is_subscription_active(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  expires_at TIMESTAMP;
  is_premium_user BOOLEAN;
BEGIN
  SELECT subscription_expires_at, is_premium 
  INTO expires_at, is_premium_user
  FROM profiles 
  WHERE user_id = user_uuid;
  
  -- If no expiration (lifetime or not set), check is_premium
  IF expires_at IS NULL THEN
    RETURN is_premium_user;
  END IF;
  
  -- Check if expired
  RETURN expires_at > NOW();
END;
$$ LANGUAGE plpgsql;

-- Update API to use these new columns
COMMENT ON COLUMN profiles.premium_type IS ' monthly or yearly subscription';
COMMENT ON COLUMN profiles.subscription_expires_at IS 'When the subscription expires (NULL = no expiration or lifetime)';
COMMENT ON COLUMN profiles.last_transaction_id IS 'Last IAP transaction ID for validation';
COMMENT ON COLUMN profiles.last_product_id IS 'Last IAP product ID purchased';
