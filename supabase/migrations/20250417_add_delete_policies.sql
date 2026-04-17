-- Add DELETE policy for conversations (users can delete conversations they participate in)
-- This allows the three-dots delete menu to work

DROP POLICY IF EXISTS "Users can delete conversations they participate in" ON conversations;

CREATE POLICY "Users can delete conversations they participate in"
  ON conversations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = conversations.participant_1 
      AND profiles.user_id = auth.uid()
    )
    OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = conversations.participant_2 
      AND profiles.user_id = auth.uid()
    )
  );

-- Also ensure messages are deleted when conversation is deleted (cascade should handle this)
-- But let's verify the delete policy for messages too

DROP POLICY IF EXISTS "Users can delete messages they sent" ON messages;

CREATE POLICY "Users can delete messages they sent"
  ON messages FOR DELETE
  TO authenticated
  USING (
    sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );
