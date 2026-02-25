import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry options
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  
  // Only upload source maps in CI
  silent: !process.env.CI,
  
  // Disable source map upload if no auth token
  authToken: process.env.SENTRY_AUTH_TOKEN,
  
  // Automatically tree-shake Sentry logger statements
  disableLogger: true,
});
