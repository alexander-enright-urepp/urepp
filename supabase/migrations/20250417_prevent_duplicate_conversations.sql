-- Add database-level protection against duplicate conversations
-- First drop existing unique constraints if they exist
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS unique_participant_pair;
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS unique_participants;

-- Create a function to ensure consistent ordering of participants
CREATE OR REPLACE FUNCTION normalize_participants()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure participant_1 is always the smaller UUID (lexicographically)
  -- This prevents duplicates regardless of order
  IF NEW.participant_1 > NEW.participant_2 THEN
    DECLARE
      temp UUID;
    BEGIN
      temp := NEW.participant_1;
      NEW.participant_1 := NEW.participant_2;
      NEW.participant_2 := temp;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to normalize participants before insert
DROP TRIGGER IF EXISTS trigger_normalize_participants ON conversations;
CREATE TRIGGER trigger_normalize_participants
  BEFORE INSERT ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION normalize_participants();

-- Add unique constraint on normalized participants
ALTER TABLE conversations ADD CONSTRAINT unique_participant_pair 
  UNIQUE (participant_1, participant_2);

-- Create a function to safely get or create a conversation
-- This handles the race condition where two users try to create a conversation simultaneously
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_participant_1 UUID,
  p_participant_2 UUID
) RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
  v_participant_1 UUID;
  v_participant_2 UUID;
BEGIN
  -- Normalize participant order (smaller first)
  IF p_participant_1 < p_participant_2 THEN
    v_participant_1 := p_participant_1;
    v_participant_2 := p_participant_2;
  ELSE
    v_participant_1 := p_participant_2;
    v_participant_2 := p_participant_1;
  END IF;

  -- Try to find existing conversation
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE participant_1 = v_participant_1 AND participant_2 = v_participant_2;

  -- If not found, create it
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (participant_1, participant_2, last_message_at)
    VALUES (v_participant_1, v_participant_2, NOW())
    ON CONFLICT (participant_1, participant_2) DO NOTHING
    RETURNING id INTO v_conversation_id;

    -- If insertion failed due to race condition, try to get existing again
    IF v_conversation_id IS NULL THEN
      SELECT id INTO v_conversation_id
      FROM conversations
      WHERE participant_1 = v_participant_1 AND participant_2 = v_participant_2;
    END IF;
  END IF;

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_or_create_conversation(UUID, UUID) TO authenticated;
