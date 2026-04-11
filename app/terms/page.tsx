import Link from 'next/link'
import { Home, Tv, Search, User } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-babyblue-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-babyblue-600 font-bold text-xl">
            UREPP
          </Link>
          <Link 
            href="/" 
            className="text-sm text-gray-500 hover:text-babyblue-600 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* EULA Banner - Required by Apple */}
      <div className="bg-babyblue-50 border-b border-babyblue-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900 mb-2">END USER LICENSE AGREEMENT (EULA)</h1>
          <p className="text-sm text-gray-700">
            This End User License Agreement ("EULA") is a legal agreement between you and UREPP, Inc 
            for the use of the UREPP mobile application (the "App"). By downloading, installing, or 
            using the App, you agree to be bound by the terms and conditions set forth below. 
            These terms constitute both our Terms of Service and your End User License Agreement.
          </p>
        </div>
      </div>

      {/* Terms Content via iframe */}
      <main className="flex-1 w-full">
        <iframe 
          src="/terms-original.html"
          className="w-full h-[calc(100vh-180px)] border-0"
          title="Terms and Conditions - EULA"
          sandbox="allow-same-origin allow-scripts"
        />
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
          <Link href="/dashboard" className="flex flex-col items-center gap-0.5 py-2 px-6 text-gray-400 hover:text-gray-600">
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
