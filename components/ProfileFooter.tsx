'use client'

import Link from 'next/link'

interface ProfileFooterProps {
  isDark?: boolean
}

export default function ProfileFooter({ isDark = false }: ProfileFooterProps) {
  const textColor = isDark ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-700'
  const linkColor = isDark ? 'text-white/40 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'
  
  return (
    <footer className="mt-12 pb-24">
      {/* Claim Profile Link */}
      <div className="text-center mb-4">
        <button
          onClick={() => window.alert('Claim profile feature coming soon!')}
          className={`text-sm underline underline-offset-2 transition-colors ${textColor}`}
        >
          Is this you? Claim this profile
        </button>
      </div>
      
      {/* Legal Links */}
      <div className={`flex justify-center items-center gap-4 text-sm ${linkColor}`}>
        <Link href="/terms" className="transition-colors">
          Terms
        </Link>
        <span>•</span>
        <Link href="/privacy" className="transition-colors">
          Privacy Policy
        </Link>
      </div>
    </footer>
  )
}
