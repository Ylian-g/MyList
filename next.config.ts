import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "cdn.myanimelist.net" },
      { hostname: "media.rawg.io" },
    ],
  },
};

export default nextConfig;
