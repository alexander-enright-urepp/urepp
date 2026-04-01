'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Plus,
  GripVertical,
  Eye,
  Pencil,
  Trash2,
  X,
  Home,
  Search,
  User,
  Tv
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface LinkItem {
  id: string
  profile_id: string
  title: string
  subtitle?: string
  url: string
  icon?: string
}

export default function LinksPage() {
  const router = useRouter()
  const [profileId, setProfileId] = useState<string | null>(null)
  const [links, setLinks] = useState<LinkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    url: '',
    icon: '👍'
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      router.push('/login')
      return
    }

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (profile) {
      setProfileId(profile.id)
      // Load links from profile_links table
      const { data: linksData } = await supabase
        .from('profile_links')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: true })
      
      if (linksData) {
        setLinks(linksData)
      }
    }
    setLoading(false)
  }

  const addLink = async () => {
    if (!formData.title || !formData.url || !profileId) return
    
    const { data, error } = await supabase
      .from('profile_links')
      .insert({
        profile_id: profileId,
        title: formData.title,
        subtitle: formData.subtitle || null,
        url: formData.url,
        icon: formData.icon || '👍'
      })
      .select()
      .single()
    
    if (data && !error) {
      setLinks([...links, data])
    }
    
    // Reset form
    setFormData({ title: '', subtitle: '', url: '', icon: '👍' })
    setShowAddModal(false)
  }

  const updateLink = async () => {
    if (!editingLink) return
    
    const { error } = await supabase
      .from('profile_links')
      .update({
        title: formData.title,
        subtitle: formData.subtitle || null,
        url: formData.url,
        icon: formData.icon
      })
      .eq('id', editingLink.id)
    
    if (!error) {
      const updatedLinks = links.map(link => 
        link.id === editingLink.id 
          ? { ...link, ...formData }
          : link
      )
      setLinks(updatedLinks)
    }
    
    setEditingLink(null)
    setFormData({ title: '', subtitle: '', url: '', icon: '👍' })
    setShowAddModal(false)
  }

  const deleteLink = async (id: string) => {
    const { error } = await supabase
      .from('profile_links')
      .delete()
      .eq('id', id)
    
    if (!error) {
      setLinks(links.filter(link => link.id !== id))
    }
  }

  const openEditModal = (link: LinkItem) => {
    setEditingLink(link)
    setFormData({
      title: link.title,
      subtitle: link.subtitle || '',
      url: link.url,
      icon: link.icon || '👍'
    })
    setShowAddModal(true)
  }

  const openAddModal = () => {
    setEditingLink(null)
    setFormData({ title: '', subtitle: '', url: '', icon: '👍' })
    setShowAddModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-babyblue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link 
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <h1 className="text-lg font-bold text-gray-900">Your Links</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-green-600 text-sm font-medium">Unlimited links</span>
              <button 
                onClick={openAddModal}
                className="w-10 h-10 bg-babyblue-500 hover:bg-babyblue-600 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-3">
        {/* Add Link Button (Dashed) */}
        <button 
          onClick={openAddModal}
          className="w-full py-6 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center gap-2 text-gray-500 hover:border-babyblue-400 hover:text-babyblue-500 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Link</span>
        </button>

        {/* Links List */}
        <div className="space-y-3">
          {links.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No links yet. Add your first link!</p>
          ) : (
            links.map((link) => (
              <div 
                key={link.id} 
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
              >
                {/* Drag Handle */}
                <div className="text-gray-300 cursor-grab">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-gray-50">
                  {link.icon || '👍'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{link.title}</h3>
                  {link.subtitle && (
                    <p className="text-sm text-gray-500 truncate">{link.subtitle}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => window.open(link.url, '_blank')}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => openEditModal(link)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => deleteLink(link.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6 space-y-4 max-h-[80vh] overflow-y-auto pb-20" style={{ WebkitOverflowScrolling: 'touch' }}>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingLink ? 'Edit Link' : 'Add Link'}
              </h2>
              <button 
                onClick={() => {
                  setShowAddModal(false)
                  setEditingLink(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="My Website"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-500 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                placeholder="Optional description"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-500 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
              />
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                placeholder="https://example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-500 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
              />
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({...formData, icon: e.target.value})}
                placeholder="👍"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-500 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all text-center text-xl"
              />
              <p className="text-xs text-gray-500 mt-1">Icon name or emoji</p>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingLink(null)
                }}
                className="py-3 px-6 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingLink ? updateLink : addLink}
                disabled={!formData.title || !formData.url}
                className="py-3 px-6 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {editingLink ? 'Save Changes' : 'Add Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
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
