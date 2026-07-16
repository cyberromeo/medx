/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["firebase-admin"],
  async headers() {
    return [
      {
        source: '/notes/:path*',
        has: [
          {
            type: 'query',
            key: 'download',
            value: '1',
          },
        ],
        headers: [
          {
            key: 'Content-Disposition',
            value: 'attachment',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
