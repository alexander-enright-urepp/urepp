// Daily.co API integration for video calls
const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_DOMAIN = process.env.NEXT_PUBLIC_DAILY_DOMAIN || 'urepp.daily.co';

interface DailyRoom {
  name: string;
  url: string;
  privacy: 'public' | 'private';
  created_at: string;
}

// Create a new Daily room for a session
export async function createRoom(sessionName: string, expirationMinutes = 60): Promise<DailyRoom> {
  if (!DAILY_API_KEY) {
    throw new Error('DAILY_API_KEY not configured');
  }

  const roomName = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const response = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      name: roomName,
      privacy: 'public',
      properties: {
        exp: Math.floor(Date.now() / 1000) + (expirationMinutes * 60),
        enable_chat: true,
        enable_screenshare: true,
        enable_recording: 'cloud',
        start_audio_off: false,
        start_video_off: false,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Daily.co API error:', response.status, errorText);
    throw new Error(`Failed to create room: ${response.status} ${errorText || 'Unknown error'}`);
  }

  const room = await response.json();
  
  return {
    name: room.name,
    url: `https://${DAILY_DOMAIN}/${roomName}`,
    privacy: room.privacy,
    created_at: room.created_at,
  };
}

// Get a room by name
export async function getRoom(roomName: string): Promise<DailyRoom | null> {
  if (!DAILY_API_KEY) {
    throw new Error('DAILY_API_KEY not configured');
  }

  const response = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
    headers: {
      'Authorization': `Bearer ${DAILY_API_KEY}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    const error = await response.json();
    throw new Error(`Failed to get room: ${error.message}`);
  }

  const room = await response.json();
  
  return {
    name: room.name,
    url: `https://${DAILY_DOMAIN}/${roomName}`,
    privacy: room.privacy,
    created_at: room.created_at,
  };
}

// Delete a room
export async function deleteRoom(roomName: string): Promise<void> {
  if (!DAILY_API_KEY) {
    throw new Error('DAILY_API_KEY not configured');
  }

  const response = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${DAILY_API_KEY}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to delete room: ${error.message}`);
  }
}

// Generate a meeting token for a participant
export async function createMeetingToken(roomName: string, userData: {
  user_id: string;
  user_name: string;
  is_owner?: boolean;
}, expirationMinutes = 60): Promise<string> {
  if (!DAILY_API_KEY) {
    throw new Error('DAILY_API_KEY not configured');
  }

  const response = await fetch('https://api.daily.co/v1/meeting-tokens', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      room_name: roomName,
      exp: Math.floor(Date.now() / 1000) + (expirationMinutes * 60),
      user_id: userData.user_id,
      user_name: userData.user_name,
      is_owner: userData.is_owner || false,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create meeting token: ${error.message}`);
  }

  const { token } = await response.json();
  return token;
}
