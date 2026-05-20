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
  Tv,
  BarChart3,
  FileText,
  Play,
  Trophy
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PREMIUM_THEMES, FREE_THEME, getThemeClasses, type ThemeConfig } from '@/lib/themes'

// Combine free and premium themes
const ALL_THEMES = [FREE_THEME, ...PREMIUM_THEMES]

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
    const theme = ALL_THEMES.find(t => t.id === themeId)
    
    // If premium theme and user isn't premium, don't save
    if (theme?.premium && !isPremium) {
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

  const currentTheme = ALL_THEMES.find(t => t.id === selectedTheme) || FREE_THEME


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-babyblue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 pb-24">
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
                <p className="text-sm text-gray-500">Customize your profile</p>
              </div>
            </div>
            {!isPremium && (
              <Link 
                href="/dashboard/subscription"
                className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1.5 rounded-full text-sm font-bold transition-colors"
              >
                <Crown className="w-4 h-4" />
                Upgrade
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
            {success}
          </div>
        )}

        {/* Premium Banner */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-6 h-6" />
              <span className="font-bold text-lg">Unlock 8 Premium Themes</span>
            </div>
            <p className="text-yellow-100 text-sm mb-4">
              Get unique layouts, typography, and styles that make your profile stand out to recruiters.
            </p>
            <Link 
              href="/dashboard/subscription"
              className="block w-full bg-white text-yellow-600 text-center py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
            >
              Upgrade to Premium
            </Link>
          </div>
        )}

        {/* Free Theme */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Palette className="w-5 h-5 text-babyblue-500" />
            Free Theme
          </h2>
          <button
            onClick={() => handleThemeSelect(FREE_THEME.id)}
            className={`w-full bg-white rounded-2xl p-4 border-2 transition-all flex items-center gap-4 ${
              selectedTheme === FREE_THEME.id 
                ? 'border-babyblue-500 shadow-md' 
                : 'border-gray-100 hover:border-babyblue-200'
            }`}
          >
            <div className="w-14 h-14 rounded-xl bg-babyblue-50 flex items-center justify-center text-2xl border border-babyblue-100">
              {FREE_THEME.preview}
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900">{FREE_THEME.name}</p>
              <p className="text-sm text-gray-500">Default clean look</p>
            </div>
            {selectedTheme === FREE_THEME.id && (
              <div className="w-8 h-8 rounded-full bg-babyblue-500 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            )}
          </button>
        </div>

        {/* Premium Themes Grid */}
        <div>
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
            {PREMIUM_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme.id)}
                disabled={!isPremium}
                className={`relative bg-white rounded-2xl p-4 border-2 transition-all text-left ${
                  selectedTheme === theme.id && isPremium
                    ? 'border-babyblue-500 shadow-md' 
                    : 'border-gray-100 hover:border-babyblue-200'
                } ${!isPremium ? 'opacity-60' : ''}`}
              >
                {/* Lock overlay for non-premium */}
                {!isPremium && (
                  <div className="absolute inset-0 bg-gray-100/60 rounded-2xl flex items-center justify-center z-10">
                    <div className="bg-white rounded-full p-2 shadow-lg">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                )}
                
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-2xl mb-3 border border-gray-100">
                  {theme.preview}
                </div>
                <p className="font-semibold text-gray-900 text-sm">{theme.name}</p>
                <p className="text-xs text-gray-500 mt-1 capitalize">{theme.layout} layout</p>
                
                {selectedTheme === theme.id && isPremium && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-babyblue-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={saveTheme}
          disabled={saving}
          className="w-full bg-babyblue-500 hover:bg-babyblue-600 disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-babyblue-500/25"
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
