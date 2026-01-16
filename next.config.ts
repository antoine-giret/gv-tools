import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard/stats',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [new URL('https://backend.geovelo.fr/media/**')]
  }
};

export default nextConfig;
