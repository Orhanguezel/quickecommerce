import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const imageHost = process.env.NEXT_IMAGE_HOST ?? "sportoonline.com";

const apiUrl = process.env.NEXT_PUBLIC_REST_API_ENDPOINT ?? "https://sportoonline.com/api/v1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.sportoonline.com" }],
        destination: "https://sportoonline.com/:path*",
        permanent: true,
      },
      {
        source: "/",
        destination: "/tr",
        permanent: true,
      },
      {
        source: "/:locale/stores/details/:slug",
        destination: "/:locale/magaza/:slug",
        permanent: true,
      },
      {
        source: "/:locale/store/details/:slug",
        destination: "/:locale/magaza/:slug",
        permanent: true,
      },
      {
        source: "/:locale/product-details/:slug",
        destination: "/:locale/urun/:slug",
        permanent: true,
      },
      {
        source: "/:locale/products/details/:slug",
        destination: "/:locale/urun/:slug",
        permanent: true,
      },
      {
        source: "/stores/details/:slug",
        destination: "/tr/magaza/:slug",
        permanent: true,
      },
      {
        source: "/store/details/:slug",
        destination: "/tr/magaza/:slug",
        permanent: true,
      },
      {
        source: "/product-details/:slug",
        destination: "/tr/urun/:slug",
        permanent: true,
      },
      {
        source: "/products/details/:slug",
        destination: "/tr/urun/:slug",
        permanent: true,
      },
    ];
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
          {
            // microphone=(self): sesli arama (Web Speech API) icin ZORUNLU.
            // "microphone=()" mikrofonu kendi origin'ine bile kapatiyor ve
            // Chrome SpeechRecognition'i sessizce "not-allowed" ile dusuruyordu.
            key: "Permissions-Policy",
            value: "camera=(), microphone=(self), geolocation=()",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      ...["/sitemap.xml", "/sitemap_index.xml", "/robots.txt", "/llms.txt", "/llms-full.txt"].map((source) => ({
        source,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      })),
    ];
  },
  images: {
    // Production must use Next's responsive image pipeline. Local development
    // keeps direct URLs so localhost media remains easy to inspect.
    unoptimized: process.env.NODE_ENV !== "production",
    deviceSizes: [384, 640, 750, 828, 1080, 1200, 1366, 1440, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 220, 256, 384],
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
