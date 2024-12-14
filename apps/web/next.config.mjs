/** @type {import('next').NextConfig} */
const nextConfig = {
  // Preserve existing monorepo setup
  transpilePackages: ["ui", "api", "database"],

  // Output standalone to reduce Edge Function size
  output: 'standalone',

  experimental: {
    // Existing package imports
    optimizePackageImports: ["api"],
    // Optimize CSS for smaller bundle size
    optimizeCss: true,
  },

  // Use SWC minify for better performance
  swcMinify: true,

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Webpack configuration
  webpack: (config, {  }) => {
    // Enhanced fallbacks
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      stream: false,
      tls: false,
      net: false,
      crypto: false,
      self: false,
    };

    // Optimize for Edge Functions
    

    return config;
  },
};

export default nextConfig;

