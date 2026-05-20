-- Add Calendly URI columns to calendly_tokens table
ALTER TABLE calendly_tokens 
ADD COLUMN IF NOT EXISTS calendly_user_uri TEXT,
ADD COLUMN IF NOT EXISTS calendly_organization_uri TEXT;

COMMENT ON COLUMN calendly_tokens.calendly_user_uri IS 'Calendly user URI from /users/me endpoint';
COMMENT ON COLUMN calendly_tokens.calendly_organization_uri IS 'Calendly organization URI for webhook subscriptions';
