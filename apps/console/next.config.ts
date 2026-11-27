import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Paquetes del monorepo distribuidos como TypeScript fuente.
  transpilePackages: ['@gravl/domain', '@gravl/ui', '@gravl/mock-data'],
  turbopack: {
    root: '../..',
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
