/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /* Allow the build to succeed even if there are lint errors */
  eslint: {
    ignoreDuringBuilds: true,
  },
  /* Allow the build to succeed even if there are type errors */
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
