-- Create get_or_create_conversation RPC function
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_participant_1 UUID,
  p_participant_2 UUID
) RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  -- First try to find existing conversation
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE (participant_1 = p_participant_1 AND participant_2 = p_participant_2)
     OR (participant_1 = p_participant_2 AND participant_2 = p_participant_1)
  LIMIT 1;
  
  -- If not found, create new one
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (participant_1, participant_2, last_message_at)
    VALUES (p_participant_1, p_participant_2, NOW())
    RETURNING id INTO v_conversation_id;
  END IF;
  
  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql;
