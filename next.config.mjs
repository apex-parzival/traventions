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
        source: '/sabre-api/:path*',
        destination: 'https://api-crt.cert.havail.sabre.com/:path*',
      },
    ];
  },
};

export default nextConfig;
