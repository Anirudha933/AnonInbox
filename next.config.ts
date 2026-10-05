import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker: bundles a self-contained server without needing node_modules
  output: "standalone",
};

export default nextConfig;
