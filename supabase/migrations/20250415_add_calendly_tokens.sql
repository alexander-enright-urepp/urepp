-- Create table for storing Calendly OAuth tokens
CREATE TABLE IF NOT EXISTS calendly_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  scope TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_calendly_tokens_profile_id ON calendly_tokens(profile_id);

-- Enable RLS
ALTER TABLE calendly_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only see their own tokens
CREATE POLICY "Users can view own Calendly tokens" 
  ON calendly_tokens FOR SELECT 
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Users can only update their own tokens
CREATE POLICY "Users can update own Calendly tokens" 
  ON calendly_tokens FOR UPDATE 
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Users can insert their own tokens
CREATE POLICY "Users can insert own Calendly tokens" 
  ON calendly_tokens FOR INSERT 
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Users can delete their own tokens
CREATE POLICY "Users can delete own Calendly tokens" 
  ON calendly_tokens FOR DELETE 
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

COMMENT ON TABLE calendly_tokens IS 'OAuth tokens for Calendly API access';
