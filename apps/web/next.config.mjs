/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["ui", "api", "database", "clerk-auth-middleware"],
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
   

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
