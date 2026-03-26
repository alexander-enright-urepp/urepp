/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  images: {
    domains: ['localhost', 'ovsfnjfznznfqkgtpuyy.supabase.co'],
    unoptimized: true,
  },
}

module.exports = nextConfig