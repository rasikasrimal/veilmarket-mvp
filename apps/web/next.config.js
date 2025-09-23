/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@veilmarket/core'],
  async rewrites() {
    return [
      {
        source: '/api/trpc/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/trpc/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;