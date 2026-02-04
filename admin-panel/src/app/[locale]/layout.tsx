//app/[locale]/layout.tsx
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import Script from "next/script";
import { ReactNode, use } from "react";

export const dynamicParams = false;
export const revalidate = 3600;

export async function generateStaticParams() {
  return [{ locale: "tr" }, { locale: "en" }];
}



export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const messages = use(getMessages({ locale }));
  const dir = "ltr";

  return (
    <div dir={dir}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
      />
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </div>
  );
}
