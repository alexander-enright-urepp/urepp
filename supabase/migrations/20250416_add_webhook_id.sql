-- Add webhook_id column to calendly_tokens
ALTER TABLE calendly_tokens 
ADD COLUMN IF NOT EXISTS webhook_id TEXT,
ADD COLUMN IF NOT EXISTS webhook_url TEXT;

-- Add comment
COMMENT ON COLUMN calendly_tokens.webhook_id IS 'Calendly webhook subscription URI';
COMMENT ON COLUMN calendly_tokens.webhook_url IS 'URL where webhook events are sent';
