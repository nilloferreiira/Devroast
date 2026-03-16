import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    hours: {
      stale: 300,
      revalidate: 3600,
      expire: 86400,
    },
  },
};

export default nextConfig;
