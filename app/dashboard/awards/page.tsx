'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Loader2, 
  Trophy,
  Award,
  Star,
  Medal,
  Crown,
  Home,
  Search,
  User,
  Plus,
  X,
  Trash2,
  Save
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AwardsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [awards, setAwards] = useState<string[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newAward, setNewAward] = useState('')

  useEffect(() => {
    loadAwards()
  }, [])

  const loadAwards = async () => {
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
      if (profileData.awards) {
        setAwards(profileData.awards.split('\n').filter(a => a.trim()))
      }
    }
    
    setLoading(false)
  }

  const handleAddAward = async () => {
    if (!newAward.trim() || !profile) return
    
    setSaving(true)
    
    const updatedAwards = [...awards, newAward.trim()]
    const awardsText = updatedAwards.join('\n')
    
    const { error } = await supabase
      .from('profiles')
      .update({ awards: awardsText })
      .eq('id', profile.id)
    
    if (!error) {
      setAwards(updatedAwards)
      setNewAward('')
      setShowAddModal(false)
    }
    
    setSaving(false)
  }

  const handleDeleteAward = async (index: number) => {
    if (!profile) return
    
    const updatedAwards = awards.filter((_, i) => i !== index)
    const awardsText = updatedAwards.join('\n')
    
    const { error } = await supabase
      .from('profiles')
      .update({ awards: awardsText })
      .eq('id', profile.id)
    
    if (!error) {
      setAwards(updatedAwards)
    }
  }

  const getAwardIcon = (index: number) => {
    const icons = [Crown, Trophy, Medal, Award, Star]
    const Icon = icons[index % icons.length]
    return Icon
  }

  const getAwardColor = (index: number) => {
    const colors = [
      'bg-yellow-100 text-yellow-700 border-yellow-200',
      'bg-babyblue-100 text-babyblue-700 border-babyblue-200',
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-green-100 text-green-700 border-green-200',
      'bg-orange-100 text-orange-700 border-orange-200'
    ]
    return colors[index % colors.length]
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
                <h1 className="text-xl font-bold text-gray-900">My Awards</h1>
                <p className="text-sm text-gray-500">{awards.length} achievement{awards.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="w-10 h-10 rounded-xl bg-babyblue-500 hover:bg-babyblue-600 text-white flex items-center justify-center transition-colors shadow-md shadow-babyblue-200"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {awards.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-babyblue-100">
            <div className="w-20 h-20 bg-babyblue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-babyblue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">No Awards Yet</h2>
            <p className="text-sm text-gray-600 mb-4">
              Add your awards and achievements to showcase your accomplishments.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-babyblue-500 hover:bg-babyblue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Award
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {awards.map((award, index) => {
              const Icon = getAwardIcon(index)
              const colorClass = getAwardColor(index)
              
              return (
                <div
                  key={index}
                  className={`bg-white rounded-2xl p-4 border shadow-sm flex items-start gap-4 ${colorClass.split(' ')[2]}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass.split(' ').slice(0, 2).join(' ')}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 break-words">{award.trim()}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAward(index)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Add Award Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-babyblue-100">
              <h2 className="text-lg font-bold text-gray-900">Add Award</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Award or Achievement
              </label>
              <textarea
                value={newAward}
                onChange={(e) => setNewAward(e.target.value)}
                placeholder="e.g., First-team All-Conference (2024)"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all resize-none"
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-2">
                Examples: Team MVP, All-State Selection, Academic Honor Roll
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-babyblue-100 space-y-3">
              <button
                onClick={handleAddAward}
                disabled={saving || !newAward.trim()}
                className="w-full bg-babyblue-500 hover:bg-babyblue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Add Award
                  </>
                )}
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
