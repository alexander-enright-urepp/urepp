import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Profile = {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  grad_year: number
  position: string
  height: string
  weight: string
  throws: string
  bats: string
  high_school: string
  hometown: string
  state: string
  gpa: string
  sat_score: string
  act_score: string
  bio: string
  stats_json: any
  created_at: string
  updated_at: string
  slug: string
}

export type Video = {
  id: string
  profile_id: string
  title: string
  url: string
  description: string
  video_type: string
  created_at: string
}
