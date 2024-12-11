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

    return config;
  },
};

export default nextConfig;
