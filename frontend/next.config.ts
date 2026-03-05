import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const frontendDir =
  typeof __dirname !== "undefined"
    ? path.resolve(__dirname)
    : path.resolve(path.dirname(fileURLToPath(import.meta.url)));

const frontendNodeModules = path.join(frontendDir, "node_modules");

const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${backendUrl}/api/:path*` },
    ];
  },
  turbopack: {
    root: frontendDir,
    resolveAlias: {
      tailwindcss: path.join(frontendNodeModules, "tailwindcss"),
      "tw-animate-css": path.join(frontendNodeModules, "tw-animate-css"),
    },
  },
  webpack: (config) => {
    config.context = frontendDir;
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...config.resolve.alias,
      tailwindcss: path.join(frontendNodeModules, "tailwindcss"),
      "tw-animate-css": path.join(frontendNodeModules, "tw-animate-css"),
    };
    return config;
  },
  images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;
