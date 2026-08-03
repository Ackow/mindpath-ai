/** @type {import('next').NextConfig} */
const isProductionBuild = process.env.NODE_ENV === 'production';

const nextConfig = {
  // GitHub Pages 需要静态导出；本地 `next dev` 不启用它，
  // 避免 Next 14 在开发模式误判 catch-all 动态路由缺少静态参数。
  // GitHub Pages requires a static export. Keep it disabled in development so
  // Next can serve the catch-all learning route normally.
  output: isProductionBuild ? 'export' : undefined,
  // Separate dev and production build artifacts to prevent cache conflicts.
  distDir: isProductionBuild ? '.next' : '.next-dev',
  images: {
    unoptimized: true,
  },
  // 如果部署在 GitHub Pages 子路径，请解除下一行注释并修改为您的仓库名
  // basePath: process.env.NODE_ENV === 'production' ? '/AILearning' : '',
  reactStrictMode: true,
};

export default nextConfig;
