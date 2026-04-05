/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
       {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/amadeus-api/:path*',
        destination: 'https://test.api.amadeus.com/:path*',
      },
    ];
  },
};

export default nextConfig;
