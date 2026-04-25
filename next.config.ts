import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/items", destination: "/crafting", permanent: true },
      { source: "/items/:path*", destination: "/crafting", permanent: true },
    ]
  },
};

export default nextConfig;
