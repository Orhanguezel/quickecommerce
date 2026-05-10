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
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value:
              "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
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
