import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-sqlite3", "sharp"],
  experimental: { serverActions: { bodySizeLimit: "14mb" } },
  eslint: { ignoreDuringBuilds: true },
  poweredByHeader: false,
  // Put title and description in <head> for every visitor (Next 15 streams them into <body> for non-bots,
  // which Lighthouse and some link-preview fetchers read as "no meta description").
  htmlLimitedBots: /.*/,
};

export default nextConfig;
