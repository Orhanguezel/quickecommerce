"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import type { ThemeResponse } from "@/modules/theme/theme.type";

export function QueryProvider({
  children,
  initialTheme,
  locale,
}: {
  children: ReactNode;
  initialTheme?: ThemeResponse | null;
  locale?: string;
}) {
  const [client] = useState(
    () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 10,
            gcTime: 1000 * 60 * 30,
            refetchOnWindowFocus: false,
          },
        },
      });
      if (initialTheme && locale) {
        queryClient.setQueryData(["theme", locale], initialTheme);
      }
      return queryClient;
    }
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
