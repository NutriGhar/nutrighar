import type { NextConfig } from "next";

// Auto-map Vercel Storage variables if DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.STORAGE_URL_PRISMA_DATABASE_URL ||
    process.env.STORAGE_URL_DATABASE_URL ||
    process.env.STORAGE_URL_POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL;
}

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
