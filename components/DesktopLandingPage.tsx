'use client'

import Link from 'next/link'
import Image from 'next/image'
import { 
  Calendar, 
  MessageCircle, 
  Video, 
  Search, 
  User, 
  Share2, 
  Tv,
  Star,
  ArrowRight,
  CheckCircle,
  Mail
} from 'lucide-react'

export default function DesktopLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="/urepp-logo copy.png" 
              alt="UREPP Logo" 
              width={48} 
              height={48} 
              className="rounded-xl shadow-lg shadow-[#51b5ff]/20"
            />
            <span className="text-2xl font-bold text-gray-900">UREPP</span>
          </div>
          <Link
            href="https://urepp.tv"
            className="bg-[#51b5ff] hover:bg-[#3da8f5] text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-[#51b5ff]/30 flex items-center gap-2"
          >
            Download in the App Store
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-[#51b5ff]/5 via-white to-[#51b5ff]/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#51b5ff]/10 text-[#51b5ff] px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Star className="w-4 h-4 fill-current" />
                Trusted by Athletes Nationwide
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                The Sports Recruiting Platform for{' '}
                <span className="text-[#51b5ff]">Future Champions</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Get discovered by college coaches. Showcase your stats, connect with recruiters, 
                and take your game to the next level.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="https://urepp.tv"
                  className="inline-flex items-center justify-center gap-2 bg-[#51b5ff] hover:bg-[#3da8f5] text-white px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-xl shadow-[#51b5ff]/30"
                >
                  Download in the App Store
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="flex gap-6 mt-8 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  100% Free to Start
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  No Credit Card Required
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-[#51b5ff]/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-[#51b5ff] to-[#3da8f5]"></div>
                <div className="px-8 pb-8">
                  <div className="w-24 h-24 bg-white rounded-2xl shadow-lg border-4 border-white -mt-12 mb-4 flex items-center justify-center overflow-hidden">
                    <Image 
                      src="/urepp-logo copy.png" 
                      alt="UREPP Logo" 
                      width={80} 
                      height={80}
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Path to College Sports</h3>
                  <p className="text-gray-600 mb-4">Join thousands of athletes getting recruited</p>
                  <div className="flex gap-3">
                    <span className="bg-[#51b5ff]/10 text-[#51b5ff] px-3 py-1 rounded-full text-sm font-medium">Baseball</span>
                    <span className="bg-[#51b5ff]/10 text-[#51b5ff] px-3 py-1 rounded-full text-sm font-medium">Softball</span>
                    <span className="bg-[#51b5ff]/10 text-[#51b5ff] px-3 py-1 rounded-full text-sm font-medium">Basketball</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Home Dashboard */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#51b5ff]" />
                    Upcoming Appointments
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-[#51b5ff]/5 rounded-xl">
                      <div className="w-10 h-10 bg-[#51b5ff] rounded-lg flex items-center justify-center">
                        <Video className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Coach Mike Johnson</p>
                        <p className="text-sm text-gray-500">Video Call - Today, 3:00 PM</p>
                      </div>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">Scheduled</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Coach Sarah Williams</p>
                        <p className="text-sm text-gray-500">Message - Tomorrow, 10:00 AM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-[#51b5ff] font-semibold text-sm uppercase tracking-wide">Home Dashboard</span>
              <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">Stay Connected with Coaches</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Your personalized dashboard keeps you organized with upcoming video calls, 
                messages from coaches, and important notifications all in one place. 
                Never miss an opportunity to connect with recruiters.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-[#51b5ff]" />
                  Schedule video calls directly with coaches
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-[#51b5ff]" />
                  Real-time messaging with recruiting staff
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-[#51b5ff]" />
                  Track all your appointments and follow-ups
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: UREPP TV */}
      <section className="py-20 bg-[#51b5ff]/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[#51b5ff] font-semibold text-sm uppercase tracking-wide">UREPP TV</span>
              <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">Watch Live Games Anywhere</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Stream live high school and junior college games from across the country. 
                Scout talent, study competition, and never miss the action with UREPP TV&apos;s 
                comprehensive live streaming platform.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-[#51b5ff]" />
                  Live HD streaming of games
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-[#51b5ff]" />
                  High school and junior college coverage
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-[#51b5ff]" />
                  Scout players in real-time
                </li>
              </ul>
            </div>
            <div>
              <div className="bg-gray-900 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <Tv className="w-6 h-6 text-red-500" />
                  <span className="text-white font-semibold">LIVE</span>
                  <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs animate-pulse">ON AIR</span>
                </div>
                <div className="aspect-video bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
                    </div>
                    <p className="text-gray-400 text-sm">Westlake vs. Central High</p>
                    <p className="text-white font-semibold">Regional Championship</p>
                  </div>
                </div>
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>12.5K viewers</span>
                  <span>4th Quarter - 2:34 remaining</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Search */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Search className="w-5 h-5 text-[#51b5ff]" />
                    <span className="font-semibold text-gray-900">Find Players & Coaches</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#51b5ff] to-[#3da8f5] rounded-full flex items-center justify-center text-white font-bold">
                        JD
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">John Davis</p>
                        <p className="text-sm text-gray-500">Class of 2026 - RHP - 92 MPH</p>
                      </div>
                      <div className="flex gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">4.9</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Coach Mike Johnson</p>
                        <p className="text-sm text-gray-500">Cal State Fullerton - Pitching Coach</p>
                      </div>
                      <div className="flex gap-1">
                          <span className="text-sm text-gray-500">Verified</span>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-[#51b5ff] font-semibold text-sm uppercase tracking-wide">Search</span>
              <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">Find Your Next Opportunity</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Powerful search tools to discover players by position, class year, location, 
                and key stats. Coaches can find the perfect recruit, athletes can connect 
                with the right programs.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-[#51b5ff]" />
                  Filter by sport, position, and class year
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-[#51b5ff]" />
                  Search verified coaches and programs
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-[#51b5ff]" />
                  Advanced stat-based matching
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Edit Dashboard */}
      <section className="py-20 bg-[#51b5ff]/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[#51b5ff] font-semibold text-sm uppercase tracking-wide">Edit Your Profile</span>
              <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">Build Your Recruiting Profile</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Create a standout profile that showcases your athletic achievements, 
                academic stats, and personal highlights. Update your information anytime 
                to keep coaches informed.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-[#51b5ff]" />
                  Add videos and highlight reels
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-[#51b5ff]" />
                  Track your stats and metrics
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-[#51b5ff]" />
                  Academic information and GPA
                </li>
              </ul>
            </div>
            <div>
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4">Profile Editor</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">John Davis</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Class Year</label>
                      <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">2026</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                      <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">RHP/SS</div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Key Stats</label>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-[#51b5ff]/10 text-[#51b5ff] px-3 py-1 rounded-full text-sm">92 MPH</span>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">.325 AVG</span>
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">3.8 GPA</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Share Profile */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-[#51b5ff] rounded-3xl p-8 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <Share2 className="w-8 h-8" />
                  <span className="text-2xl font-bold">Share Your Profile</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4">
                  <p className="text-sm text-white/80 mb-1">Your public profile link:</p>
                  <p className="font-mono text-white">urepp.app/player/john-davis-2026</p>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 bg-white text-[#51b5ff] py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                    Copy Link
                  </button>
                  <button className="flex-1 bg-white/20 text-white py-3 rounded-xl font-semibold">
                    Share
                  </button>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-[#51b5ff] font-semibold text-sm uppercase tracking-wide">Share</span>
              <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">Share with the World</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Every player gets a custom profile URL. Share it with coaches, post it on 
                social media, or include it in recruiting emails. Your profile becomes your 
                digital sports resume.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-[#51b5ff]" />
                  Custom profile URL for every athlete
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-[#51b5ff]" />
                  Share via social media, email, or text
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-[#51b5ff]" />
                  Track profile views and engagement
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#51b5ff]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-white mb-2">Beta</div>
              <div className="text-white/80">Athlete Profiles</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-white mb-2">Beta</div>
              <div className="text-white/80">College Coaches</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-white mb-2">Beta</div>
              <div className="text-white/80">Partner Schools</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-white mb-2">6</div>
              <div className="text-white/80">Sports Supported</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Get Recruited?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of athletes who have connected with college coaches through UREPP.
          </p>
          <Link
            href="https://urepp.tv"
            className="inline-flex items-center gap-2 bg-[#51b5ff] hover:bg-[#3da8f5] text-white px-10 py-4 rounded-full font-semibold text-lg transition-all shadow-xl shadow-[#51b5ff]/30"
          >
            Download in the App Store
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-gray-500 mt-4">Free to download. Premium features available.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image 
                src="/urepp-logo copy.png" 
                alt="UREPP Logo" 
                width={40} 
                height={40}
                className="rounded-xl"
              />
              <span className="text-2xl font-bold">UREPP</span>
            </div>
            <div className="flex items-center gap-8">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</Link>
              <a 
                href="mailto:alex@urepp.tv" 
                className="inline-flex items-center gap-2 bg-[#51b5ff] hover:bg-[#3da8f5] text-white px-6 py-2.5 rounded-full font-medium transition-colors"
              >
                <Mail className="w-4 h-4" />
                Contact Support
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            <p>© 2024 UREPP. All rights reserved. Built for athletes, by athletes.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
