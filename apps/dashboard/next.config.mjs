/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/dashboard',
  transpilePackages: ['@replyai/ui-base', '@replyai/ui-dashboard', '@replyai/shared'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
