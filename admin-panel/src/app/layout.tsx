// app/layout.tsx
import "@/styles/globals.css";
import "@/styles/table.css";

import { ReactNode } from "react";
import { cookies } from "next/headers";

import JotaiProviders from "@/components/molecules/providers";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/utils/theme-provider";
import { ReduxProvider } from "@/redux/ReduxProvider";
import { GlobalClientLayer } from "@/lib/GlobalClientLayer";
import { QueryProvider } from "@/lib/QueryProvider";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface SiteInfo {
  com_site_title: string;
  com_site_subtitle: string;
  com_site_favicon: string;
  com_site_logo: string;
}

async function fetchSiteInfo(): Promise<SiteInfo | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/v1/site-general-info`,
      {
        next: { revalidate: 3600 }
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.site_settings as SiteInfo;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const siteInfo = await fetchSiteInfo();

  return {
    title: siteInfo?.com_site_title || "QuickEcommerce Admin Panel",
    description: siteInfo?.com_site_subtitle || "E-commerce management platform",
    icons: {
      icon: siteInfo?.com_site_favicon || "/favicon.ico",
      shortcut: siteInfo?.com_site_favicon || "/favicon.ico",
      apple: siteInfo?.com_site_favicon || "/favicon.ico",
    },
  };
}

type Props = { children: ReactNode };

function normalizeLocale(input?: string | null): "tr" | "en" {
  if (input === "en") return "en";
  return "tr";
}

export default async function RootLayout({ children }: Props) {
  const cookieStore = await cookies();

  const rawLocale = cookieStore.get("NEXT_LOCALE")?.value ?? "tr";
  const locale = normalizeLocale(rawLocale);

  const dir = rawLocale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <QueryProvider>
          <ReduxProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider>
                <JotaiProviders>
                  {children}
                  <GlobalClientLayer />
                </JotaiProviders>
              </TooltipProvider>
            </ThemeProvider>
          </ReduxProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
