'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Loader2, 
  Upload, 
  User, 
  Trophy, 
  GraduationCap, 
  BarChart3,
  Link as LinkIcon,
  Save,
  ChevronDown,
  Plus,
  Trash2,
  Instagram,
  Twitter,
  Youtube,
  Linkedin
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const YEARS = Array.from({length: 10}, (_, i) => (2025 + i).toString())
const POSITIONS = ['RHP', 'LHP', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'OF', 'UTL', 'DH']
const THROWS_BATS = ['R', 'L', 'S']
const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC']

interface ProfileData {
  id: string
  user_id: string
  first_name: string
  last_name: string
  username: string
  slug: string
  grad_year: number
  position: string
  height: string
  weight: string
  throws: string
  bats: string
  high_school: string
  hometown: string
  state: string
  gpa: string
  sat_score: string
  act_score: string
  bio: string
  awards: string
  avatar_url: string | null
  social_links: {
    instagram?: string
    twitter?: string
    youtube?: string
    linkedin?: string
  }
  stats_json: {
    batting_avg?: string
    obp?: string
    slg?: string
    era?: string
    whip?: string
    k_per_9?: string
    innings?: string
  }
}

export default function EditProfile() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState<Partial<ProfileData>>({})
  const [stats, setStats] = useState<ProfileData['stats_json']>({})
  const [socials, setSocials] = useState<ProfileData['social_links']>({})

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single()
    
    if (profileError || !profileData) {
      setError('Profile not found. Please create one first.')
      setLoading(false)
      return
    }
    
    setProfile(profileData)
    setFormData({
      first_name: profileData.first_name || '',
      last_name: profileData.last_name || '',
      username: profileData.username || '',
      slug: profileData.slug || '',
      grad_year: profileData.grad_year || 2026,
      position: profileData.position || '',
      height: profileData.height || '',
      weight: profileData.weight || '',
      throws: profileData.throws || 'R',
      bats: profileData.bats || 'R',
      high_school: profileData.high_school || '',
      hometown: profileData.hometown || '',
      state: profileData.state || '',
      gpa: profileData.gpa || '',
      sat_score: profileData.sat_score || '',
      act_score: profileData.act_score || '',
      bio: profileData.bio || '',
      awards: profileData.awards || '',
    })
    setStats(profileData.stats_json || {})
    setSocials(profileData.social_links || {})
    setImagePreview(profileData.avatar_url)
    setLoading(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    setUploadingImage(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${profile.user_id}-${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file)
    
    if (uploadError) {
      setError('Upload failed: ' + uploadError.message)
      setUploadingImage(false)
      return
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)
    
    setImagePreview(publicUrl)
    setUploadingImage(false)
  }

  const handleSave = async () => {
    if (!profile) return
    
    setSaving(true)
    setError('')
    setSuccess('')
    
    try {
      const updateData = {
        ...formData,
        avatar_url: imagePreview,
        stats_json: stats,
        social_links: socials,
      }
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id)
      
      if (updateError) {
        setError('Save failed: ' + updateError.message)
        setSaving(false)
        return
      }
      
      setSuccess('Profile saved! Preview it to see changes.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    }
    
    setSaving(false)
  }

  const updateForm = (field: keyof ProfileData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateStat = (key: string, value: string) => {
    setStats(prev => ({ ...prev, [key]: value }))
  }

  const updateSocial = (key: string, value: string) => {
    setSocials(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-babyblue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-babyblue-100 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link 
                href="/dashboard" 
                className="w-10 h-10 rounded-xl bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
                <p className="text-sm text-gray-500">{formData.first_name} {formData.last_name}</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-babyblue-500 hover:bg-babyblue-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-md shadow-babyblue-200"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Alerts */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xs font-bold">!</div>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs">✓</div>
            {success}
          </div>
        )}

        {/* Preview Link */}
        {formData.slug && (
          <div className="mb-6 bg-babyblue-50 border border-babyblue-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Public Profile</p>
                <p className="text-babyblue-600 text-sm">urepp.com/profile/{formData.slug}</p>
              </div>
              <Link
                href={`/profile/${formData.slug}`}
                target="_blank"
                className="text-sm text-babyblue-600 hover:text-babyblue-700 font-medium"
              >
                View →
              </Link>
            </div>
          </div>
        )}

        {/* Profile Picture */}
        <SectionCard title="Profile Picture" icon={<User className="w-5 h-5" />}>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-babyblue-100 to-babyblue-200 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-babyblue-600">
                  {formData.first_name?.[0]}{formData.last_name?.[0]}
                </span>
              )}
            </div>
            <div>
              <label className="inline-flex items-center gap-2 bg-babyblue-100 hover:bg-babyblue-200 text-babyblue-700 px-4 py-2 rounded-xl cursor-pointer transition-colors font-medium">
                <Upload className="w-4 h-4" />
                {uploadingImage ? 'Uploading...' : 'Change Photo'}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              <p className="text-sm text-gray-500 mt-2">JPG or PNG, max 5MB</p>
            </div>
          </div>
        </SectionCard>

        {/* Basic Info */}
        <SectionCard title="Basic Information" icon={<User className="w-5 h-5" />}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First Name</Label>
                <Input 
                  value={formData.first_name || ''} 
                  onChange={e => updateForm('first_name', e.target.value)}
                  placeholder="John"
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input 
                  value={formData.last_name || ''} 
                  onChange={e => updateForm('last_name', e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>
            
            <div>
              <Label>Username</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">@</span>
                <Input 
                  value={formData.username || ''} 
                  onChange={e => updateForm('username', e.target.value)}
                  placeholder="johndoe2026"
                  className="rounded-l-none"
                />
              </div>
            </div>

            <div>
              <Label>Bio</Label>
              <textarea 
                value={formData.bio || ''} 
                onChange={e => updateForm('bio', e.target.value)}
                placeholder="Tell coaches about yourself..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all resize-none"
              />
            </div>
          </div>
        </SectionCard>

        {/* Player Info */}
        <SectionCard title="Player Information" icon={<Trophy className="w-5 h-5" />}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Grad Year</Label>
              <Select 
                value={formData.grad_year?.toString() || ''} 
                onChange={e => updateForm('grad_year', parseInt(e.target.value))}
                options={YEARS.map(y => ({ value: y, label: `Class of ${y}` }))}
              />
            </div>
            <div>
              <Label>Position</Label>
              <Select 
                value={formData.position || ''} 
                onChange={e => updateForm('position', e.target.value)}
                options={POSITIONS.map(p => ({ value: p, label: p }))}
              />
            </div>
            <div>
              <Label>Height</Label>
              <Input 
                value={formData.height || ''} 
                onChange={e => updateForm('height', e.target.value)}
                placeholder="6'1"
              />
            </div>
            <div>
              <Label>Weight (lbs)</Label>
              <Input 
                value={formData.weight || ''} 
                onChange={e => updateForm('weight', e.target.value)}
                placeholder="185"
              />
            </div>
            <div>
              <Label>Throws</Label>
              <Select 
                value={formData.throws || 'R'} 
                onChange={e => updateForm('throws', e.target.value)}
                options={THROWS_BATS.map(t => ({ value: t, label: t }))}
              />
            </div>
            <div>
              <Label>Bats</Label>
              <Select 
                value={formData.bats || 'R'} 
                onChange={e => updateForm('bats', e.target.value)}
                options={THROWS_BATS.map(t => ({ value: t, label: t }))}
              />
            </div>
          </div>
        </SectionCard>

        {/* School Info */}
        <SectionCard title="School & Location" icon={<GraduationCap className="w-5 h-5" />}>
          <div className="space-y-4">
            <div>
              <Label>High School</Label>
              <Input 
                value={formData.high_school || ''} 
                onChange={e => updateForm('high_school', e.target.value)}
                placeholder="Lincoln High School"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Hometown</Label>
                <Input 
                  value={formData.hometown || ''} 
                  onChange={e => updateForm('hometown', e.target.value)}
                  placeholder="Springfield"
                />
              </div>
              <div>
                <Label>State</Label>
                <Select 
                  value={formData.state || ''} 
                  onChange={e => updateForm('state', e.target.value)}
                  options={STATES.map(s => ({ value: s, label: s }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>GPA</Label>
                <Input 
                  value={formData.gpa || ''} 
                  onChange={e => updateForm('gpa', e.target.value)}
                  placeholder="3.8"
                />
              </div>
              <div>
                <Label>SAT</Label>
                <Input 
                  value={formData.sat_score || ''} 
                  onChange={e => updateForm('sat_score', e.target.value)}
                  placeholder="1350"
                />
              </div>
              <div>
                <Label>ACT</Label>
                <Input 
                  value={formData.act_score || ''} 
                  onChange={e => updateForm('act_score', e.target.value)}
                  placeholder="28"
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Stats */}
        <SectionCard title="Statistics" icon={<BarChart3 className="w-5 h-5" />}>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Hitting</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>AVG</Label>
                  <Input 
                    value={stats.batting_avg || ''} 
                    onChange={e => updateStat('batting_avg', e.target.value)}
                    placeholder=".325"
                  />
                </div>
                <div>
                  <Label>OBP</Label>
                  <Input 
                    value={stats.obp || ''} 
                    onChange={e => updateStat('obp', e.target.value)}
                    placeholder=".415"
                  />
                </div>
                <div>
                  <Label>SLG</Label>
                  <Input 
                    value={stats.slg || ''} 
                    onChange={e => updateStat('slg', e.target.value)}
                    placeholder=".485"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Pitching</h4>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <Label>ERA</Label>
                  <Input 
                    value={stats.era || ''} 
                    onChange={e => updateStat('era', e.target.value)}
                    placeholder="2.45"
                  />
                </div>
                <div>
                  <Label>WHIP</Label>
                  <Input 
                    value={stats.whip || ''} 
                    onChange={e => updateStat('whip', e.target.value)}
                    placeholder="1.12"
                  />
                </div>
                <div>
                  <Label>K/9</Label>
                  <Input 
                    value={stats.k_per_9 || ''} 
                    onChange={e => updateStat('k_per_9', e.target.value)}
                    placeholder="8.5"
                  />
                </div>
                <div>
                  <Label>IP</Label>
                  <Input 
                    value={stats.innings || ''} 
                    onChange={e => updateStat('innings', e.target.value)}
                    placeholder="45.2"
                  />
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Social Links */}
        <SectionCard title="Social Links" icon={<LinkIcon className="w-5 h-5" />}>
          <div className="space-y-3">
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-500" />
              <Input 
                value={socials.instagram || ''} 
                onChange={e => updateSocial('instagram', e.target.value)}
                placeholder="@username"
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
              <Input 
                value={socials.twitter || ''} 
                onChange={e => updateSocial('twitter', e.target.value)}
                placeholder="@username"
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
              <Input 
                value={socials.youtube || ''} 
                onChange={e => updateSocial('youtube', e.target.value)}
                placeholder="channel URL"
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-700" />
              <Input 
                value={socials.linkedin || ''} 
                onChange={e => updateSocial('linkedin', e.target.value)}
                placeholder="profile URL"
                className="pl-10"
              />
            </div>
          </div>
        </SectionCard>

        {/* Awards */}
        <SectionCard title="Awards & Achievements" icon={<Trophy className="w-5 h-5" />}>
          <div>
            <textarea 
              value={formData.awards || ''} 
              onChange={e => updateForm('awards', e.target.value)}
              placeholder="First-team All-Conference (2024)&#10;Team MVP (2023)&#10;Perfect Game All-American"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all resize-none"
            />
            <p className="text-sm text-gray-500 mt-2">One award per line</p>
          </div>
        </SectionCard>
      </main>

      {/* Mobile Sticky Save */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-babyblue-100 p-4 md:hidden">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-babyblue-500 disabled:opacity-50 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// UI Components
function SectionCard({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-babyblue-100 overflow-hidden mb-4">
      <div className="px-4 py-3 border-b border-babyblue-50 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-babyblue-50 flex items-center justify-center text-babyblue-500">
          {icon}
        </div>
        <h2 className="font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{children}</label>
  )
}

function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all ${className}`}
      {...props}
    />
  )
}

function Select({ className = '', options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string, label: string }[] }) {
  return (
    <div className="relative">
      <select 
        className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all appearance-none bg-white ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  )
}