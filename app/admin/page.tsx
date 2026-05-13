import { supabase } from '@/lib/supabase'

export default async function AdminPage() {
  // Fetch total profile count from Supabase
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const profileCount = count || 0

  return (
    <div className="min-h-screen bg-[#51b5ff] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
        <h1 className="text-gray-600 text-lg font-medium mb-4 uppercase tracking-wide">
          Total Profiles
        </h1>
        <div className="text-[#51b5ff] text-8xl font-bold">
          {profileCount.toLocaleString()}
        </div>
        <p className="text-gray-400 text-sm mt-4">
          UREPP Admin Dashboard
        </p>
      </div>
    </div>
  )
}
