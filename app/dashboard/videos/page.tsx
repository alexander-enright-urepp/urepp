'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Video, 
  Trash2, 
  Plus,
  Loader2,
  Youtube,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  X,
  GripVertical,
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
  const [profile, setProfile] = useState<any>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  
  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  // Auto-save order when videos change
  useEffect(() => {
    if (videos.length > 0 && profile) {
      const timeoutId = setTimeout(() => {
        autoSaveOrder()
      }, 1000) // Auto-save 1 second after drag ends
      
      return () => clearTimeout(timeoutId)
    }
  }, [videos, profile])

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
      
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('profile_id', profileData.id)
        .order('display_order', { ascending: true })
      
      if (videosError) {
        const { data: fallbackData } = await supabase
          .from('videos')
          .select('*')
          .eq('profile_id', profileData.id)
          .order('created_at', { ascending: false })
        setVideos(fallbackData || [])
      } else {
        setVideos(videosData || [])
      }
    }
    
    setLoading(false)
  }

  const autoSaveOrder = useCallback(async () => {
    if (!profile || videos.length === 0) return
    
    setSaving(true)
    
    // Update each video's display_order
    for (let i = 0; i < videos.length; i++) {
      await supabase
        .from('videos')
        .update({ display_order: i })
        .eq('id', videos[i].id)
    }
    
    setSaving(false)
  }, [videos, profile])

  const validateYouTubeUrl = (url: string): boolean => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
    ]
    return patterns.some(pattern => pattern.test(url))
  }

  const handleUrlChange = (value: string) => {
    setUrl(value)
    if (value && !validateYouTubeUrl(value)) {
      setUrlError('Invalid YouTube URL')
    } else {
      setUrlError('')
    }
  }

  const handleSaveVideo = async () => {
    if (!profile) return
    
    if (!title.trim() || !url.trim()) return
    if (!validateYouTubeUrl(url)) {
      setUrlError('Invalid YouTube URL')
      return
    }

    setSaving(true)
    const maxOrder = videos.length > 0 ? Math.max(...videos.map(v => v.display_order || 0)) : 0

    const videoData = {
      profile_id: profile.id,
      title: title.trim(),
      description: description.trim(),
      url: url.trim(),
      display_order: maxOrder + 1,
    }

    if (editingVideo) {
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
    if (!confirm('Delete this video?')) return
    
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', videoId)
    
    if (!error) {
      setVideos(videos.filter(v => v.id !== videoId))
    }
  }

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedItem(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedItem === null || draggedItem === index) return
    
    const newVideos = [...videos]
    const draggedVideo = newVideos[draggedItem]
    newVideos.splice(draggedItem, 1)
    newVideos.splice(index, 0, draggedVideo)
    
    const updatedVideos = newVideos.map((video, idx) => ({
      ...video,
      display_order: idx
    }))
    
    setVideos(updatedVideos)
    setDraggedItem(index)
  }

  const moveVideoUp = (index: number) => {
    if (index === 0) return
    const newVideos = [...videos]
    const temp = newVideos[index]
    newVideos[index] = newVideos[index - 1]
    newVideos[index - 1] = temp
    setVideos(newVideos.map((v, i) => ({ ...v, display_order: i })))
  }

  const moveVideoDown = (index: number) => {
    if (index === videos.length - 1) return
    const newVideos = [...videos]
    const temp = newVideos[index]
    newVideos[index] = newVideos[index + 1]
    newVideos[index + 1] = temp
    setVideos(newVideos.map((v, i) => ({ ...v, display_order: i })))
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
            <div className="flex items-center gap-2">
              {saving && (
                <div className="flex items-center gap-1 text-sm text-babyblue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              )}
              <button
                onClick={openAddModal}
                className="w-10 h-10 rounded-xl bg-babyblue-500 hover:bg-babyblue-600 text-white flex items-center justify-center transition-colors shadow-md"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {videos.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-babyblue-100">
            <div className="w-20 h-20 bg-babyblue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-10 h-10 text-babyblue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">No Videos Yet</h2>
            <p className="text-sm text-gray-600 mb-4">Add your highlight reels to showcase your talent.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {videos.map((video, index) => (
              <div 
                key={video.id}
                draggable={videos.length > 1}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`bg-white rounded-2xl overflow-hidden border border-babyblue-100 shadow-sm transition-all ${
                  videos.length > 1 ? 'cursor-move' : ''
                } ${draggedItem === index ? 'opacity-50' : ''}`}
              >
                <div className="flex">
                  {/* Drag Handle - Six Dots */}
                  {videos.length > 1 && (
                    <div className="flex flex-col justify-center px-3 border-r border-babyblue-100 bg-gray-50/50">
                      <GripVertical className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  
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
                          {video.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{video.description}</p>}
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
            <div className="sticky top-0 bg-white border-b border-babyblue-100 px-4 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editingVideo ? 'Edit Video' : 'Add Video'}
              </h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">YouTube URL</label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none"
                  />
                </div>
                {urlError && <div className="flex items-center gap-2 mt-2 text-sm text-red-600"><AlertCircle className="w-4 h-4" />{urlError}</div>}
                {url && !urlError && validateYouTubeUrl(url) && <div className="flex items-center gap-2 mt-2 text-sm text-green-600"><CheckCircle className="w-4 h-4" />Valid URL</div>}
              </div>

              {url && validateYouTubeUrl(url) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Preview</label>
                  <div className="bg-gray-100 rounded-xl overflow-hidden">
                    <YouTubeThumbnail url={url} title="Preview" size="large" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Video title"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none resize-none"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-babyblue-100 p-4 space-y-3">
              <button
                onClick={handleSaveVideo}
                disabled={saving || !title.trim() || !url.trim() || !!urlError}
                className="w-full bg-babyblue-500 hover:bg-babyblue-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" />{editingVideo ? 'Save' : 'Add'}</>}
              </button>
              <button onClick={closeModal} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
