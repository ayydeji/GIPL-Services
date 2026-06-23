import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Prevent Turbopack from picking ~/package-lock.json as the monorepo root,
  // which causes endless HMR rebuilds and floods the dev log with GET /.
  turbopack: {
    root: projectRoot,
  },
  images: {
    // Allows the placeholder hero photo (images.unsplash.com). Remove once
    // real property photography is hosted, or add additional patterns for
    // wherever final images are served from (e.g. Vercel Blob, S3, a CMS).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
