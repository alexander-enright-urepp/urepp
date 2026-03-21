import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create client only if env vars are available (build-time safe)
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : createClient('https://placeholder.supabase.co', 'placeholder')

export type Profile = {
  id: string
  user_id: string
  first_name: string
  last_name: string
  username: string
  profile_picture_url: string | null
  city: string | null
  state: string | null
  high_school: string
  teams_played_for: string | null
  primary_position: string
  secondary_position: string | null
  bats: string | null
  throws: string | null
  grad_year: number
  height: string | null
  weight: string | null
  exit_velocity: number | null
  pitch_velocity: number | null
  sixty_time: number | null
  gpa: number | null
  instagram: string | null
  twitter: string | null
  youtube: string | null
  bio: string | null
  created_at: string
  updated_at: string
}