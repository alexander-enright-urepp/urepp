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
  Eye,
  BarChart3,
  FileText,
  Play,
  Trophy
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PREMIUM_THEMES, FREE_THEME, getThemeClasses, type ThemeConfig } from '@/lib/themes'

// Combine free and premium themes
const ALL_THEMES = [FREE_THEME, ...PREMIUM_THEMES]

// Sample profile data for preview
const SAMPLE_PROFILE = {
  first_name: 'Alex',
  last_name: 'Johnson',
  username: 'alexjohnson2026',
  bio: 'Student-athlete | Baseball | Class of 2026',
  profile_picture_url: null,
  grad_year: 2026,
  high_school: 'West High School',
  state: 'CA',
  position: 'RHP/SS',
  high_school_sports: ['Baseball'],
  is_premium: true,
  stats_json: {
    batting_avg: '.325',
    era: '2.45'
  }
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
  const themeClasses = getThemeClasses(currentTheme)

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

        {/* Live Preview */}
        <div className="bg-white rounded-2xl p-4 border border-babyblue-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-babyblue-500" />
              Live Preview
            </h2>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {currentTheme.name}
            </span>
          </div>
          
          {/* Theme Preview Card */}
          <ThemePreview theme={currentTheme} />
        </div>

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

// Theme Preview Component
function ThemePreview({ theme }: { theme: ThemeConfig }) {
  const getHeaderStyle = () => {
    switch (theme.headerStyle) {
      case 'gradient':
        return theme.backgroundGradient || 'bg-gradient-to-br from-blue-500 to-purple-600'
      case 'dark':
        return 'bg-[#0B0B0F]'
      case 'glass':
        return 'bg-white/10 backdrop-blur-md'
      default:
        return 'bg-babyblue-500'
    }
  }

  const getAvatarPosition = () => {
    switch (theme.avatarPosition) {
      case 'left':
        return 'flex-row items-center gap-4 text-left'
      case 'floating':
        return 'relative'
      default:
        return 'flex-col items-center text-center'
    }
  }

  const getNameStyle = () => {
    const sizeMap: Record<string, string> = {
      'small': 'text-lg',
      'medium': 'text-xl',
      'large': 'text-2xl',
      'xl': 'text-3xl',
    }
    const weightMap: Record<string, string> = {
      'normal': 'font-normal',
      'medium': 'font-medium',
      'bold': 'font-bold',
      'black': 'font-black',
    }
    return `${sizeMap[theme.nameSize]} ${weightMap[theme.nameWeight]}`
  }

  const getCardStyle = () => {
    switch (theme.cardStyle) {
      case 'glass':
        return 'bg-white/10 backdrop-blur-md border border-white/20'
      case 'outline':
        return 'bg-white border border-gray-200'
      case 'flat':
        return 'bg-gray-50'
      default:
        return 'bg-white rounded-xl shadow-sm border border-babyblue-100'
    }
  }

  // Render different layouts
  if (theme.layout === 'horizontal-card') {
    return (
      <div className={`${getHeaderStyle()} rounded-xl p-4 ${theme.headerStyle === 'dark' ? 'text-white' : 'text-white'}`}>
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
            <span className="text-2xl font-bold">A</span>
          </div>
          <div className="flex-1">
            <h3 className={`${getNameStyle()} text-white`}>Alex Johnson</h3>
            <p className="text-white/80 text-sm">@{SAMPLE_PROFILE.username}</p>
            <p className="text-white/70 text-xs mt-1">{SAMPLE_PROFILE.position}</p>
          </div>
          <div className="flex gap-1">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
        </div>
        <div className="flex gap-1 mt-4 border-t border-white/20 pt-3">
          <button className="flex-1 py-2 text-sm font-medium bg-white/20 rounded-lg">Resume</button>
          <button className="flex-1 py-2 text-sm font-medium text-white/70">Media</button>
          <button className="flex-1 py-2 text-sm font-medium text-white/70">Stats</button>
        </div>
      </div>
    )
  }

  if (theme.layout === 'minimal') {
    return (
      <div className="bg-white rounded-xl p-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-babyblue-100 flex items-center justify-center">
            <span className="text-lg font-bold text-babyblue-600">A</span>
          </div>
          <div>
            <h3 className={`${getNameStyle()} text-gray-900`}>Alex Johnson</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{SAMPLE_PROFILE.position}</span>
              <span>•</span>
              <span>.325 AVG</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          {['IG', 'TW', 'YT'].map((social) => (
            <div key={social} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
              {social}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (theme.layout === 'banner') {
    return (
      <div>
        <div className={`${getHeaderStyle()} h-24 rounded-t-xl relative`}>
          {theme.avatarPosition === 'overlapping' && (
            <div className="absolute -bottom-8 left-4 w-20 h-20 rounded-full bg-white border-4 border-white flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-gray-900">A</span>
            </div>
          )}
        </div>
        <div className="bg-white rounded-b-xl p-4 pt-10">
          <h3 className={`${getNameStyle()} text-gray-900`}>Alex Johnson</h3>
          <p className="text-gray-500 text-sm">{SAMPLE_PROFILE.position} • {SAMPLE_PROFILE.high_school}</p>
          {theme.statsPosition === 'chips' && (
            <div className="flex gap-2 mt-3">
              <span className="bg-babyblue-100 text-babyblue-700 px-3 py-1 rounded-full text-sm font-medium">.325 AVG</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">2.45 ERA</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Default centered layout
  return (
    <div className={`${theme.background === 'dark' ? 'bg-[#0B0B0F] text-white' : 'bg-white'} rounded-xl p-5 ${getCardStyle()}`}>
      <div className={`flex ${getAvatarPosition()}`}>
        <div className={`${theme.avatarSize === 'xl' ? 'w-24 h-24' : 'w-20 h-20'} rounded-full bg-babyblue-100 flex items-center justify-center border-4 border-white shadow-lg mb-4`}>
          <span className={`${theme.avatarSize === 'xl' ? 'text-3xl' : 'text-2xl'} font-bold text-babyblue-600`}>A</span>
        </div>
        <div className={theme.avatarPosition === 'left' ? '' : 'text-center'}>
          <h3 className={`${getNameStyle()} ${theme.background === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Alex Johnson
          </h3>
          <p className={`text-sm ${theme.background === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            @{SAMPLE_PROFILE.username}
          </p>
          {theme.statsPosition === 'inline' && (
            <div className="flex gap-3 mt-2">
              <span className="text-xs bg-babyblue-100 text-babyblue-700 px-2 py-1 rounded-full">.325 AVG</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">2.45 ERA</span>
            </div>
          )}
        </div>
      </div>
      
      {theme.statsPosition !== 'inline' && theme.statsPosition !== 'chips' && (
        <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className={`font-bold ${theme.background === 'dark' ? 'text-white' : 'text-gray-900'}`}>.325</p>
            <p className={`text-xs ${theme.background === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>AVG</p>
          </div>
          <div className="text-center">
            <p className={`font-bold ${theme.background === 'dark' ? 'text-white' : 'text-gray-900'}`}>2.45</p>
            <p className={`text-xs ${theme.background === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>ERA</p>
          </div>
        </div>
      )}

      <div className={`flex ${theme.socialPosition === 'right' ? 'justify-end' : 'justify-center'} gap-2 mt-4`}>
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              theme.iconStyle === 'floating' 
                ? 'bg-white/20 backdrop-blur-sm' 
                : theme.background === 'dark'
                ? 'bg-white/20'
                : 'bg-babyblue-50'
            }`}
          >
            <Trophy className={`w-5 h-5 ${theme.background === 'dark' ? 'text-white' : 'text-babyblue-600'}`} />
          </div>
        ))}
      </div>
    </div>
  )
}
