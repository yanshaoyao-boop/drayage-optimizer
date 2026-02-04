import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // GitHub Pages 部署通常需要 basePath
  basePath: process.env.NODE_ENV === 'production' ? '/drayage-optimizer' : '',
};

export default nextConfig;
