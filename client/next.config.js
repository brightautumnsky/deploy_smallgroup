/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "www.gravatar.com",
      "localhost",
      "ec2-13-230-14-134.ap-northeast-1.compute.amazonaws.com",
    ],
  },
};

module.exports = nextConfig;
