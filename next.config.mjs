/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  env: {
    NEXT_IMAGE_BASE_URL:
      process.env.NEXT_IMAGE_BASE_URL ||
      process.env.NEXT_PUBLIC_IMAGE_BASE_URL ||
      "",
    NEXT_PUBLIC_IMAGE_BASE_URL:
      process.env.NEXT_PUBLIC_IMAGE_BASE_URL ||
      process.env.NEXT_IMAGE_BASE_URL ||
      "",
  },
};

export default nextConfig;

