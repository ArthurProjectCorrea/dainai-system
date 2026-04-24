import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    authInterrupts: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'h8dxkfmaphn8o0p3.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  serverExternalPackages: [],

  // Allow mobile access and other network devices
}

// @ts-expect-error - allowedDevOrigins is required for network access in some Next versions
nextConfig.allowedDevOrigins = ['172.26.224.1', 'localhost:3000']

export default nextConfig
