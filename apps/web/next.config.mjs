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
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  webpack: (config, { isServer, dev }) => {
    if (isServer && !dev) {
      // Add Prisma plugin
      config.plugins = [...config.plugins, new PrismaPlugin()];
      
      // Edge function specific optimizations
      config.optimization = {
        ...config.optimization,
        minimize: true,
        minimizer: [
          ...config.optimization.minimizer || [],
          new TerserPlugin({
            terserOptions: {
              compress: {
                unused: true,
                dead_code: true,
                passes: 2,
              },
              mangle: true,
            },
          }),
        ],
        // Disable used exports for better tree shaking
        usedExports: true,
        // Aggressive chunk splitting for edge
        splitChunks: {
          chunks: 'all',
          minSize: 5000,
          maxSize: 25000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };

      // Enable module concatenation
      config.optimization.concatenateModules = true;
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
        fs: false,
        path: false,
        os: false,
      },
    };

    return config;
  },
};

export default nextConfig;
