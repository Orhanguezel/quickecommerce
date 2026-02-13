import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { QueryProvider } from '@/lib/query-provider';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MaintenancePage } from '@/components/maintenance-page';
import { ChatWidget } from '@/components/chat/chat-widget';
import { FloatingCart } from '@/components/layout/floating-cart';
import { CartDrawer } from '@/components/layout/cart-drawer';
import { LocationSelector } from '@/components/layout/location-selector';
import { ScrollToTop } from '@/components/layout/scroll-to-top';
import { Geist } from 'next/font/google';
import '../globals.css';

const API_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT || 'https://sportoonline.com/api/v1';

const hexToHSL = (hex: string): string => {
  if (!hex) return '0 0% 0%';
  hex = hex.replace('#', '');
  if (hex.length !== 6) return '0 0% 0%';

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
};

async function getThemeColors() {
  try {
    const res = await fetch(`${API_URL}/theme`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.theme_data?.theme_style?.[0]?.colors?.[0] || null;
  } catch {
    return null;
  }
}

async function getSiteSettings(locale: string) {
  try {
    const res = await fetch(`${API_URL}/site-general-info`, {
      headers: { 'X-localization': locale },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.site_settings ?? null;
  } catch {
    return null;
  }
}

async function getMaintenancePageData(locale: string) {
  try {
    const res = await fetch(`${API_URL}/maintenance-page-settings`, {
      headers: { 'X-localization': locale },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.maintenance_settings ?? null;
  } catch {
    return null;
  }
}

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sportoonline.com';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const settings = await getSiteSettings(locale);

  const siteName = settings?.com_site_title || 'Sporto Online';
  const description =
    settings?.com_site_subtitle || 'Online alışveriş platformu — Binlerce üründe en uygun fiyatlar';

  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description,
    metadataBase: new URL(siteUrl),
    openGraph: {
      type: 'website',
      siteName,
      locale: locale === 'en' ? 'en_US' : 'tr_TR',
      alternateLocale: locale === 'en' ? 'tr_TR' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
    },
    icons: {
      icon: settings?.com_site_favicon || '/favicon.ico',
    },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const [messages, settings, themeColors] = await Promise.all([
    getMessages({ locale }),
    getSiteSettings(locale),
    getThemeColors(),
  ]);

  const isMaintenanceMode = settings?.com_maintenance_mode === 'on';

  if (isMaintenanceMode) {
    const maintenancePage = await getMaintenancePageData(locale);

    const maintenanceData = {
      com_maintenance_title: maintenancePage?.com_maintenance_title || '',
      com_maintenance_description: maintenancePage?.com_maintenance_description || '',
      com_maintenance_start_date: maintenancePage?.com_maintenance_start_date || null,
      com_maintenance_end_date: maintenancePage?.com_maintenance_end_date || null,
      com_maintenance_image: maintenancePage?.com_maintenance_image || null,
      site_title: settings?.com_site_title || 'Sporto Online',
      site_logo: settings?.com_site_logo || null,
      site_email: settings?.com_site_email || '',
      site_phone: settings?.com_site_contact_number || '',
    };

    return (
      <html lang={locale} suppressHydrationWarning>
        <body className={`${geistSans.variable} font-sans antialiased`} suppressHydrationWarning>
          <MaintenancePage data={maintenanceData} locale={locale} />
        </body>
      </html>
    );
  }

  // Generate inline CSS for theme colors (server-side) — only primary/accent, no header overrides
  let themeStyles = '';
  if (themeColors?.primary) {
    try {
      const primaryHSL = hexToHSL(themeColors.primary);
      const accentHSL = hexToHSL(themeColors.secondary || themeColors.primary);
      const primaryLightness = parseInt(primaryHSL.split('%')[1]);
      const primaryFgColor = primaryLightness > 65 ? '222.2 47.4% 11.2%' : '210 40% 98%';

      themeStyles = `
      :root {
        --primary: ${primaryHSL};
        --primary-foreground: ${primaryFgColor};
        --accent: ${accentHSL};
        --ring: ${primaryHSL};
      }
    `;
    } catch {
      // ignore theme color errors
    }
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      {themeStyles && (
        <head>
          <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
        </head>
      )}
      <body className={`${geistSans.variable} font-sans antialiased`} suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
              <ThemeProvider>
                <div className="flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
                <FloatingCart />
                <CartDrawer />
                <LocationSelector />
                <ChatWidget />
                <ScrollToTop />
              </ThemeProvider>
            </NextThemesProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
