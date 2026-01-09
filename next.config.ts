import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,  // Required for media streams - StrictMode causes double-mount that kills stream
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
