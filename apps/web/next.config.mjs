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
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      self: isServer ? "global" : "self", // Use global in Node.js and self in browsers
    };

    // Define environment-specific variables
    const webpack = require("webpack");
    config.plugins.push(
      new webpack.DefinePlugin({
        "typeof self": JSON.stringify(isServer ? "undefined" : "object"),
      })
    );

    return config;
  },
};

export default nextConfig;
