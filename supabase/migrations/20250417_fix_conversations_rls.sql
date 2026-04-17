-- Fix conversations RLS to ensure proper SELECT permissions
-- The issue is checking for existing conversations needs to work properly

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

-- More permissive SELECT policy - allow viewing any conversation where you're a participant
-- This also allows checking if a conversation exists before creating
CREATE POLICY "Users can view conversations they participate in"
  ON conversations FOR SELECT
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

-- INSERT policy - user must be one of the participants
CREATE POLICY "Users can create conversations as participant"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (
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

-- Add DELETE policy (users can delete their own conversations)
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

-- Also ensure messages RLS is correct
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

-- SELECT messages policy
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN profiles p1 ON p1.id = c.participant_1
      JOIN profiles p2 ON p2.id = c.participant_2
      WHERE c.id = messages.conversation_id
      AND (p1.user_id = auth.uid() OR p2.user_id = auth.uid())
    )
  );

-- INSERT messages policy  
CREATE POLICY "Users can send messages to their conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = messages.sender_id
      AND profiles.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM conversations c
      JOIN profiles p1 ON p1.id = c.participant_1
      JOIN profiles p2 ON p2.id = c.participant_2
      WHERE c.id = messages.conversation_id
      AND (p1.user_id = auth.uid() OR p2.user_id = auth.uid())
    )
  );
