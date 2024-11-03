/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["ui"],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
