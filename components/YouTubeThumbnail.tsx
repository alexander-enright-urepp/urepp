'use client'

import { useState, useEffect } from 'react'
import { Play, AlertCircle } from 'lucide-react'

interface YouTubeThumbnailProps {
  url: string
  title?: string
  size?: 'small' | 'medium' | 'large'
  onClick?: () => void
  showPlayButton?: boolean
}

/**
 * Extract YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://youtube.com/embed/VIDEO_ID
 * - https://youtube.com/v/VIDEO_ID
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  return null
}

/**
 * Check if URL is a valid YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null
}

/**
 * Reusable YouTube Thumbnail Component
 * Automatically extracts video ID and displays thumbnail
 * Falls back from maxresdefault to hqdefault if needed
 */
export function YouTubeThumbnail({
  url,
  title = 'YouTube Video',
  size = 'medium',
  onClick,
  showPlayButton = true
}: YouTubeThumbnailProps) {
  const [videoId, setVideoId] = useState<string | null>(null)
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const id = extractYouTubeId(url)
    setVideoId(id)
    
    if (id) {
      // Try maxresdefault first, then fall back to hqdefault
      const maxResUrl = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
      const hqDefaultUrl = `https://img.youtube.com/vi/${id}/hqdefault.jpg`
      
      // Test if maxresdefault exists by creating an image element
      const img = new Image()
      img.onload = () => {
        // Check if the image is not the default "no thumbnail" image
        // YouTube returns a default 120x90 image when maxresdefault doesn't exist
        if (img.width > 120) {
          setThumbnailUrl(maxResUrl)
        } else {
          setThumbnailUrl(hqDefaultUrl)
        }
        setIsLoading(false)
      }
      img.onerror = () => {
        setThumbnailUrl(hqDefaultUrl)
        setIsLoading(false)
      }
      img.src = maxResUrl
    } else {
      setError(true)
      setIsLoading(false)
    }
  }, [url])

  const sizeClasses = {
    small: 'aspect-video',
    medium: 'aspect-video',
    large: 'aspect-video'
  }

  const handleClick = () => {
    if (onClick && videoId) {
      onClick()
    }
  }

  // Invalid URL state
  if (error || !videoId) {
    return (
      <div 
        className={`${sizeClasses[size]} bg-gray-100 flex flex-col items-center justify-center text-gray-400 rounded-xl`}
      >
        <AlertCircle className="w-8 h-8 mb-2" />
        <span className="text-sm">Invalid YouTube URL</span>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div 
        className={`${sizeClasses[size]} bg-gray-100 animate-pulse rounded-xl`}
      />
    )
  }

  return (
    <div 
      className={`${sizeClasses[size]} relative group cursor-pointer overflow-hidden rounded-xl bg-gray-900`}
      onClick={handleClick}
    >
      {/* Thumbnail Image */}
      <img
        src={thumbnailUrl || ''}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      
      {/* Dark Overlay on Hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
      
      {/* Play Button */}
      {showPlayButton && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 bg-babyblue-500/90 group-hover:bg-babyblue-500 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg"
          >
            <Play className="w-6 h-6 text-white ml-1" fill="white" />
          </div>
        </div>
      )}
      
      {/* Title Overlay (optional, shown on hover) */}
      {title && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <p className="text-white text-sm font-medium line-clamp-2">{title}</p>
        </div>
      )}
    </div>
  )
}

/**
 * Get YouTube embed URL for modal/player
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = extractYouTubeId(url)
  if (!videoId) return null
  return `https://www.youtube.com/embed/${videoId}?autoplay=1`
}

/**
 * Get YouTube watch URL
 */
export function getYouTubeWatchUrl(url: string): string | null {
  const videoId = extractYouTubeId(url)
  if (!videoId) return null
  return `https://www.youtube.com/watch?v=${videoId}`
}

export default YouTubeThumbnail
