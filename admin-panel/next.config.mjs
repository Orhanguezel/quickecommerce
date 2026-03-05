// next.config.mjs
/**
 * quick_ecommerce — Copyright © 2025 BIZMIC
 * Licensed under the CodeCanyon Regular/Extended License.
 * Redistribution or sharing of source code is prohibited.
 * For support: bravosoftltd@gmail.com
 */



import createNextIntlPlugin from "next-intl/plugin";
import fs from "fs";
import path from "path";
import bundleAnalyzer from "@next/bundle-analyzer";

const withNextIntl = createNextIntlPlugin("./src/i18n.tsx");

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true", // Only run when ANALYZE=true
});

const imageHost = process.env.NEXT_IMAGE_HOST ?? "example.com";
const isProdBuild = process.env.NODE_ENV === "production";

export default withBundleAnalyzer(
  withNextIntl({
    reactStrictMode: false,
    trailingSlash: process.env.TRAILING_SLASH === "true",
    experimental: {
      staleTimes: {
        dynamic: 0,
      },
    },
    images: {
      unoptimized: true,
      remotePatterns: [
        {
          protocol: "https",
          hostname: "res.cloudinary.com",
          pathname: "**",
        },
        {
          protocol: "https",
          hostname: "images.unsplash.com",
          pathname: "**",
        },
        {
          protocol: "https",
          hostname: imageHost,
          pathname: "/storage/uploads/media-uploader/default/**",
        },
        {
          protocol: "https",
          hostname: imageHost,
          pathname: "/storage/uploads/chat/**",
        },
        {
          protocol: "https",
          hostname: imageHost,
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

    pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
    output: "standalone", // Hard coded in scripts/postbuild.js
    // Dev'de .next kullan; senkronize edilen build/ klasor cakismlarini engeller.
    // Production build'de scripts/postbuild.js ile uyum icin build/ korunur.
    distDir: isProdBuild ? "build" : ".next",

    webpack: (config) => {
      const swEnvFile = path.resolve("./public/firebase-env.js");

      const envConfig = `
          self.firebaseConfig = {
            apiKey: "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}",
            authDomain: "${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}",
            projectId: "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}",
            storageBucket: "${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}",
            messagingSenderId: "${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}",
            appId: "${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}",
            measurementId: "${process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}",
          };
        `;

      fs.writeFileSync(swEnvFile, envConfig);
      return config;
    },
  })
);
