import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { QueryProvider } from '@/lib/query-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MaintenancePage } from '@/components/maintenance-page';
import { Geist } from 'next/font/google';
import '../globals.css';

const API_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT || 'https://sportoonline.com/api/v1';

async function getSiteSettings(locale: string) {
  try {
    const res = await fetch(`${API_URL}/site-general-info`, {
      headers: { 'X-localization': locale },
      cache: 'no-store',
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
      cache: 'no-store',
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

  const [messages, settings] = await Promise.all([getMessages(), getSiteSettings(locale)]);

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

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} font-sans antialiased`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
