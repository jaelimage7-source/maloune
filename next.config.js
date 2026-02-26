const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cc-west-usa.oss-us-west-1.aliyuncs.com' },
      { protocol: 'https', hostname: '*.cjdropshipping.com' },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
