'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Upload, 
  Video, 
  Trash2, 
  Plus,
  Loader2,
  Youtube,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Play,
  X,
  GripVertical,
  Save,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { YouTubeThumbnail } from '@/components/YouTubeThumbnail'

interface Video {
  id: string
  title: string
  description: string
  url: string
  created_at: string
  display_order: number
}

export default function VideosPage() {
  const router = useRouter()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reordering, setReordering] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  
  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    // Get profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (profileData) {
      setProfile(profileData)
      
      // Get videos - ordered by display_order, then created_at
      const { data: videosData } = await supabase
        .from('videos')
        .select('*')
        .eq('profile_id', profileData.id)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
      
      setVideos(videosData || [])
    }
    
    setLoading(false)
  }

  const validateYouTubeUrl = (url: string): boolean => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
    ]
    return patterns.some(pattern => pattern.test(url))
  }

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  const handleUrlChange = (value: string) => {
    setUrl(value)
    if (value && !validateYouTubeUrl(value)) {
      setUrlError('Invalid YouTube URL')
    } else {
      setUrlError('')
    }
  }

  const handleSave = async () => {
    if (!profile) return
    
    if (!title.trim() || !url.trim()) {
      return
    }

    if (!validateYouTubeUrl(url)) {
      setUrlError('Invalid YouTube URL')
      return
    }

    setSaving(true)

    // Get the highest display_order
    const maxOrder = videos.length > 0 ? Math.max(...videos.map(v => v.display_order || 0)) : 0

    const videoData = {
      profile_id: profile.id,
      title: title.trim(),
      description: description.trim(),
      url: url.trim(),
      display_order: maxOrder + 1,
    }

    if (editingVideo) {
      // Update existing
      const { error } = await supabase
        .from('videos')
        .update({
          title: title.trim(),
          description: description.trim(),
          url: url.trim(),
        })
        .eq('id', editingVideo.id)
      
      if (!error) {
        setVideos(videos.map(v => v.id === editingVideo.id ? { ...v, title: title.trim(), description: description.trim(), url: url.trim() } : v))
      }
    } else {
      // Create new
      const { data, error } = await supabase
        .from('videos')
        .insert(videoData)
        .select()
        .single()
      
      if (data && !error) {
        setVideos([...videos, data])
      }
    }

    setSaving(false)
    closeModal()
  }

  const handleDelete = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return
    
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', videoId)
    
    if (!error) {
      setVideos(videos.filter(v => v.id !== videoId))
    }
  }

  const moveVideo = (index: number, direction: 'up' | 'down') => {
    const newVideos = [...videos]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex < 0 || targetIndex >= newVideos.length) return
    
    // Swap videos
    const temp = newVideos[index]
    newVideos[index] = newVideos[targetIndex]
    newVideos[targetIndex] = temp
    
    // Update display_order
    const updatedVideos = newVideos.map((video, idx) => ({
      ...video,
      display_order: idx
    }))
    
    setVideos(updatedVideos)
  }

  const saveOrder = async () => {
    if (!profile) return
    
    setReordering(true)
    
    // Update each video's display_order
    for (let i = 0; i < videos.length; i++) {
      await supabase
        .from('videos')
        .update({ display_order: i })
        .eq('id', videos[i].id)
    }
    
    setReordering(false)
  }

  const openAddModal = () => {
    setEditingVideo(null)
    setTitle('')
    setDescription('')
    setUrl('')
    setUrlError('')
    setShowAddModal(true)
  }

  const openEditModal = (video: Video) => {
    setEditingVideo(video)
    setTitle(video.title)
    setDescription(video.description)
    setUrl(video.url)
    setUrlError('')
    setShowAddModal(true)
  }

  const closeModal = () => {
    setShowAddModal(false)
    setEditingVideo(null)
    setTitle('')
    setDescription('')
    setUrl('')
    setUrlError('')
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
                <h1 className="text-xl font-bold text-gray-900">My Videos</h1>
                <p className="text-sm text-gray-500">{videos.length} video{videos.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {videos.length > 1 && (
                <button
                  onClick={saveOrder}
                  disabled={reordering}
                  className="w-10 h-10 rounded-xl bg-babyblue-100 hover:bg-babyblue-200 text-babyblue-600 flex items-center justify-center transition-colors"
                  title="Save Order"
                >
                  {reordering ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                </button>
              )}
              <button
                onClick={openAddModal}
                className="w-10 h-10 rounded-xl bg-babyblue-500 hover:bg-babyblue-600 text-white flex items-center justify-center transition-colors shadow-md shadow-babyblue-200"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {/* Reorder Hint */}
        {videos.length > 1 && (
          <div className="bg-babyblue-50 border border-babyblue-100 rounded-xl p-3 mb-4">
            <p className="text-sm text-babyblue-700 flex items-center gap-2">
              <GripVertical className="w-4 h-4" />
              Use arrows to reorder videos. Click save when done.
            </p>
          </div>
        )}

        {/* Empty State */}
        {videos.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-babyblue-100">
            <div className="w-20 h-20 bg-babyblue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-10 h-10 text-babyblue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">No Videos Yet</h2>
            <p className="text-sm text-gray-600 mb-4">
              Add your highlight reels and skills videos to showcase your talent to coaches.
            </p>
            <button
              onClick={openAddModal}
              className="bg-babyblue-500 hover:bg-babyblue-600 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 mx-auto transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Video
            </button>
          </div>
        )}

        {/* Video List */}
        {videos.length > 0 && (
          <div className="space-y-4">
            {videos.map((video, index) => (
              <div 
                key={video.id}
                className="bg-white rounded-2xl overflow-hidden border border-babyblue-100"
              >
                <div className="flex">
                  {/* Reorder Controls */}
                  {videos.length > 1 && (
                    <div className="flex flex-col border-r border-babyblue-100">
                      <button
                        onClick={() => moveVideo(index, 'up')}
                        disabled={index === 0}
                        className="flex-1 px-2 py-2 text-gray-400 hover:text-babyblue-600 hover:bg-babyblue-50 disabled:opacity-30 transition-colors"
                      >
                        <ChevronUp className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => moveVideo(index, 'down')}
                        disabled={index === videos.length - 1}
                        className="flex-1 px-2 py-2 text-gray-400 hover:text-babyblue-600 hover:bg-babyblue-50 disabled:opacity-30 transition-colors"
                      >
                        <ChevronDown className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                  
                  {/* Video Content */}
                  <div className="flex-1">
                    <YouTubeThumbnail 
                      url={video.url}
                      title={video.title}
                      onClick={() => window.open(video.url, '_blank')}
                    />
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{video.title}</h3>
                          {video.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{video.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditModal(video)}
                            className="p-2 text-gray-400 hover:text-babyblue-600 hover:bg-babyblue-50 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(video.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-babyblue-100 px-4 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editingVideo ? 'Edit Video' : 'Add Video'}
              </h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              {/* YouTube URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  YouTube URL
                </label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
                  />
                </div>
                
                {/* URL Validation */}
                {urlError && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    {urlError}
                  </div>
                )}
                
                {url && !urlError && validateYouTubeUrl(url) && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Valid YouTube URL
                  </div>
                )}
              </div>

              {/* Thumbnail Preview */}
              {url && validateYouTubeUrl(url) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Preview
                  </label>
                  <div className="bg-gray-100 rounded-xl overflow-hidden">
                    <YouTubeThumbnail 
                      url={url} 
                      title="Preview"
                      size="large"
                    />
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Summer Showcase Highlights"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this video..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-babyblue-100 p-4 space-y-3">
              <button
                onClick={handleSave}
                disabled={saving || !title.trim() || !url.trim() || !!urlError}
                className="w-full bg-babyblue-500 hover:bg-babyblue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {editingVideo ? 'Save Changes' : 'Add Video'}
                  </>
                )}
              </button>
              <button
                onClick={closeModal}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}