'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Instagram, Twitter, Youtube, Globe, Save, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  instagram?: string
  twitter?: string
  youtube?: string
  website?: string
}

export default function LinksPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [links, setLinks] = useState({ instagram: '', twitter: '', youtube: '', website: '' })

  useEffect(() => { loadProfile() }, [])

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { router.push('/login'); return }
    const { data } = await supabase.from('profiles').select('id, instagram, twitter, youtube, website').eq('user_id', session.user.id).single()
    if (data) { setProfile(data); setLinks({ instagram: data.instagram || '', twitter: data.twitter || '', youtube: data.youtube || '', website: data.website || '' }) }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    await supabase.from('profiles').update({ instagram: links.instagram || null, twitter: links.twitter || null, youtube: links.youtube || null, website: links.website || null, updated_at: new Date().toISOString() }).eq('id', profile.id)
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 pb-20">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-babyblue-50 flex items-center justify-center"><ArrowLeft className="w-5 h-5" /></Link>
            <div><h1 className="text-xl font-bold">Links</h1><p className="text-sm text-gray-500">Social media links</p></div>
          </div>
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="space-y-4">
            <div><label className="flex items-center gap-2 text-sm font-medium mb-2"><Instagram className="w-4 h-4 text-pink-500" />Instagram</label><input type="text" value={links.instagram} onChange={(e) => setLinks({...links, instagram: e.target.value})} placeholder="@username" className="w-full px-4 py-3 rounded-xl border" /></div>
            <div><label className="flex items-center gap-2 text-sm font-medium mb-2"><Twitter className="w-4 h-4 text-blue-400" />Twitter</label><input type="text" value={links.twitter} onChange={(e) => setLinks({...links, twitter: e.target.value})} placeholder="@username" className="w-full px-4 py-3 rounded-xl border" /></div>
            <div><label className="flex items-center gap-2 text-sm font-medium mb-2"><Youtube className="w-4 h-4 text-red-500" />YouTube</label><input type="text" value={links.youtube} onChange={(e) => setLinks({...links, youtube: e.target.value})} placeholder="youtube.com/..." className="w-full px-4 py-3 rounded-xl border" /></div>
            <div><label className="flex items-center gap-2 text-sm font-medium mb-2"><Globe className="w-4 h-4 text-gray-500" />Website</label><input type="text" value={links.website} onChange={(e) => setLinks({...links, website: e.target.value})} placeholder="https://..." className="w-full px-4 py-3 rounded-xl border" /></div>
          </div>
          <button onClick={handleSave} disabled={saving} className="w-full mt-6 bg-babyblue-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2">{saving ? <><Loader2 className="w-5 h-5 animate-spin" />Saving...</> : <><Save className="w-5 h-5" />Save Changes</>}</button>
        </div>
      </main>
    </div>
  )
}
