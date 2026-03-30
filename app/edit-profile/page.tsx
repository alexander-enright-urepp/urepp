'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Loader2, 
  Upload, 
  User, 
  GraduationCap,
  Link as LinkIcon,
  Save,
  ChevronDown,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Check,
  X,
  Mail
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Extended years from 1975-2035
const GRADUATION_YEARS = Array.from({length: 61}, (_, i) => (1975 + i).toString())
const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC']
const CURRENT_YEAR_OPTIONS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduated']
const SPORTS_LIST = [
  'Baseball', 'Basketball', 'Football', 'Soccer', 'Volleyball',
  'Tennis', 'Golf', 'Swimming', 'Track & Field', 'Cross Country',
  'Wrestling', 'Hockey', 'Lacrosse', 'Softball', 'Gymnastics',
  'Cheerleading', 'Water Polo', 'Field Hockey', 'Rugby', 'Cricket',
  'Other'
]

interface ProfileData {
  id: string
  user_id: string
  first_name: string
  last_name: string
  username: string
  slug: string
  grad_year: number
  high_school: string
  hometown: string
  state: string
  gpa: string
  sat_score: string
  act_score: string
  bio: string
  avatar_url: string | null
  college_name?: string
  college_city?: string
  college_state?: string
  college_grad_year?: number
  // New fields
  high_school_current_year?: string
  high_school_sports?: string[]
  college_current_year?: string
  college_sports?: string[]
  social_links: {
    email?: string
    instagram?: string
    twitter?: string
    youtube?: string
    linkedin?: string
    tiktok?: string
    hudl?: string
    maxpreps?: string
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
  const [highSchoolSports, setHighSchoolSports] = useState<string[]>([])
  const [collegeSports, setCollegeSports] = useState<string[]>([])
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
      high_school: profileData.high_school || '',
      hometown: profileData.hometown || '',
      state: profileData.state || '',
      gpa: profileData.gpa || '',
      sat_score: profileData.sat_score || '',
      act_score: profileData.act_score || '',
      bio: profileData.bio || '',
      college_name: profileData.college_name || '',
      college_city: profileData.college_city || '',
      college_state: profileData.college_state || '',
      college_grad_year: profileData.college_grad_year || undefined,
      high_school_current_year: profileData.high_school_current_year || '',
      high_school_sports: profileData.high_school_sports || [],
      college_current_year: profileData.college_current_year || '',
      college_sports: profileData.college_sports || [],
    })
    setHighSchoolSports(profileData.high_school_sports || [])
    setCollegeSports(profileData.college_sports || [])
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
        high_school_sports: highSchoolSports,
        college_sports: collegeSports,
        // Save social links as individual columns (for public profile)
        email: socials.email,
        instagram: socials.instagram,
        twitter: socials.twitter,
        youtube: socials.youtube,
        linkedin: socials.linkedin,
        tiktok: socials.tiktok,
        hudl: socials.hudl,
        maxpreps: socials.maxpreps,
        // Keep social_links for backwards compatibility
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

  const toggleSport = (section: 'high_school' | 'college', sport: string) => {
    if (section === 'high_school') {
      setHighSchoolSports(prev => 
        prev.includes(sport) 
          ? prev.filter(s => s !== sport)
          : [...prev, sport]
      )
    } else {
      setCollegeSports(prev => 
        prev.includes(sport) 
          ? prev.filter(s => s !== sport)
          : [...prev, sport]
      )
    }
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
        {formData.username && (
          <div className="mb-6 bg-babyblue-50 border border-babyblue-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Public Profile</p>
                <p className="text-babyblue-600 text-sm">urepp.com/players/{formData.username}</p>
              </div>
              <Link
                href={`/players/${formData.username}`}
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

        {/* High School Info */}
        <SectionCard title="High School" icon={<GraduationCap className="w-5 h-5" />}>
          <div className="space-y-4">
            <div>
              <Label>High School Name</Label>
              <Input 
                value={formData.high_school || ''} 
                onChange={e => updateForm('high_school', e.target.value)}
                placeholder="Lincoln High School"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Graduation Year</Label>
                <Select 
                  value={formData.grad_year?.toString() || ''} 
                  onChange={e => updateForm('grad_year', parseInt(e.target.value))}
                  options={GRADUATION_YEARS.map(y => ({ value: y, label: `Class of ${y}` }))}
                />
              </div>
              <div>
                <Label>Current Year</Label>
                <Select 
                  value={formData.high_school_current_year || ''} 
                  onChange={e => updateForm('high_school_current_year', e.target.value)}
                  options={[{value: '', label: 'Select...'}, ...CURRENT_YEAR_OPTIONS.map(y => ({ value: y, label: y }))]}
                />
              </div>
            </div>

            {/* Sports Played */}
            <div>
              <Label>Sports Played</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {SPORTS_LIST.map(sport => (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => toggleSport('high_school', sport)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      highSchoolSports.includes(sport)
                        ? 'bg-babyblue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {highSchoolSports.includes(sport) && <Check className="w-3 h-3 inline mr-1" />}
                    {sport}
                  </button>
                ))}
              </div>
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

        {/* College Info */}
        <SectionCard title="College (Optional)" icon={<GraduationCap className="w-5 h-5" />}>
          <div className="space-y-4">
            <div>
              <Label>College Name</Label>
              <Input 
                value={formData.college_name || ''} 
                onChange={e => updateForm('college_name', e.target.value)}
                placeholder="University of Example"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Graduation Year</Label>
                <Select 
                  value={formData.college_grad_year?.toString() || ''} 
                  onChange={e => updateForm('college_grad_year', e.target.value ? parseInt(e.target.value) : undefined)}
                  options={[{value: '', label: 'Not in college'}, ...GRADUATION_YEARS.map(y => ({ value: y, label: `Class of ${y}` }))]}
                />
              </div>
              <div>
                <Label>Current Year</Label>
                <Select 
                  value={formData.college_current_year || ''} 
                  onChange={e => updateForm('college_current_year', e.target.value)}
                  options={[{value: '', label: 'Select...'}, ...CURRENT_YEAR_OPTIONS.map(y => ({ value: y, label: y }))]}
                />
              </div>
            </div>

            {/* Sports Played */}
            <div>
              <Label>Sports Played</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {SPORTS_LIST.map(sport => (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => toggleSport('college', sport)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      collegeSports.includes(sport)
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {collegeSports.includes(sport) && <Check className="w-3 h-3 inline mr-1" />}
                    {sport}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>College City</Label>
                <Input 
                  value={formData.college_city || ''} 
                  onChange={e => updateForm('college_city', e.target.value)}
                  placeholder="College Town"
                />
              </div>
              <div>
                <Label>College State</Label>
                <Select 
                  value={formData.college_state || ''} 
                  onChange={e => updateForm('college_state', e.target.value)}
                  options={[{value: '', label: 'Select...'}, ...STATES.map(s => ({ value: s, label: s }))]}
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Social Links */}
        <SectionCard title="Social Links" icon={<LinkIcon className="w-5 h-5" />}>
          <div className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input 
                value={socials.email || ''} 
                onChange={e => updateSocial('email', e.target.value)}
                placeholder="your@email.com"
                className="pl-10"
              />
            </div>
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
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-black">TT</span>
              <Input 
                value={socials.tiktok || ''} 
                onChange={e => updateSocial('tiktok', e.target.value)}
                placeholder="TikTok @username"
                className="pl-10"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-orange-600">HUDL</span>
              <Input 
                value={socials.hudl || ''} 
                onChange={e => updateSocial('hudl', e.target.value)}
                placeholder="Hudl profile URL"
                className="pl-10"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600">MAX</span>
              <Input 
                value={socials.maxpreps || ''} 
                onChange={e => updateSocial('maxpreps', e.target.value)}
                placeholder="MaxPreps profile URL"
                className="pl-10"
              />
            </div>
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