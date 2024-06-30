/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['raw.githubusercontent.com', 'a41-official.github.io', 'mainnet-ethereum-avs-metadata.s3.amazonaws.com'], // Add any other domains you need
    },
    eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: true,
    },
  };

export default nextConfig;
