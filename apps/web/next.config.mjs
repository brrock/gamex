/** @type {import('next').NextConfig} */

const nextConfig = {
  // Preserve existing monorepo setup
  transpilePackages: ["ui", "api", "database"],

  experimental: {
    // Existing package imports
    optimizePackageImports: ['api'],
    // Add modern optimizations
    serverActions: true,
    serverComponentsExternalPackages: [],
  },

  // Existing output configuration
  output: "standalone",

  // Development configurations
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Enable compression
  compress: true,

  // Enable SWC minification
  swcMinify: true,

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Add Prisma plugin for server
    if (isServer) {
      config.plugins = [...(config.plugins || []), new PrismaPlugin()];
    }

    // Enhanced fallbacks
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      stream: false,
      tls: false,
      net: false,
      crypto: false,
    };

    // Optimized chunking configuration
    config.optimization = {
      ...(config.optimization || {}),
      minimize: true,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 50000,
        minChunks: 1,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    };

    return config;
  },

  // API configuration
  api: {
    responseLimit: '1mb',
    bodyParser: {
      sizeLimit: '1mb',
    },
  },

  // Add proper module imports
  

export default nextConfig;