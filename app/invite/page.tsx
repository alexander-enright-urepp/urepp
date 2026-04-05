'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, 
  UserPlus, 
  Share2, 
  Copy, 
  Check, 
  Loader2,
  Mail,
  Link as LinkIcon,
  Home,
  Search,
  User,
  Tv
} from 'lucide-react'

interface Profile {
  id: string
  first_name: string
  last_name: string
  username: string
  referral_code?: string
}

export default function InvitePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user) {
          router.push('/login')
          return
        }
        
        setUser(session.user)
        
        // Get profile with all fields
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
        
        if (profileData) {
          setProfile(profileData)
        }
      } catch (err) {
        console.error('Error loading profile:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [router])

  const getInviteLink = () => {
    return 'https://www.urepp.app';
  }

  const handleCopy = async () => {
    const link = getInviteLink()
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = link
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    const link = getInviteLink()
    const shareData = {
      title: 'Join UREPP',
      text: `${profile?.first_name || 'I'} invited you to join UREPP - the athlete recruiting platform!`,
      url: link
    }
    
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // User cancelled or error
      }
    } else {
      handleCopy()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-babyblue-500"></div>
      </div>
    )
  }

  const inviteLink = getInviteLink()

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-babyblue-100 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard" 
              className="w-10 h-10 rounded-xl bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Invite Friends</h1>
              <p className="text-sm text-gray-500">Grow the UREPP community</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <div className="bg-gradient-to-br from-babyblue-500 to-babyblue-600 rounded-2xl p-6 text-white shadow-xl shadow-babyblue-200/50 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">Invite Fellow Athletes</h2>
          <p className="text-babyblue-100 text-sm">
            Share UREPP with teammates, friends, and prospects. Help them get discovered by college coaches.
          </p>
        </div>

        {/* Share Link */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-babyblue-100">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-babyblue-500" />
            Your Invite Link
          </h3>
          
          <div className="bg-gray-50 rounded-xl p-3 mb-3 flex items-center gap-2">
            <input 
              type="text" 
              value={inviteLink}
              readOnly
              className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
            />
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg bg-babyblue-100 text-babyblue-600 hover:bg-babyblue-200 transition-colors"
              title="Copy link"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleCopy}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <Copy className="w-5 h-5 text-gray-600" />
              <span className="text-xs text-gray-600">Copy</span>
            </button>
            
            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <Share2 className="w-5 h-5 text-gray-600" />
              <span className="text-xs text-gray-600">Share</span>
            </button>
            
            <a
              href={`mailto:?subject=Join me on UREPP&body=Hey! I just joined UREPP - the athlete recruiting platform. Use my link to sign up: ${inviteLink}`}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <Mail className="w-5 h-5 text-gray-600" />
              <span className="text-xs text-gray-600">Email</span>
            </a>
          </div>

          {copied && (
            <div className="mt-3 text-center text-sm text-green-600 bg-green-50 py-2 rounded-lg">
              <Check className="w-4 h-4 inline mr-1" />
              Link copied to clipboard!
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-babyblue-100">
          <h3 className="font-semibold text-gray-900 mb-4">How it works</h3>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-babyblue-100 text-babyblue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
              <div>
                <p className="text-sm font-medium text-gray-900">Share your link</p>
                <p className="text-xs text-gray-500">Copy or share your unique invite link</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-babyblue-100 text-babyblue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
              <div>
                <p className="text-sm font-medium text-gray-900">They sign up</p>
                <p className="text-xs text-gray-500">Friends join using your referral code</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-babyblue-100 text-babyblue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
              <div>
                <p className="text-sm font-medium text-gray-900">Grow together</p>
                <p className="text-xs text-gray-500">Build your recruiting network</p>
              </div>
            </div>
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
