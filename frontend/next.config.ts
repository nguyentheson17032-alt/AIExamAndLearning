import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "40mb",
    },
    middlewareClientMaxBodySize: "40mb",
  },
};

export default nextConfig;