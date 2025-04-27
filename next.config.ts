import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/a/**', // Allow images from Google user content
      },
      // Add other allowed domains here if needed
    ],
  },
  /* other config options here */
};

export default nextConfig;
