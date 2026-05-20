'use client'

import { useRouter } from 'next/navigation'
import { 
  Video, Trophy, BarChart3, Link2, LineChart, Palette, 
  Users, GraduationCap, Ruler, ClipboardList, ArrowRight 
} from 'lucide-react'

interface DashboardBoxesProps {
  profile: {
    id: string
    username: string
    video_count?: number
    award_count?: number
    has_stats?: boolean
    has_links?: boolean
    has_analytics?: boolean
    has_theme?: boolean
    team_count?: number
    has_academics?: boolean
    has_measurements?: boolean
    has_recruiting_info?: boolean
  } | null
}

const boxes = [
  {
    id: 'video',
    label: 'Video',
    icon: Video,
    description: 'Manage highlight videos',
    color: 'rose',
    href: '/edit-profile?tab=videos'
  },
  {
    id: 'awards',
    label: 'Awards',
    icon: Trophy,
    description: 'Achievements & honors',
    color: 'amber',
    href: '/edit-profile?tab=awards'
  },
  {
    id: 'stats',
    label: 'Stats',
    icon: BarChart3,
    description: 'Performance statistics',
    color: 'emerald',
    href: '/edit-profile?tab=stats'
  },
  {
    id: 'links',
    label: 'Links',
    icon: Link2,
    description: 'Social media & websites',
    color: 'blue',
    href: '/edit-profile?tab=links'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: LineChart,
    description: 'Profile views & insights',
    color: 'violet',
    href: '/analytics'
  },
  {
    id: 'themes',
    label: 'Themes',
    icon: Palette,
    description: 'Customize appearance',
    color: 'pink',
    href: '/edit-profile?tab=themes'
  },
  {
    id: 'teams',
    label: 'Teams',
    icon: Users,
    description: 'Team affiliations & history',
    color: 'cyan',
    href: '/edit-profile?tab=teams'
  },
  {
    id: 'academics',
    label: 'Academics',
    icon: GraduationCap,
    description: 'GPA & test scores',
    color: 'indigo',
    href: '/edit-profile?tab=academics'
  },
  {
    id: 'measurements',
    label: 'Measurements',
    icon: Ruler,
    description: 'Height, weight & metrics',
    color: 'orange',
    href: '/edit-profile?tab=measurements'
  },
  {
    id: 'recruiting',
    label: 'Recruiting Info',
    icon: ClipboardList,
    description: 'Recruitment status & offers',
    color: 'teal',
    href: '/edit-profile?tab=recruiting'
  }
]

const colorClasses: Record<string, { bg: string; text: string; border: string; hover: string }> = {
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', hover: 'hover:bg-rose-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', hover: 'hover:bg-amber-100' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', hover: 'hover:bg-emerald-100' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', hover: 'hover:bg-blue-100' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100', hover: 'hover:bg-violet-100' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100', hover: 'hover:bg-pink-100' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100', hover: 'hover:bg-cyan-100' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', hover: 'hover:bg-indigo-100' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', hover: 'hover:bg-orange-100' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100', hover: 'hover:bg-teal-100' },
}

export function DashboardBoxes({ profile }: DashboardBoxesProps) {
  const router = useRouter()

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Sections</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {boxes.map((box) => {
          const colors = colorClasses[box.color]
          const Icon = box.icon
          
          return (
            <button
              key={box.id}
              onClick={() => router.push(box.href)}
              className={`
                relative group bg-white rounded-xl border border-gray-200 p-4
                transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5
                hover:border-babyblue-300 text-left
              `}
            >
              <div className={`
                w-10 h-10 rounded-xl ${colors.bg} ${colors.text}
                flex items-center justify-center mb-3
                group-hover:scale-110 transition-transform duration-200
              `}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">{box.label}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{box.description}</p>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-4 h-4 text-babyblue-500" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
