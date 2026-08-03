/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // 如果部署在 GitHub Pages 子路径，请解除下一行注释并修改为您的仓库名
  // basePath: process.env.NODE_ENV === 'production' ? '/AILearning' : '',
  reactStrictMode: true,
};

export default nextConfig;
