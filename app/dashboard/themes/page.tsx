'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Loader2, 
  Palette,
  Check,
  Home,
  Search,
  User,
  Crown,
  Lock,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Tv,
  ExternalLink,
  UserCircle2,
  Sparkles,
  Rocket,
  Star,
  Zap,
  Flame,
  Heart
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Extended themes with more options
const THEMES = [
  // Free themes
  { id: 'default', name: 'Baby Blue', color: '#ffffff', textColor: '#0ea5e9', accent: '#0ea5e9', isPremium: false },
  { id: 'midnight', name: 'Midnight', color: '#1f2937', accent: '#374151', isPremium: false, dark: true },
  
  // Premium themes
  { id: 'neon', name: 'Neon Dreams', color: '#d946ef', accent: '#22d3ee', isPremium: true, gradient: 'from-fuchsia-500 via-purple-500 to-cyan-500' },
  { id: 'sunset', name: 'Sunset Blvd', color: '#f97316', accent: '#ec4899', isPremium: true, gradient: 'from-orange-400 via-pink-500 to-purple-600' },
  { id: 'forest', name: 'Forest', color: '#059669', accent: '#84cc16', isPremium: true },
  { id: 'ocean', name: 'Ocean Deep', color: '#0284c7', accent: '#06b6d4', isPremium: true, gradient: 'from-blue-600 via-cyan-500 to-teal-400' },
  { id: 'lavender', name: 'Lavender', color: '#8b5cf6', accent: '#c084fc', isPremium: true },
  { id: 'rose', name: 'Rose Gold', color: '#e11d48', accent: '#fb7185', isPremium: true },
  { id: 'emerald', name: 'Emerald', color: '#059669', accent: '#34d399', isPremium: true },
  { id: 'cyber', name: 'Cyberpunk', color: '#06b6d4', accent: '#facc15', isPremium: true, dark: true, gradient: 'from-cyan-400 via-blue-500 to-yellow-400' },
  { id: 'magma', name: 'Magma', color: '#dc2626', accent: '#fb923c', isPremium: true, gradient: 'from-red-600 via-orange-500 to-yellow-500' },
  { id: 'aurora', name: 'Aurora', color: '#6366f1', accent: '#2dd4bf', isPremium: true, gradient: 'from-indigo-500 via-purple-500 to-teal-400' },
]

// Sample data for preview
const SAMPLE_PROFILE = {
  first_name: 'Alex',
  last_name: 'Johnson',
  username: 'alexjohnson',
  bio: 'Student-athlete | Baseball | Class of 2026',
  profile_picture_url: null,
  grad_year: 2026,
  high_school: 'West High School',
  state: 'CA',
  high_school_sports: ['Baseball'],
  is_premium: true
}

export default function ThemesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [selectedTheme, setSelectedTheme] = useState('default')
  const [isPremium, setIsPremium] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (profileData) {
      setProfile(profileData)
      setSelectedTheme(profileData.theme || 'default')
      setIsPremium(profileData.is_premium || false)
    }
    
    setLoading(false)
  }

  const handleThemeSelect = async (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId)
    
    // If premium theme and user isn't premium, don't save
    if (theme?.isPremium && !isPremium) {
      return
    }
    
    setSelectedTheme(themeId)
    setError('')
    setSuccess('')
  }

  const saveTheme = async () => {
    if (!profile) return
    
    setSaving(true)
    setError('')
    setSuccess('')
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ theme: selectedTheme })
      .eq('id', profile.id)
    
    if (updateError) {
      setError('Failed to save theme: ' + updateError.message)
    } else {
      setSuccess('Theme saved!')
      setTimeout(() => setSuccess(''), 3000)
    }
    
    setSaving(false)
  }

  const getThemeClasses = (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0]
    
    if (theme.gradient) {
      return `bg-gradient-to-br ${theme.gradient}`
    }
    
    return ''
  }

  const getThemeStyles = (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0]
    
    if (theme.gradient) {
      return {}
    }
    
    return {
      backgroundColor: theme.color,
    } as React.CSSProperties
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-babyblue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-babyblue-100 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link 
                href="/dashboard" 
                className="w-10 h-10 rounded-xl bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Themes</h1>
                <p className="text-sm text-gray-500">{isPremium ? 'Premium Access' : 'Free Themes'}</p>
              </div>
            </div>
            {!isPremium && (
              <Link 
                href="/dashboard/subscription"
                className="flex items-center gap-1 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors"
              >
                <Crown className="w-4 h-4" />
                Upgrade
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
            {success}
          </div>
        )}

        {/* Premium Banner for non-premium users */}
        {!isPremium && (
          <div className="mb-6 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5" />
              <span className="font-bold">Unlock All Themes</span>
            </div>
            <p className="text-sm text-yellow-100 mb-3">
              Get access to 10+ premium themes to make your profile stand out.
            </p>
            <Link 
              href="/dashboard/subscription"
              className="block w-full bg-white text-yellow-600 text-center py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Upgrade to Premium
            </Link>
          </div>
        )}

        {/* Live Preview */}
        <div className="mb-6 bg-white rounded-2xl p-4 border border-babyblue-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-babyblue-500" />
              Live Preview
            </h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {THEMES.find(t => t.id === selectedTheme)?.name}
            </span>
          </div>
          
          {/* Profile Preview Card */}
          <div 
            className={`rounded-xl p-6 ${getThemeClasses(selectedTheme)}`}
            style={getThemeStyles(selectedTheme)}
          >
            <div className="text-center">
              {/* Avatar */}
              <div className="w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center mb-4 shadow-lg">
                <UserCircle2 className="w-10 h-10 text-white/80" />
              </div>
              
              {/* Name */}
              <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">
                {SAMPLE_PROFILE.first_name} {SAMPLE_PROFILE.last_name}
              </h3>
              
              {/* Username */}
              <p className="text-white/80 text-sm mb-3">@{SAMPLE_PROFILE.username}</p>
              
              {/* Verified Badge */}
              <div className="inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold mb-4">
                <Crown className="w-3 h-3" />
                VERIFIED
              </div>
              
              {/* Bio */}
              <p className="text-white/90 text-sm mb-4">{SAMPLE_PROFILE.bio}</p>
              
              {/* Quick Info */}
              <div className="flex justify-center gap-2 flex-wrap">
                <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs">
                  {SAMPLE_PROFILE.high_school_sports[0]}
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs">
                  {SAMPLE_PROFILE.grad_year}
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs">
                  {SAMPLE_PROFILE.state}
                </span>
              </div>
              
              {/* Social Icons Preview */}
              <div className="flex justify-center gap-3 mt-4">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Instagram className="w-5 h-5 text-white" />
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Twitter className="w-5 h-5 text-white" />
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Youtube className="w-5 h-5 text-white" />
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Free Themes Section */}
        <div className="mb-6">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-babyblue-500" />
            Free Themes
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {THEMES.filter(t => !t.isPremium).map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme.id)}
                className={`bg-white rounded-2xl p-4 border-2 transition-all relative overflow-hidden ${
                  selectedTheme === theme.id 
                    ? 'border-babyblue-500 shadow-md' 
                    : 'border-gray-100 hover:border-babyblue-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: theme.color + '20' }}
                  >
                    <Palette className="w-5 h-5" style={{ color: theme.color }} />
                  </div>
                  {selectedTheme === theme.id && (
                    <div className="w-6 h-6 rounded-full bg-babyblue-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <p className="font-semibold text-gray-900 text-left">{theme.name}</p>
                <div 
                  className="mt-2 h-3 rounded-full"
                  style={{ backgroundColor: theme.color }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Premium Themes Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Premium Themes
            </h2>
            {!isPremium && (
              <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full font-medium">
                Premium Only
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {THEMES.filter(t => t.isPremium).map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme.id)}
                disabled={!isPremium}
                className={`bg-white rounded-2xl p-4 border-2 transition-all relative overflow-hidden ${
                  selectedTheme === theme.id && isPremium
                    ? 'border-babyblue-500 shadow-md' 
                    : 'border-gray-100 hover:border-babyblue-200'
                } ${!isPremium ? 'opacity-70' : ''}`}
              >
                {/* Lock overlay for non-premium */}
                {!isPremium && (
                  <div className="absolute inset-0 bg-gray-100/50 flex items-center justify-center z-10">
                    <div className="bg-white rounded-full p-2 shadow-lg">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ 
                      background: theme.gradient 
                        ? `linear-gradient(135deg, ${theme.color}20, ${theme.accent}20)` 
                        : theme.color + '20' 
                    }}
                  >
                    <Palette className="w-5 h-5" style={{ color: theme.color }} />
                  </div>
                  {isPremium && selectedTheme === theme.id && (
                    <div className="w-6 h-6 rounded-full bg-babyblue-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {theme.gradient && (
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <p className="font-semibold text-gray-900 text-left">{theme.name}</p>
                <div 
                  className={`mt-2 h-3 rounded-full ${theme.gradient || ''}`}
                  style={{ 
                    background: theme.gradient 
                      ? undefined 
                      : theme.color 
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={saveTheme}
          disabled={saving}
          className="w-full bg-babyblue-500 hover:bg-babyblue-600 disabled:opacity-50 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-babyblue-500/25"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Check className="w-5 h-5" />
          )}
          {saving ? 'Saving...' : 'Save Theme'}
        </button>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-babyblue-100 px-4 py-2 z-50">
        <div className="max-w-md mx-auto flex justify-around">
          <Link href="/" className="flex flex-col items-center gap-0.5 py-2 px-6 text-gray-400 hover:text-gray-600">
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link href="/tv" className="flex flex-col items-center gap-0.5 py-2 px-6 text-gray-400 hover:text-gray-600">
            <Tv className="w-6 h-6" />
            <span className="text-xs font-medium">TV</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center gap-0.5 py-2 px-6 text-gray-400 hover:text-gray-600">
            <Search className="w-6 h-6" />
            <span className="text-xs font-medium">Search</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center gap-0.5 py-2 px-6 text-babyblue-600">
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
