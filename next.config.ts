import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  distDir: process.env.NUTRICARE_BUILD_DIR || '.next',
  agentRules: false,
};

export default nextConfig;
