'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Tv, Home, Search, User, Mail, Play } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Types
interface ExploreVideo {
  id: string
  youtube_url: string
  title: string
  description: string | null
  thumbnail_url: string
  sort_order: number
  is_active: boolean
  created_at: string
}

// Mock data for local testing
const MOCK_VIDEOS: ExploreVideo[] = [
  {
    id: '1',
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Amazing Baseball Highlights 2025',
    description: 'Watch the best plays from this season',
    thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    youtube_url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    title: 'Gangnam Style - Fun Game Day',
    description: 'Pre-game energy and hype',
    thumbnail_url: 'https://img.youtube.com/vi/9bZkp7q19f0/mqdefault.jpg',
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    youtube_url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    title: 'Me at the Zoo - First Vlog',
    description: 'Behind the scenes at the stadium',
    thumbnail_url: 'https://img.youtube.com/vi/jNQXAC9IVRw/mqdefault.jpg',
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    youtube_url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
    title: '4K Nature - Beautiful Fields',
    description: 'Where baseball dreams are made',
    thumbnail_url: 'https://img.youtube.com/vi/LXb3EKWsInQ/mqdefault.jpg',
    sort_order: 4,
    is_active: true,
    created_at: new Date().toISOString()
  }
]

// Helper to extract YouTube video ID and build thumbnail URL
function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|live\/)|youtu\.be\/)([^&\s?]+)/)
  return match ? match[1] : null
}

function getThumbnailUrl(url: string, dbThumbnail?: string | null): string {
  // Use DB thumbnail if available
  if (dbThumbnail) return dbThumbnail
  
  // Otherwise generate from URL
  const id = getYouTubeId(url)
  if (id) {
    return `https://img.youtube.com/vi/${id}/mqdefault.jpg`
  }
  // Fallback placeholder
  return 'https://via.placeholder.com/320x180?text=No+Thumbnail'
}

export default function TVPage() {
  const [activeTab, setActiveTab] = useState<'explore' | 'contact'>('explore')
  const [videos, setVideos] = useState<ExploreVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

  // Fetch videos from Supabase
  useEffect(() => {
    async function fetchVideos() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('explore_videos')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
        
        if (error) {
          console.error('Error fetching videos:', error)
          return
        }
        
        setVideos(data || [])
      } catch (err) {
        console.error('Failed to fetch videos:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchVideos()
  }, [])

  const handleContactSupport = () => {
    const subject = encodeURIComponent('Live Stream UREPP TV')
    const body = encodeURIComponent('I would like to live stream my games. I want to learn more. Please sign me up.')
    window.location.href = `mailto:alex@urepp.tv?subject=${subject}&body=${body}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-babyblue-100 sticky top-0 z-50">
        <div className="max-w-md md:max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <h1 className="text-xl font-bold text-gray-900">UREPP TV</h1>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-md md:max-w-3xl mx-auto px-4 pt-4">
        <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'explore'
                ? 'bg-white text-[#51b5ff] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'contact'
                ? 'bg-white text-[#51b5ff] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Contact
          </button>
        </div>
      </div>

      <main className="max-w-md md:max-w-3xl mx-auto px-4 py-8">
        {activeTab === 'explore' ? (
          /* Explore Tab - YouTube Videos Grid */
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-[#51b5ff]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-10 h-10 text-[#51b5ff]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Featured Videos
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Watch the best sports content
              </p>
            </div>

            {/* Videos List - Full Width */}
            {!loading && videos.length > 0 && (
            <div className="space-y-5">
              {videos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => setSelectedVideo(video.youtube_url)}
                  className="group w-full text-left bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#51b5ff]/30 transition-all active:scale-[0.98]"
                >
                  {/* Thumbnail Container - Full Width */}
                  <div className="relative aspect-video bg-gray-900 overflow-hidden">
                    <Image
                      src={getThumbnailUrl(video.youtube_url, video.thumbnail_url)}
                      alt={video.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="100vw"
                      priority
                      unoptimized
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/95 group-hover:bg-white group-hover:scale-110 flex items-center justify-center shadow-xl transition-all duration-300">
                        <Play className="w-7 h-7 text-[#51b5ff] ml-1" fill="#51b5ff" />
                      </div>
                    </div>
                    
                    {/* Duration Badge (placeholder) */}
                    <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs font-medium px-2 py-1 rounded">
                      Watch
                    </div>
                  </div>
                  
                  {/* Info Section */}
                  <div className="p-4">
                    <h3 className="font-bold text-base text-gray-900 line-clamp-2 leading-snug">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        YouTube
                      </span>
                      <span>•</span>
                      <span>Click to play</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Play className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">Loading videos...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && videos.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">No videos available yet</p>
                <p className="text-sm text-gray-400">Check back soon for featured content!</p>
              </div>
            )}
          </div>
        ) : (
          /* Contact Tab */
          <>
            {/* TV Icon */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-[#51b5ff]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Tv className="w-12 h-12 text-[#51b5ff]" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Live Stream Your Games!
              </h2>
              <p className="text-gray-600 text-center">
                Learn how you can live stream your games with UREPP TV.
              </p>
            </div>

            {/* CTA Card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 p-6">
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Ready to get started?
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Contact our team and we'll help you set up live streaming for your games.
                </p>
                
                <button
                  onClick={handleContactSupport}
                  className="w-full bg-[#51b5ff] hover:bg-[#3da8f0] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-babyblue-200"
                >
                  <Mail className="w-5 h-5" />
                  Contact Support
                </button>
              </div>
            </div>

            {/* Features Preview */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-white/50 rounded-xl p-4 border border-babyblue-100">
                <div className="text-2xl mb-2">📺</div>
                <h4 className="font-medium text-gray-900 text-sm">HD Streaming</h4>
                <p className="text-xs text-gray-500 mt-1">Crystal clear video quality</p>
              </div>
              <div className="bg-white/50 rounded-xl p-4 border border-babyblue-100">
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="font-medium text-gray-900 text-sm">Real-time</h4>
                <p className="text-xs text-gray-500 mt-1">Low latency broadcast</p>
              </div>
              <div className="bg-white/50 rounded-xl p-4 border border-babyblue-100">
                <div className="text-2xl mb-2">🏆</div>
                <h4 className="font-medium text-gray-900 text-sm">Tournament Ready</h4>
                <p className="text-xs text-gray-500 mt-1">Multi-game coverage</p>
              </div>
              <div className="bg-white/50 rounded-xl p-4 border border-babyblue-100">
                <div className="text-2xl mb-2">📱</div>
                <h4 className="font-medium text-gray-900 text-sm">Any Device</h4>
                <p className="text-xs text-gray-500 mt-1">Watch on phone, tablet, TV</p>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeId(selectedVideo)}?autoplay=1`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          
          {/* Close button */}
          <button
            onClick={() => setSelectedVideo(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-babyblue-100 px-4 py-2 z-50">
        <div className="max-w-md md:max-w-3xl mx-auto flex justify-around">
          <BottomNavLink href="/dashboard/coaches" icon={<Home className="w-6 h-6" />} label="Home" />
          <BottomNavLink href="/tv" icon={<Tv className="w-6 h-6" />} label="TV" active />
          <BottomNavLink href="/search" icon={<Search className="w-6 h-6" />} label="Search" />
          <BottomNavLink href="/dashboard" icon={<User className="w-6 h-6" />} label="Profile" />
        </div>
      </nav>
    </div>
  )
}

// Component: Bottom Navigation Link
function BottomNavLink({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link href={href} className={`flex flex-col items-center gap-0.5 py-2 px-6 ${active ? 'text-babyblue-600' : 'text-gray-400 hover:text-gray-600'}`}>
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </Link>
  )
}
