import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    // Postingan Jelajahi mengirim hingga 4 foto (sudah dikompres di browser).
    serverActions: {
      bodySizeLimit: "16mb",
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    // Kunci root ke folder proyek. Tanpa ini Turbopack menaiki folder induk
    // dan menemukan package-lock.json di luar repo.
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
