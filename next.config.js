// STATIC_EXPORT=1 builds into its own distDir (used by scripts/export-static)
// so exporting never overwrites the normal `.next` output.
const isStaticExport = process.env.STATIC_EXPORT === '1';

// Baseline security headers for every route. No Content-Security-Policy on
// purpose: the site relies on inline styles/scripts and a CSP would break it.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Type/lint checks belong to the real deploy build; the export only needs the bundle.
  ...(isStaticExport
    ? {
        distDir: '.next-export',
        typescript: { ignoreBuildErrors: true },
        eslint: { ignoreDuringBuilds: true },
      }
    : {}),
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  experimental: {
    typedRoutes: false,
  },
  images: {
    ...(isStaticExport ? { unoptimized: true } : {}),
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
