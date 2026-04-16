-- Add webhook_id column to calendly_tokens table
ALTER TABLE calendly_tokens 
ADD COLUMN IF NOT EXISTS webhook_id TEXT;

COMMENT ON COLUMN calendly_tokens.webhook_id IS 'Calendly webhook subscription URI for automatic booking sync';
