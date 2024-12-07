/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["ui", "api", "database"],
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      if (config.name === 'edge') {
        // Optimize for edge
        config.optimization = {
          ...config.optimization,
          minimize: true,
          splitChunks: {
            chunks: 'all',
            minSize: 5000,
            maxSize: 40000,
          }
        };
      }
    }

    // Add Node polyfills
    config.resolve.fallback = {
      ...config.resolve.fallback,
      stream: false,
      crypto: false,
      fs: false,
      os: false,
      path: false,
    };

    return config;
  },
};

export default nextConfig;