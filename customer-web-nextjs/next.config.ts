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
            // Tanitio SEO katalogu (2026-09-11): "Content Security Policy: Pasif".
            // Report-Only basligi tarayiciya hicbir kural UYGULATMAZ; yalniz
            // rapor uretir. Enforce'a cevrildi. script-src bilerek `https:`
            // kadar genis tutuldu — GTM konteyneri panelden yeni etiket
            // eklendiginde yeni bir kaynaktan script indirebilir; daraltilmis
            // bir liste olcum/reklam etiketlerini sessizce kirardi. Geri kalan
            // vektorler (object, base, frame ancestors, http kaynaklar) yine
            // de kapatilir.
            // Sonraki adim: layout'taki inline script'lere nonce verip
            // 'unsafe-inline' ve genis https: iznini kaldirmak.
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "object-src 'none'",
              "frame-ancestors 'self'",
              "form-action 'self' https:",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https:",
              "style-src 'self' 'unsafe-inline' https:",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
              "connect-src 'self' https: wss:",
              "frame-src 'self' https:",
              "media-src 'self' data: blob: https:",
              "worker-src 'self' blob:",
              "manifest-src 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          {
            // microphone=(self): sesli arama (Web Speech API) icin ZORUNLU.
            // "microphone=()" mikrofonu kendi origin'ine bile kapatiyor ve
            // Chrome SpeechRecognition'i sessizce "not-allowed" ile dusuruyor.
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
