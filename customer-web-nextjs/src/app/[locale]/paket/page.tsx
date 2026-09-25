import type { Metadata } from "next";
import { localizedAlternates } from "@/lib/seo";
import { BundleListClient } from "./bundle-list-client";

export const metadata: Metadata = {
  title: "Paket Fırsatları",
  description: "Bir arada alındığında daha uygun fiyatlı paket ürünler.",
  // Kendi canonical'i yokken layout varsayilani (301 donen site koku) miras
  // kaliyordu; Google sayfayi ana sayfanin kopyasi sayiyordu.
  alternates: {
    canonical: "/tr/paket",
    languages: localizedAlternates("/paket"),
  },
};

export default function BundleListPage() {
  return <BundleListClient />;
}
