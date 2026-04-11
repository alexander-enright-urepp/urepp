import Link from 'next/link'
import { Home, Tv, Search, User } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
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

      {/* Terms Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Use (EULA)</h1>
          
          <p className="text-sm text-gray-500 mb-6">Last Updated: April 11, 2026</p>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Agreement to Terms</h2>
            <p className="text-gray-600">By accessing or using the UREPP mobile application ("App"), you agree to be bound by these Terms of Use. If you disagree with any part of these terms, you may not access the App.</p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p className="text-gray-600">UREPP is a sports recruiting platform that allows athletes to create profiles, upload videos and stats, and connect with college coaches and recruiters.</p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
            <p className="text-gray-600">You must be at least 13 years old to use this App. You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Subscription Terms</h2>
            <p className="text-gray-600">Some features of the App require a paid subscription. Subscriptions automatically renew unless turned off at least 24 hours before the end of the current period. You can manage subscriptions in your Apple ID account settings.</p>
            <ul className="list-disc pl-5 mt-2 text-gray-600">
              <li>Monthly Premium: $9.99/month</li>
              <li>Yearly Premium: $99.99/year</li>
              <li>Subscriptions auto-renew until cancelled</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. User Content</h2>
            <p className="text-gray-600">You retain ownership of content you upload to UREPP. By uploading content, you grant UREPP a license to display and share your profile with coaches and recruiters. You represent that you have the right to share all uploaded content.</p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Prohibited Activities</h2>
            <p className="text-gray-600">You may not use the App to:</p>
            <ul className="list-disc pl-5 mt-2 text-gray-600">
              <li>Upload false or misleading information</li>
              <li>Impersonate another person or entity</li>
              <li>Upload content you don't have rights to</li>
              <li>Use the App for any illegal purpose</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Limitation of Liability</h2>
            <p className="text-gray-600">UREPP is not responsible for recruiting decisions made by coaches or the accuracy of user-provided information. We do not guarantee scholarship offers or recruitment.</p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Changes to Terms</h2>
            <p className="text-gray-600">We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Continued use of the App constitutes acceptance of revised terms.</p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact Information</h2>
            <p className="text-gray-600">Questions about these Terms? Contact us at:</p>
            <p className="text-babyblue-600 mt-2">support@urepp.app</p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Apple App Store Terms</h2>
            <p className="text-gray-600">These Terms of Use constitute the End User License Agreement (EULA) between you and UREPP for the use of this App through the Apple App Store.</p>
          </section>
        </div>
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