/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure routes that should be dynamically rendered
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Recommended for fixing the SWC dependencies issue
    optimizePackageImports: ["@/components"],
  },
};

export default nextConfig;
