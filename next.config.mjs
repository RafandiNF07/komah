/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false, // Cukup dipendekkan begini saja untuk Next.js 15!
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;