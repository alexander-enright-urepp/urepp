'use client'

import Link from 'next/link'
import { 
  ArrowLeft, 
  Crown, 
  Check, 
  Star,
  CreditCard,
  Home,
  Search,
  User,
  Tv
} from 'lucide-react'

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 pb-20">
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
              <h1 className="text-xl font-bold text-gray-900">Subscription</h1>
              <p className="text-sm text-gray-500">Manage your plan</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-2xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-babyblue-100 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-babyblue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Plan</p>
              <h2 className="text-xl font-bold text-gray-900">Free</h2>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500" />
              <span>Basic profile</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500" />
              <span>Search visibility</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500" />
              <span>Stats and achievements</span>
            </div>
          </div>

          <button className="w-full bg-babyblue-500 hover:bg-babyblue-600 text-white py-3 rounded-xl font-semibold transition-colors">
            Upgrade to Premium
          </button>
        </div>

        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 fill-current" />
            <span className="font-bold">Premium</span>
          </div>
          <p className="text-3xl font-bold mb-1">$10<span className="text-lg font-normal">/month</span></p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4" />
              <span>Unlimited video uploads</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4" />
              <span>Profile analytics</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4" />
              <span>Featured in search results</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4" />
              <span>Verified badge</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4" />
              <span>Priority support</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-babyblue-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-babyblue-50">
            <h3 className="font-semibold text-gray-900">Payment Method</h3>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3 text-gray-500">
              <CreditCard className="w-5 h-5" />
              <span className="text-sm">No payment method on file</span>
            </div>
          </div>
        </div>
      </main>

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
