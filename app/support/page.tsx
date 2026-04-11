export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">UREPP Support</h1>
            <p className="text-gray-600">We're here to help with your recruiting journey</p>
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
              <p className="text-gray-600 mb-4">
                Have questions or need assistance? Reach out to our support team:
              </p>
              <div className="bg-babyblue-50 rounded-xl p-4">
                <p className="text-babyblue-900 font-medium">Email: support@urepp.app</p>
                <p className="text-babyblue-700 text-sm mt-1">Response time: Within 24-48 hours</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">How do I create a profile?</h3>
                  <p className="text-gray-600 text-sm mt-1">Download the app, sign up, and complete your profile with your stats, achievements, and highlight videos.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">How do coaches find me?</h3>
                  <p className="text-gray-600 text-sm mt-1">Coaches can search for athletes by sport, position, location, and graduation year. Premium profiles get featured placement.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">How do I cancel my subscription?</h3>
                  <p className="text-gray-600 text-sm mt-1">Go to Settings &gt; Subscription in the app, or manage through your Apple ID account settings.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">What is included in Premium?</h3>
                  <p className="text-gray-600 text-sm mt-1">Premium includes unlimited video uploads, detailed analytics, verified badge, priority search placement, and custom profile themes.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Legal</h2>
              <div className="flex gap-4 text-sm">
                <a href="/terms" className="text-babyblue-600 hover:text-babyblue-700 underline">Terms of Use</a>
                <a href="/privacy" className="text-babyblue-600 hover:text-babyblue-700 underline">Privacy Policy</a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}