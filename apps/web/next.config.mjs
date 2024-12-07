/** @type {import('next').NextConfig} */
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";

const nextConfig = {
  transpilePackages: ["ui", "api", "database"],
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Optimize packages
    optimizePackageImports: ['api'],
    // Enable edge runtime optimizations
    serverActions: {
      bodySizeLimit: '2mb' // Adjust based on needs
    }
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Add Prisma plugin
      config.plugins = [...config.plugins, new PrismaPlugin()];
      
      // Edge function specific optimizations
      config.optimization = {
        ...config.optimization,
        // Ensure proper tree shaking
        usedExports: true,
        // Optimize chunks for edge
        splitChunks: {
          chunks: 'all',
          minSize: 10000,
          maxSize: 40000
        }
      };
    }

    // Add fallback configurations
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        stream: false,
        tls: false,
        net: false,
        crypto: false,
      },
    };

    return config;
  },
};

export default nextConfig;