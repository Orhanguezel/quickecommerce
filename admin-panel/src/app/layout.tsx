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

export const dynamic = "force-dynamic";

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
