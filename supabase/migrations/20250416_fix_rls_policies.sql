-- Fix RLS policies for profiles table to allow disconnect
-- Users must be able to update their own profile

-- Ensure profiles has proper UPDATE policy
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Ensure users can delete their own profile (for account deletion)
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

CREATE POLICY "Users can delete own profile" 
  ON profiles FOR DELETE 
  USING (user_id = auth.uid());

-- Verify calendly_tokens has proper policies
-- Users should be able to delete their own tokens
DROP POLICY IF EXISTS "Users can delete own Calendly tokens" ON calendly_tokens;

CREATE POLICY "Users can delete own Calendly tokens" 
  ON calendly_tokens FOR DELETE 
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
