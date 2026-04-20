import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdfkit'],
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/clerk-proxy/:path*",
        destination: "https://clerk.prysme.app/:path*",
      },
    ];
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "localhost:3001",
        "*.app.github.dev",
        "*.github.dev",
        "*.vercel.app",
        "prysme.app",
        "www.prysme.app",
      ],
    },
  },
};

export default nextConfig;
