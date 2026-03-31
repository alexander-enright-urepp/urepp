'use client'

import Link from 'next/link'
import { Tv, Home, Search, User, Mail } from 'lucide-react'

export default function TVPage() {
  const handleContactSupport = () => {
    const subject = encodeURIComponent('Live Stream UREPP TV')
    const body = encodeURIComponent('I would like to live stream my games. I want to learn more. Please sign me up.')
    window.location.href = `mailto:alex@urepp.tv?subject=${subject}&body=${body}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-babyblue-100 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <h1 className="text-xl font-bold text-gray-900">UREPP TV</h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-12">
        {/* TV Icon */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-babyblue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Tv className="w-12 h-12 text-babyblue-600" />
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
              className="w-full bg-babyblue-500 hover:bg-babyblue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-babyblue-200"
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
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-babyblue-100 px-4 py-2 z-50">
        <div className="max-w-md mx-auto flex justify-around">
          <BottomNavLink href="/" icon={<Home className="w-6 h-6" />} label="Home" />
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
