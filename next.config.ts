import type { NextConfig } from "next";

/**
 * SECURITY NOTE
 * N8N_DISPUTE_URL, N8N_CASES_URL and N8N_API_KEY are server-only.
 * They are read exclusively inside app/api/* route handlers via process.env
 * and are never prefixed with NEXT_PUBLIC_, so Next.js never inlines them
 * into client bundles.
 */
const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Dev only: lets you open the dev server by your network IP (e.g. from a phone)
  // as well as localhost. Update the IP if your network address changes.
  allowedDevOrigins: ["192.168.29.199"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
