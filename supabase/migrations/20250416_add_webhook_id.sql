-- Add webhook_id column to calendly_tokens table
ALTER TABLE calendly_tokens 
ADD COLUMN IF NOT EXISTS webhook_id TEXT,
ADD COLUMN IF NOT EXISTS webhook_url TEXT;

COMMENT ON COLUMN calendly_tokens.webhook_id IS 'Calendly webhook subscription URI for automatic booking sync';
COMMENT ON COLUMN calendly_tokens.webhook_url IS 'URL where webhook events are sent';
