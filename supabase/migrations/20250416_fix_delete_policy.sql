-- Fix Calendly tokens delete policy
-- The original policy wasn't allowing deletes properly

DROP POLICY IF EXISTS "Users can delete own Calendly tokens" ON calendly_tokens;

CREATE POLICY "Users can delete own Calendly tokens" 
  ON calendly_tokens FOR DELETE 
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );
