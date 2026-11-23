import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // This demo is a fully client-rendered frontend, so there is no server-rendered
    // content to validate for instant navigation. Opt out of the automatic warnings.
    instantInsights: {
      validationLevel: "manual-warning",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: "https://pizzahub-server-size.onrender.onrender.com/api/auth/:path*",
      },
    ];
  }
};

export default nextConfig;
