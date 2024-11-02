/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["ui"],
    typescript: {
        ignoreBuildErrors: true,
        ignoreDuringBuilds: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
