/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/monetize',

  reactStrictMode: true,

  env: {
    NEXT_PUBLIC_BASE_PATH: '/monetize',
  },

  output: 'standalone',

  poweredByHeader: false,
  compress: true,

  generateBuildId: async () => {
    return process.env.GIT_COMMIT_SHA || 'monetize-build';
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn', 'log'] } // Add 'log' here to see console.logs
        : false,
  },

  async headers() {
    return [
      {
        source: '/monetize/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // ADD THIS - Fix CSP for all routes
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Add unsafe-eval
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://institutional-bo.paybito.com:8443 https://bitocircle.com",
              "frame-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'"
            ].join('; ')
          }
        ]
      }
    ];
  },

  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
};

export default nextConfig;