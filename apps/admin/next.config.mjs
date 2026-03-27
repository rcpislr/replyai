const nextConfig = {
  basePath: '/admin',
  transpilePackages: ['@replyai/ui-base', '@replyai/ui-dashboard', '@replyai/shared'],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
