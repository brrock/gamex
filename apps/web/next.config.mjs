/** @type {import('next').NextConfig} */
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";

const nextConfig = {
  // Preserve existing monorepo setup
  transpilePackages: ["ui", "api", "database"],

  experimental: {
    // Existing package imports
    optimizePackageImports: [
      'api',
    ],
    // Add performance optimizations
    turbotrace: {
      contextDirectory: __dirname,
      processCwd: true,
    },
  },

  // Existing output configuration
  output: "standalone",

  // Existing development configurations
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },

  // Enable compression
  compress: true,

  // Enable SWC minification
  swcMinify: true,

  // Combine and enhance webpack configuration
  webpack: (config, { isServer }) => {
    // Preserve Prisma plugin for server
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }

    // Preserve existing fallbacks
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

    // Add optimization configurations
    config.optimization = {
      ...config.optimization,
      minimize: true,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 50000,
        minChunks: 1,
      }
    };

    return config;
  },

  // Minimize API response size
  api: {
    responseLimit: '1mb',
  },
};

export default nextConfig;