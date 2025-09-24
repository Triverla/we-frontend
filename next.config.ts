import type { NextConfig } from "next";
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: 'build',
  output: 'standalone',
  typescript: {
    // ⚠️ Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: process.env.SKIP_TYPE_CHECK === '1',
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'images.unsplash.com',
      't0.gstatic.com',
      'xvjjacbujveslwfqyftl.supabase.co',
      'avatars.githubusercontent.com',
      'cdn.jsdelivr.net',
      'woothomes-frontend-lypmesilea-uc.a.run.app',
      'woothomes.s3.eu-north-1.amazonaws.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'woothomes.s3.eu-north-1.amazonaws.com',
        pathname: '/**',
      },
    ],
    // Add image optimization settings
    minimumCacheTTL: process.env.NODE_ENV === 'production' ? 60 : 0,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // PWA configuration
  headers: async () => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: isDevelopment 
              ? 'no-store, must-revalidate'
              : 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
      // Add security headers for images
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: isDevelopment 
              ? 'no-store, must-revalidate'
              : 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
  // Handle service worker in development
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

// Wrap the config with PWA
export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/www\.woothomes\.com\/_next\/static\/.*$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      urlPattern: /^https:\/\/www\.woothomes\.com\/api\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      urlPattern: /^https:\/\/www\.woothomes\.com\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
  buildExcludes: [
    /middleware-manifest\.json$/,
    /_buildManifest\.js$/,
    /_ssgManifest\.js$/,
    /app-build-manifest\.json$/,
    /\.js$/,
    /\.css$/,
  ],
  publicExcludes: [
    '!robots.txt',
    '!sitemap.xml',
    '!manifest.json',
    '!icons/**/*',
  ],
  reloadOnOnline: true,
  fallbacks: {
    document: '/offline.html',
    image: '',
    audio: '',
    video: '',
    font: '',
  },
})(nextConfig as any);
