import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF where the browser accepts it, WebP otherwise. The optimizer picks the
    // format per request from the Accept header, so one source file serves both.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
