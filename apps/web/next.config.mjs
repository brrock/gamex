/** @type {import('next').NextConfig} */
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";
import path from 'path';

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
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  webpack: (config, { isServer, dev }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];

      // Check if building for edge runtime
      const isEdge = config.name === 'edge';
      
      if (isEdge) {
        // Specific optimizations for edge bundles
        config.optimization = {
          ...config.optimization,
          minimize: true,
          usedExports: true,
          sideEffects: true,
          concatenateModules: true,
          splitChunks: {
            chunks: 'all',
            minSize: 5000,
            maxSize: 25000,
            cacheGroups: {
              default: false,
              defaultVendors: false,
              // Special handling for the api package
              api: {
                test: /[\\/]packages[\\/]api[\\/]/,
                name: 'api-chunk',
                priority: 20,
                reuseExistingChunk: true,
                enforce: true
              },
            },
          },
        };

        // Add special handling for the api package
        config.module = {
          ...config.module,
          rules: [
            ...config.module.rules,
            {
              test: /[\\/]packages[\\/]api[\\/]/,
              sideEffects: false,
            }
          ]
        };
      }
    }

    // Enhanced module resolution
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        // Explicitly alias the api package
        api: path.resolve(process.cwd(), 'packages/api/src'),
      },
      fallback: {
        ...config.resolve.fallback,
        stream: false,
        tls: false,
        net: false,
        crypto: false,
        fs: false,
        path: false,
        os: false,
      },
    };

    return config;
  },
};

export default nextConfig;
