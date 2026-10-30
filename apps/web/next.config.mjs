const API_URL = process.env.API_URL ?? 'http://localhost:4000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Browser requests to /api/* are proxied to the BFF, so client-side code
  // can call relative URLs (same idea as CRA's "proxy" field).
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_URL}/api/:path*` }]
  },
}

export default nextConfig
