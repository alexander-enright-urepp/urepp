'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Loader2, 
  LayoutTemplate,
  Palette,
  Check,
  Home,
  Search,
  User
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const THEMES = [
  { id: 'default', name: 'Baby Blue', color: '#0ea5e9', bg: 'from-babyblue-50 via-white to-babyblue-100' },
  { id: 'purple', name: 'Royal Purple', color: '#7c3aed', bg: 'from-purple-50 via-white to-purple-100' },
  { id: 'green', name: 'Forest Green', color: '#059669', bg: 'from-green-50 via-white to-green-100' },
  { id: 'orange', name: 'Sunset Orange', color: '#ea580c', bg: 'from-orange-50 via-white to-orange-100' },
  { id: 'pink', name: 'Rose Pink', color: '#db2777', bg: 'from-pink-50 via-white to-pink-100' },
  { id: 'dark', name: 'Midnight Dark', color: '#1f2937', bg: 'from-gray-800 to-gray-900', dark: true },
]

export default function ThemesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [selectedTheme, setSelectedTheme] = useState('default')

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
    }
    
    setLoading(false)
  }

  const handleThemeSelect = async (themeId: string) => {
    setSelectedTheme(themeId)
    // TODO: Save to database when theme column exists
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
                <p className="text-sm text-gray-500">Customize your profile</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {/* Theme Grid */}
        <div className="grid grid-cols-2 gap-3">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeSelect(theme.id)}
              className={`bg-white rounded-2xl p-4 border-2 transition-all ${
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
                className={`mt-2 h-8 rounded-lg bg-gradient-to-br ${theme.bg}`}
              />
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="mt-6 bg-white rounded-2xl p-6 border border-babyblue-100">
          <h2 className="font-semibold text-gray-900 mb-4">Preview</h2>
          <div className="bg-gray-100 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500">Theme preview coming soon</p>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-babyblue-100 px-4 py-2 z-50">
        <div className="max-w-md mx-auto flex justify-around">
          <Link href="/" className="flex flex-col items-center gap-0.5 py-2 px-6 text-gray-400 hover:text-gray-600">
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
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
