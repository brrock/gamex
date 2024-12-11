/** @type {import('next').NextConfig} */

const nextConfig = {
  // Preserve existing monorepo setup
  transpilePackages: ["ui", "api", "database"],

  experimental: {
    // Existing package imports
    optimizePackageImports: ["api"],
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Enhanced fallbacks
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      stream: false,
      tls: false,
      net: false,
      crypto: false,
      self: false,
    };

    // Optimized chunking configuration
    config.optimization = {
      ...(config.optimization || {}),
      minimize: true,
      splitChunks: {
        chunks: "all",
        minSize: 20000,
        maxSize: 50000,
        minChunks: 1,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
        },
      },
    };

    // Alias to handle `self` issue


    // Define environment-specific variables
   

    return config;
  },
};

export default nextConfig;
