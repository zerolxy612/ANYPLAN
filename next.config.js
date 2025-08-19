/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // 启用实验性功能
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 确保路径别名正常工作
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    
    return config;
  },
};

module.exports = nextConfig;
