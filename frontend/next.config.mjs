/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable SWC minification for faster builds
  swcMinify: true,

  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react', 'framer-motion', 'recharts'],
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
      };
    }

    return config;
  },

  // Reduce build output
  productionBrowserSourceMaps: false,

  // Enable React strict mode
  reactStrictMode: true,

  // Optimize fonts
  optimizeFonts: true,
};

export default nextConfig;
