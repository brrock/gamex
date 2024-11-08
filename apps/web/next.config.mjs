/** @type {import('next').NextConfig} */
import { PrismaPlugin} from "@prisma/nextjs-monorepo-workaround-plugin"
const nextConfig = {
transpilePackages: ["ui", "api", "database"],
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()]
    }
    return config
  }
};

export default nextConfig;
