import { supabase } from './supabase'

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    return { data, error }
  }
  
  // Check if account is deleted
  if (data.user) {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('is_deleted')
      .eq('user_id', data.user.id)
      .single()
    
    if (profileData?.is_deleted) {
      // Sign out immediately
      await supabase.auth.signOut()
      return { 
        data: null, 
        error: { 
          message: 'This account has been deleted. Please contact support if you need to restore your account.' 
        } 
      }
    }
  }
  
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}
