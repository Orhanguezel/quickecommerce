"use client";

import { useEffect } from "react";
import { useThemeQuery } from "@/modules/theme/theme.service";

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Converts hex color to HSL format for CSS variables
 * @param hex - Hex color code (e.g., "#FF6631")
 * @returns HSL string (e.g., "20 100% 60%")
 */
function hexToHSL(hex: string): string {
  // Remove # if present
  hex = hex.replace("#", "");

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lVal = Math.round(l * 100);

  return `${h} ${s}% ${lVal}%`;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { data: themeData, isLoading, error } = useThemeQuery();

  useEffect(() => {
    if (!themeData?.theme_data) return;

    const theme = themeData.theme_data;
    const colors = theme.theme_style?.[0]?.colors?.[0];

    if (colors) {
      const root = document.documentElement;

      // Set primary color with !important to override defaults
      if (colors.primary) {
        const primaryHSL = hexToHSL(colors.primary);
        root.style.setProperty("--primary", primaryHSL, "important");
        root.style.setProperty("--ring", primaryHSL, "important");

        // Adjust primary-foreground based on lightness (>65% = light bg needs dark text)
        const lightness = parseInt(primaryHSL.split("%")[1]);
        const fgColor = lightness > 65 ? "222.2 47.4% 11.2%" : "210 40% 98%";
        root.style.setProperty("--primary-foreground", fgColor, "important");

        // Header navigation bar: primary color background
        root.style.setProperty("--header-nav-bg", primaryHSL, "important");
        root.style.setProperty("--header-nav-text", fgColor, "important");
      }

      // Set secondary color (used for accents)
      if (colors.secondary) {
        const secondaryHSL = hexToHSL(colors.secondary);
        root.style.setProperty("--accent", secondaryHSL, "important");

        // Adjust accent-foreground based on lightness (>65% = light bg needs dark text)
        const lightness = parseInt(secondaryHSL.split("%")[1]);
        const fgColor = lightness > 65 ? "222.2 47.4% 11.2%" : "210 40% 98%";
        root.style.setProperty("--accent-foreground", fgColor, "important");
      }

      // Header top bar: dark background
      root.style.setProperty("--header-topbar-bg", "222 84% 5%", "important");
      root.style.setProperty("--header-topbar-text", "0 0% 100%", "important");

      // Set footer colors if needed
      const footer = theme.theme_footer?.[0];
      if (footer) {
        if (footer.background_color) {
          const footerBgHSL = hexToHSL(footer.background_color);
          root.style.setProperty("--footer-background", footerBgHSL);
        }
        if (footer.text_color) {
          const footerTextHSL = hexToHSL(footer.text_color);
          root.style.setProperty("--footer-foreground", footerTextHSL);
        }
      }
    }
  }, [themeData]);

  return <>{children}</>;
}
