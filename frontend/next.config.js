/** @type {import('next').NextConfig} */
const nextConfig = {
  // E2E 테스트 시에는 Static Export 비활성화
  output: process.env.DISABLE_STATIC_EXPORT ? undefined : 'export',
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@policy-flow/contracts'],
};

module.exports = nextConfig;
