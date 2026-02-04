import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  // 如果部署在 https://<user>.github.io/<repo>/，需要开启 basePath
  basePath: '/drayage-optimizer',
};

export default nextConfig;
