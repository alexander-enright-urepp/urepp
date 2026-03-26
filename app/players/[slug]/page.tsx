import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import ProfilePageClient from './ProfilePageClient'

interface Profile {
  id: string
  first_name: string
  last_name: string
  username: string
  profile_picture_url: string | null
  sport: string
  grad_year: number
  primary_position: string
  secondary_position: string | null
  height: string | null
  weight: string | null
  bats: string | null
  throws: string | null
  gpa: number | null
  city: string | null
  state: string | null
  high_school: string
  bio: string | null
  awards: string | null
  instagram: string | null
  twitter: string | null
  youtube: string | null
  stat_primary: string | null
  stat_secondary: string | null
  stat_tertiary: string | null
  exit_velocity: number | null
  pitch_velocity: number | null
  sixty_time: number | null
}

// Generate static params at build time
export async function generateStaticParams() {
  return [{ slug: 'placeholder' }]
}

interface PageProps {
  params: {
    slug: string
  }
}

export default async function ProfilePage({ params }: PageProps) {
  // Fetch profile server-side for initial render
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.slug.toLowerCase())
    .single()
  
  if (error || !profile) {
    notFound()
  }

  return <ProfilePageClient initialProfile={profile as Profile} />
}