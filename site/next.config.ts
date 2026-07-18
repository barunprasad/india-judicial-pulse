import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const nextConfig: NextConfig = {
  output: "export",            // fully static — deploys to any CDN, nothing to keep awake
  images: { unoptimized: true },
  trailingSlash: true,
  // The repo root also has a package-lock.json (the data pipeline); pin the workspace root
  // to this app so Turbopack doesn't infer the parent directory.
  turbopack: { root: dirname(fileURLToPath(import.meta.url)) },
};

export default nextConfig;
