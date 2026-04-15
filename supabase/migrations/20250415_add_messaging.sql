-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_1, participant_2),
  UNIQUE(participant_2, participant_1)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON conversations(participant_1);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON conversations(participant_2);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Policies for conversations
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (
    participant_1 IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR participant_2 IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    participant_1 IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR participant_2 IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Policies for messages
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE participant_1 IN (SELECT id FROM profiles WHERE user_id = auth.uid())
         OR participant_2 IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND conversation_id IN (
      SELECT id FROM conversations
      WHERE participant_1 IN (SELECT id FROM profiles WHERE user_id = auth.uid())
         OR participant_2 IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

-- Function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update last_message_at
DROP TRIGGER IF EXISTS trigger_update_last_message ON messages;
CREATE TRIGGER trigger_update_last_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();
