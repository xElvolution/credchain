/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@arkiv-network/sdk'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};

module.exports = nextConfig;
