// STATIC_EXPORT=1 builds into its own distDir (used by scripts/export-static)
// so exporting never overwrites the normal `.next` output.
const isStaticExport = process.env.STATIC_EXPORT === '1';

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
