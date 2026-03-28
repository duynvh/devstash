import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  devIndicators: false,
  transpilePackages: ['react-markdown', 'remark-gfm'],
};

export default nextConfig;
