"use client";

import { useThemeConfig } from "@/modules/theme/use-theme-config";
import { HeaderVariant1 } from "./header-variant-1";
import { HeaderVariant2 } from "./header-variant-2";

/**
 * Header Variant Selector
 * Tema ayarlarına göre farklı header varyantları gösterir
 *
 * Mevcut Varyantlar:
 * - "1": HeaderVariant1 (Varsayılan - 3-tier layout: topbar, main, nav)
 * - "2": HeaderVariant2 (Basit - Coming soon)
 * - "3": HeaderVariant3 (Minimal - Coming soon)
 */
export function Header() {
  const { headerConfig, isLoading } = useThemeConfig();

  // Loading state - varsayılan variant göster
  if (isLoading) {
    return <HeaderVariant1 />;
  }

  // Variant selector (backend "01", "02", "03" formatında gönderiyor)
  switch (headerConfig.headerNumber) {
    case "01":
    case "1":
      return <HeaderVariant1 />;

    case "02":
    case "2":
      return <HeaderVariant2 />;

    // Gelecekte eklenecek varyantlar:
    // case "03":
    // case "3":
    //   return <HeaderVariant3 />;

    default:
      return <HeaderVariant1 />;
  }
}
