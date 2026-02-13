"use client";

import { useEffect } from "react";
import { useThemeQuery } from "@/modules/theme/theme.service";

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Converts hex color to HSL format for CSS variables
 * @param hex - Hex color code (e.g., "#FF6631")
 * @returns HSL string (e.g., "20 100% 60%") or null if invalid
 */
function hexToHSL(hex: string | undefined): string | null {
  if (!hex) return null;
  hex = hex.replace("#", "");
  if (hex.length !== 6) return null;

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
  const { data: themeData } = useThemeQuery();

  useEffect(() => {
    if (!themeData?.theme_data) return;

    const theme = themeData.theme_data;
    const colors = theme.theme_style?.[0]?.colors?.[0];
    const root = document.documentElement;

    // Primary/accent colors via inline style (same for light & dark)
    if (colors?.primary) {
      const primaryHSL = hexToHSL(colors.primary);
      if (primaryHSL) {
        root.style.setProperty("--primary", primaryHSL);
        root.style.setProperty("--ring", primaryHSL);
        const lightness = parseInt(primaryHSL.split("%")[1]);
        const fgColor = lightness > 65 ? "222.2 47.4% 11.2%" : "210 40% 98%";
        root.style.setProperty("--primary-foreground", fgColor);
      }
    }

    if (colors?.secondary) {
      const secondaryHSL = hexToHSL(colors.secondary);
      if (secondaryHSL) {
        root.style.setProperty("--accent", secondaryHSL);
        const lightness = parseInt(secondaryHSL.split("%")[1]);
        const fgColor = lightness > 65 ? "222.2 47.4% 11.2%" : "210 40% 98%";
        root.style.setProperty("--accent-foreground", fgColor);
      }
    }

    // Header + Footer colors via <style> tag (supports both :root and .dark selectors)
    const lightVars: string[] = [];
    const darkVars: string[] = [];

    const addVar = (list: string[], varName: string, hex: string | undefined) => {
      const hsl = hexToHSL(hex);
      if (hsl) list.push(`${varName}: ${hsl};`);
    };

    // Footer colors
    const footer = theme.theme_footer?.[0];
    if (footer) {
      addVar(lightVars, "--footer-background", footer.background_color);
      addVar(lightVars, "--footer-foreground", footer.text_color);
      addVar(darkVars, "--footer-background", footer.dark_background_color);
      addVar(darkVars, "--footer-foreground", footer.dark_text_color);
    }

    // Header colors
    const header = theme.theme_header?.[0];
    if (header) {
      // Light mode
      addVar(lightVars, "--header-topbar-bg", header.row1_bg);
      addVar(lightVars, "--header-topbar-text", header.row1_text);
      addVar(lightVars, "--header-main-bg", header.row2_bg);
      addVar(lightVars, "--header-nav-bg", header.row3_bg);
      addVar(lightVars, "--header-nav-text", header.row3_text);
      addVar(lightVars, "--header-nav-button-bg", header.row3_button_bg);
      addVar(lightVars, "--header-nav-button-text", header.row3_button_text);

      // Dark mode
      addVar(darkVars, "--header-topbar-bg", header.dark_row1_bg);
      addVar(darkVars, "--header-topbar-text", header.dark_row1_text);
      addVar(darkVars, "--header-main-bg", header.dark_row2_bg);
      addVar(darkVars, "--header-nav-bg", header.dark_row3_bg);
      addVar(darkVars, "--header-nav-text", header.dark_row3_text);
      addVar(darkVars, "--header-nav-button-bg", header.dark_row3_button_bg);
      addVar(darkVars, "--header-nav-button-text", header.dark_row3_button_text);
    }

    // Remove old injected style if exists
    document.getElementById("theme-dynamic-styles")?.remove();

    if (lightVars.length > 0 || darkVars.length > 0) {
      const styleEl = document.createElement("style");
      styleEl.id = "theme-dynamic-styles";
      let css = "";
      if (lightVars.length > 0) {
        css += `:root { ${lightVars.join(" ")} }\n`;
      }
      if (darkVars.length > 0) {
        css += `.dark { ${darkVars.join(" ")} }\n`;
      }
      styleEl.textContent = css;
      document.head.appendChild(styleEl);
    }

    return () => {
      document.getElementById("theme-dynamic-styles")?.remove();
    };
  }, [themeData]);

  return <>{children}</>;
}
