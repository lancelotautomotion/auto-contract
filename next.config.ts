import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdfkit'],
  typescript: {
    ignoreBuildErrors: true,
  },
  // Turbopack is default in Next.js 16; canvas alias not needed client-side
  turbopack: {},
  async rewrites() {
    return [
      {
        source: "/clerk-proxy/:path*",
        destination: "https://clerk.kordia.fr/:path*",
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
        "kordia.fr",
        "www.kordia.fr",
      ],
    },
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG ?? "lancelotautomation",
  project: process.env.SENTRY_PROJECT ?? "javascript-nextjs",
  silent: false,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: false,
  automaticVercelMonitors: false,
});
