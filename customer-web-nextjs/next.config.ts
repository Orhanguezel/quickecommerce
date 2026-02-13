import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const imageHost = process.env.NEXT_IMAGE_HOST ?? "sportoonline.com";

const apiUrl = process.env.NEXT_PUBLIC_REST_API_ENDPOINT ?? "https://sportoonline.com/api/v1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async redirects() {
    return [];
  },
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  images: {
    unoptimized: true, // Development'da localhost resimlerini yüklemek için gerekli
    remotePatterns: [
      {
        protocol: "https",
        hostname: imageHost,
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
