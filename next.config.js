/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@arkiv-network/sdk'],
  serverExternalPackages: ['pino-pretty', 'lokijs', 'encoding'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

module.exports = nextConfig;
