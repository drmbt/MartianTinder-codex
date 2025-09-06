import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: '/uploads/**',
        search: '',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    // Enable server actions size limit increase for file uploads
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // Redirect root to feed
  async redirects() {
    return [
      {
        source: '/',
        destination: '/feed',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
