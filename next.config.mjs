/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["firebase-admin"],
  async rewrites() {
    return [
      {
        source: "/__/auth/action",
        destination: "/reset-password",
      },
    ];
  },
};

export default nextConfig;
