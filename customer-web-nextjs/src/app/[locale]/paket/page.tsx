import type { Metadata } from "next";
import { BundleListClient } from "./bundle-list-client";

export const metadata: Metadata = {
  title: "Paket Fırsatları",
  description: "Bir arada alındığında daha uygun fiyatlı paket ürünler.",
};

export default function BundleListPage() {
  return <BundleListClient />;
}
