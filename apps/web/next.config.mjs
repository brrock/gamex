/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["ui", "api"],
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
