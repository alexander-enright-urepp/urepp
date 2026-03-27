'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Trophy, Video, Share2, User, LogOut, Plus, CheckCircle, Star, TrendingUp, Users, Target, Zap, ChevronRight, BarChart3 } from 'lucide-react'
import { getCurrentUser, signOut } from '@/lib/auth'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser()
      setUser(user)
      setLoading(false)
    }
    fetchUser()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100">
      {/* Navigation */}
      <nav className="border-b border-babyblue-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-babyblue-600">UREPP</span>
              <span className="ml-2 text-sm text-babyblue-500 hidden sm:inline">Sports Recruitment</span>
            </div>
            <div className="flex gap-3 items-center">
              {!loading && (
                <>
                  <Link
                    href="/search"
                    className="text-gray-600 hover:text-babyblue-600 font-medium transition-colors px-3 py-2"
                  >
                    Search Players
                  </Link>
                  {user ? (
                    <>
                      <Link
                        href="/dashboard"
                        className="hidden sm:flex items-center gap-2 bg-babyblue-500 hover:bg-babyblue-600 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-md shadow-babyblue-200"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl font-medium transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="text-babyblue-600 hover:text-babyblue-700 px-4 py-2 rounded-xl font-medium transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        className="bg-babyblue-500 hover:bg-babyblue-600 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-md shadow-babyblue-200"
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-babyblue-100/50 via-white to-babyblue-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-babyblue-100 text-babyblue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4 fill-current" />
              Trusted by Athletes Across 6 Sports
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Get Discovered by{' '}
              <span className="text-babyblue-500">College Coaches</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Create your professional recruiting profile in minutes. Showcase your stats,
              skills, and achievements to college programs across Baseball, Football, Basketball, Soccer, Hockey, and Volleyball.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              {user ? (
                <Link
                  href="/profile/create"
                  className="bg-babyblue-500 hover:bg-babyblue-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-xl shadow-babyblue-200 hover:shadow-2xl hover:shadow-babyblue-300 hover:-translate-y-1"
                >
                  Create Your Profile
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="bg-babyblue-500 hover:bg-babyblue-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-xl shadow-babyblue-200 hover:shadow-2xl hover:shadow-babyblue-300 hover:-translate-y-1"
                  >
                    Start Your Free Profile
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/search"
                    className="bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 px-8 py-4 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-2 hover:border-babyblue-300"
                  >
                    Search Players
                  </Link>
                </>
              )}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>100% Free for Players</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Instant Profile Activation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-babyblue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard number="100+" label="Player Profiles" />
            <StatCard number="50+" label="College Coaches" />
            <StatCard number="50" label="States Represented" />
            <StatCard number="100+" label="Recruitment Offers" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How UREPP Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to get your recruiting profile in front of college coaches
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              step="1"
              icon={<User className="w-8 h-8 text-babyblue-500" />}
              title="Create Your Profile"
              description="Sign up in 30 seconds and build your professional recruiting profile with your stats, videos, and achievements."
            />
            <StepCard
              step="2"
              icon={<Target className="w-8 h-8 text-babyblue-500" />}
              title="Get Discovered"
              description="College coaches search and filter profiles daily. Your profile appears in searches matching your position, class year, and location."
            />
            <StepCard
              step="3"
              icon={<TrendingUp className="w-8 h-8 text-babyblue-500" />}
              title="Connect & Commit"
              description="Coaches view your profile and contact you directly. Share your profile link with any coach, anytime."
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Get Recruited</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional tools designed specifically for baseball recruitment
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Trophy className="w-8 h-8 text-babyblue-500" />}
              title="Complete Stats Tracking"
              description="Showcase exit velocity, pitch velocity, 60-yard dash, GPA, and more. Coaches see your full athletic and academic profile."
            />
            <FeatureCard
              icon={<Video className="w-8 h-8 text-babyblue-500" />}
              title="Video Integration"
              description="Link your YouTube highlights, showcase videos, and skills footage directly on your profile for easy coach access."
            />
            <FeatureCard
              icon={<Share2 className="w-8 h-8 text-babyblue-500" />}
              title="Custom Profile URL"
              description="Get a personalized link like urepp.vercel.app/players/your-name. Share it on social media, emails, and with coaches."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-babyblue-500" />}
              title="Coach Search & Filter"
              description="Coaches can search by position, grad year, state, and metrics. Make sure you're visible to the right programs."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-babyblue-500" />}
              title="Instant Updates"
              description="Update your stats, add new videos, or modify your bio anytime. Your profile stays current throughout your recruitment."
            />
            <FeatureCard
              icon={<CheckCircle className="w-8 h-8 text-babyblue-500" />}
              title="Mobile Optimized"
              description="Coaches view profiles on any device. Your profile looks professional on desktop, tablet, and mobile."
            />
          </div>
        </div>
      </section>

      {/* Sample Profile Preview */}
      <section className="py-20 bg-gradient-to-br from-babyblue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Your Profile, Your Story
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                A professional, clean layout that puts your achievements front and center.
                Coaches see your stats, videos, academics, and contact info all in one place.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Professional player card with photo and key stats',
                  'Detailed metrics section for showcase numbers',
                  'Academic information for coach evaluation',
                  'Social media and video links',
                  'Custom bio to tell your story'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 text-babyblue-600 font-semibold hover:text-babyblue-700 transition-colors"
              >
                See Example Profiles
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="bg-white rounded-3xl shadow-2xl shadow-babyblue-200 overflow-hidden">
              <div className="h-40 bg-gradient-to-r from-babyblue-400 via-babyblue-500 to-babyblue-600"></div>
              <div className="px-8 pb-8">
                <div className="relative">
                  <div className="w-28 h-28 bg-babyblue-100 rounded-full border-4 border-white -mt-14 mb-4 flex items-center justify-center text-babyblue-600 text-3xl font-bold shadow-lg">
                    JD
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">John Doe</h3>
                  <p className="text-babyblue-600 font-medium">@john-doe-2026</p>
                  <p className="text-gray-600 mt-1">Class of 2026 • RHP/SS • 6'1" 185 lbs</p>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <span className="bg-babyblue-100 text-babyblue-800 px-3 py-1 rounded-full text-sm font-medium">3.8 GPA</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">.325 AVG</span>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">92 MPH</span>
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">6.8s 60yd</span>
                  </div>
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <p className="text-gray-600 text-sm">
                      "Two-way player with strong arm action and gap-to-gap power. Looking to compete at the Division I level..."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600">Players who got recruited using UREPP</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="UREPP helped me get discovered by 5 different D1 programs. I committed to my dream school within 3 months of creating my profile."
              name="Mike Rodriguez"
              role="Class of 2024 • Committed to UCLA"
              position="RHP"
            />
            <TestimonialCard
              quote="The profile was so easy to set up. Coaches loved being able to see all my stats and videos in one place. Highly recommend!"
              name="Sarah Chen"
              role="Class of 2025 • Committed to Stanford"
              position="CF"
            />
            <TestimonialCard
              quote="As a coach, UREPP makes it easy to find and evaluate players. The search filters save me hours of scouting time."
              name="Coach Williams"
              role="Head Coach • Texas A&M"
              position="Recruiting Coordinator"
            />
          </div>
        </div>
      </section>

      {/* Video Analytics Preview Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-babyblue-100 text-babyblue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <BarChart3 className="w-4 h-4" />
              New Feature
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Track Your Performance</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Monitor video views, engagement, and recruiter interest with built-in analytics
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Stat Card 1 */}
            <div className="bg-gradient-to-br from-babyblue-50 to-white border border-babyblue-100 rounded-2xl p-8 text-center shadow-lg shadow-babyblue-100/50">
              <div className="w-16 h-16 bg-babyblue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-babyblue-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">1,000+</div>
              <div className="text-gray-600 font-medium">Total Video Views</div>
              <div className="text-sm text-babyblue-600 mt-2">Track all your profile videos</div>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-gradient-to-br from-babyblue-50 to-white border border-babyblue-100 rounded-2xl p-8 text-center shadow-lg shadow-babyblue-100/50">
              <div className="w-16 h-16 bg-babyblue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-babyblue-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">50+</div>
              <div className="text-gray-600 font-medium">Coach Views</div>
              <div className="text-sm text-babyblue-600 mt-2">See recruiter engagement</div>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-gradient-to-br from-babyblue-50 to-white border border-babyblue-100 rounded-2xl p-8 text-center shadow-lg shadow-babyblue-100/50">
              <div className="w-16 h-16 bg-babyblue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-babyblue-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">+47%</div>
              <div className="text-gray-600 font-medium">Profile Growth</div>
              <div className="text-sm text-babyblue-600 mt-2">Month-over-month increase</div>
            </div>
          </div>

          <div className="text-center mt-10">
            <p className="text-gray-500 mb-4">Available on all player profiles</p>
            <Link
              href="/profile/john-doe-2026"
              className="inline-flex items-center gap-2 text-babyblue-600 font-semibold hover:text-babyblue-700 transition-colors"
            >
              See Example Analytics
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-babyblue-500 to-babyblue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Recruited?
          </h2>
          <p className="text-xl text-babyblue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of athletes who are getting discovered by college coaches.
            Create your free profile in minutes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/signup"
              className="bg-white text-babyblue-600 hover:bg-gray-100 px-8 py-4 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              Create Free Profile
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/search"
              className="bg-babyblue-400 hover:bg-babyblue-300 text-white border-2 border-babyblue-400 px-8 py-4 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center"
            >
              Browse Players
            </Link>
          </div>
          <p className="text-babyblue-100 mt-6 text-sm">
            No credit card required. Takes less than 5 minutes.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold text-babyblue-400 mb-4">UREPP</h3>
              <p className="text-gray-400">
              The ultimate platform for sports recruitment. Connecting players with college coaches since 2024.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Players</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/signup" className="hover:text-white transition-colors">Create Profile</Link></li>
                <li><Link href="/search" className="hover:text-white transition-colors">Search Players</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Recruiting Tips</a></li>
                <li><a href="#" className="hover:text-white transition-colors">NCAA Guidelines</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
            <p>© 2024 UREPP - Ultimate Recruitment Player Profiles. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-babyblue-600 mb-2">{number}</div>
      <div className="text-gray-600 font-medium">{label}</div>
    </div>
  )
}

function StepCard({ step, icon, title, description }: { step: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white/70 backdrop-blur-sm border border-babyblue-100 rounded-2xl p-8 hover:bg-white/90 transition-all shadow-lg shadow-babyblue-100/50 hover:shadow-xl hover:shadow-babyblue-200/50 relative">
      <div className="absolute -top-4 -left-4 w-10 h-10 bg-babyblue-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
        {step}
      </div>
      <div className="w-14 h-14 bg-babyblue-100 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:bg-white hover:border-babyblue-200 transition-all shadow-sm hover:shadow-lg hover:shadow-babyblue-100/50">
      <div className="w-12 h-12 bg-babyblue-100 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}

function TestimonialCard({ quote, name, role, position }: { quote: string; name: string; role: string; position: string }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:bg-white hover:border-babyblue-200 transition-all">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
        ))}
      </div>
      <p className="text-gray-700 mb-6 italic">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-babyblue-100 rounded-full flex items-center justify-center text-babyblue-600 font-bold">
          {name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{name}</p>
          <p className="text-sm text-gray-500">{role}</p>
          <p className="text-xs text-babyblue-600 font-medium">{position}</p>
        </div>
      </div>
    </div>
  )
}
