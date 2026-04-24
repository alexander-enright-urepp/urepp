-- Profile Claims Schema
-- Run this in Supabase SQL Editor

-- Create table for profile claim requests
CREATE TABLE IF NOT EXISTS profile_claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    profile_username TEXT NOT NULL,
    profile_url TEXT NOT NULL,
    claimer_email TEXT NOT NULL,
    claimer_message TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id)
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_profile_claims_profile_id ON profile_claims(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_claims_status ON profile_claims(status);
CREATE INDEX IF NOT EXISTS idx_profile_claims_email ON profile_claims(claimer_email);

-- RLS Policies
ALTER TABLE profile_claims ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for claim requests)
CREATE POLICY "Allow public to submit claims" ON profile_claims
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Allow admins to view all claims
CREATE POLICY "Allow admins to view claims" ON profile_claims
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.role = 'admin'
    ));

-- Allow admins to update claims
CREATE POLICY "Allow admins to update claims" ON profile_claims
    FOR UPDATE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.role = 'admin'
    ));

-- Comments
COMMENT ON TABLE profile_claims IS 'Stores profile ownership claim requests from users';
COMMENT ON COLUMN profile_claims.status IS 'pending, approved, rejected';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_profile_claims_updated_at ON profile_claims;
CREATE TRIGGER update_profile_claims_updated_at
    BEFORE UPDATE ON profile_claims
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
