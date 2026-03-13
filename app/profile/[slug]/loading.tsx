export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Skeleton */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-6"></div>

        {/* Profile Header Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-48 bg-gray-200 animate-pulse"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-6">
              <div className="w-32 h-32 bg-gray-200 rounded-full border-4 border-white animate-pulse"></div>
              <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                <div className="w-48 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="w-64 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex gap-2 mb-6">
              <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-24 h-6 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-28 h-6 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
