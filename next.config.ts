import type { NextConfig } from "next";

// Better Auth is proxied through the client origin so the session/state cookies
// stay first-party. This also avoids third-party cookie blocking on mobile.
// NEXT_PUBLIC_API_URL is inlined at build time, so set it before `next build`.
const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

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
    if (!apiUrl) return [];
    return [
      {
        source: "/api/auth/:path*",
        destination: `${apiUrl}/api/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
