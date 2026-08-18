import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
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
import { ThemePopup } from '@/components/layout/theme-popup';
import { ThemeSideBanner } from '@/components/layout/theme-side-banner';
import { ExitIntentPopup } from '@/components/cart/exit-intent-popup';
import { CartSnapshotSync } from '@/components/cart/cart-snapshot-sync';
import { ExperimentProvider } from '@/components/providers/experiment-provider';
import { AnalyticsProvider } from '@/components/providers/analytics-provider';
import { CookieBanner } from '@/components/cookie-banner';
import { AnalyticsScripts } from '@/components/providers/analytics-scripts';
import { cleanContactPhone, DEFAULT_ORGANIZATION, SITE_URL } from '@/lib/seo';
import type { ThemeResponse } from '@/modules/theme/theme.type';
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

async function getTheme() {
  try {
    const res = await fetch(`${API_URL}/theme`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data as ThemeResponse;
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

const siteUrl = SITE_URL;

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
  const metaTitle = settings?.com_meta_title || siteName;
  const description = settings?.com_meta_description || settings?.com_site_subtitle || 'Online alışveriş platformu';
  const keywords = settings?.com_meta_tags || undefined;
  const ogTitle = settings?.com_og_title || metaTitle;
  const ogDescription = settings?.com_og_description || description;
  const ogImage = settings?.com_og_image || settings?.com_site_logo || undefined;
  const canonicalUrl = settings?.com_canonical_url || siteUrl;
  const author = settings?.com_meta_author || undefined;
  const robots = settings?.com_meta_robots || 'index,follow';
  const publisher = settings?.com_meta_publisher || undefined;
  const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined;
  const bingVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || undefined;

  return {
    title: {
      default: metaTitle,
      template: `%s | ${siteName}`,
    },
    description,
    keywords,
    authors: author ? [{ name: author }] : undefined,
    robots,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      siteName,
      title: ogTitle,
      description: ogDescription,
      locale: locale === 'en' ? 'en_US' : 'tr_TR',
      alternateLocale: locale === 'en' ? 'tr_TR' : 'en_US',
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    verification: googleVerification
      ? {
          google: googleVerification,
          other: bingVerification ? { "msvalidate.01": bingVerification } : undefined,
        }
      : bingVerification
        ? { other: { "msvalidate.01": bingVerification } }
        : undefined,
    ...(publisher ? { other: { publisher } } : {}),
    icons: {
      icon: settings?.com_site_favicon
        ? [{ url: settings.com_site_favicon }]
        : [
            { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
            { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
          ],
      shortcut: settings?.com_site_favicon || '/favicon/favicon.ico',
      apple: [
        { url: '/apple/apple-touch-icon-120x120.png', sizes: '120x120' },
        { url: '/apple/apple-touch-icon-152x152.png', sizes: '152x152' },
        { url: '/apple/apple-touch-icon-167x167.png', sizes: '167x167' },
        { url: '/apple/apple-touch-icon-180x180.png', sizes: '180x180' },
      ],
    },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const [messages, settings, themeResponse] = await Promise.all([
    getMessages({ locale }),
    getSiteSettings(locale),
    getTheme(),
  ]);
  const themeColors = themeResponse?.theme_data?.theme_style?.[0]?.colors?.[0] || null;

  const gaId = settings?.com_google_analytics_id || process.env.NEXT_PUBLIC_GA_ID || '';
  const gtmId = settings?.com_google_tag_manager_id || process.env.NEXT_PUBLIC_GTM_ID || '';
  const googleAdsConversionId = settings?.com_google_ads_conversion_id || process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID || '';
  const googleAdsPurchaseLabel = settings?.com_google_ads_purchase_label || process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL || '';
  // GTM container already owns the GA tag. Loading the same GA measurement ID
  // through gtag.js as well produces duplicate page_view events. When GTM is
  // configured, direct gtag.js is only used for the Google Ads destination.
  const gtagIds = Array.from(new Set([
    ...(gtmId ? [] : [gaId]),
    googleAdsConversionId,
  ].filter(Boolean)));
  const primaryGtagId = gtagIds[0] || '';
  // A GTM container already downloads the Google tag runtime. Queue Ads config
  // on the shared dataLayer instead of downloading a second gtag.js copy.
  const loadDirectGtagRuntime = Boolean(primaryGtagId && !gtmId);
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';

  const isMaintenanceMode = settings?.com_maintenance_mode === 'on';
  const sitePhone = cleanContactPhone(settings?.com_site_contact_number);

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
      <div className="font-sans antialiased">
        <MaintenancePage data={maintenanceData} locale={locale} />
      </div>
    );
  }

  // Generate inline CSS for theme colors (server-side) — only primary/accent, no header overrides
  let themeStyles = '';
  if (themeColors?.primary) {
    try {
      const primaryHSL = hexToHSL(themeColors.primary);
      const accentHSL = hexToHSL(themeColors.secondary || themeColors.primary);
      const primaryLightness = parseInt(primaryHSL.split('%')[1]);
      // Brand green was too light for both text-on-white and white-on-primary
      // (WCAG AA). Preserve hue/saturation while capping its lightness.
      const primaryParts = primaryHSL.match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
      const accessiblePrimaryHSL =
        primaryParts && Number(primaryParts[3]) > 29
          ? `${primaryParts[1]} ${primaryParts[2]}% 29%`
          : primaryHSL;
      const accessiblePrimaryLightness = primaryParts
        ? Math.min(Number(primaryParts[3]), 29)
        : primaryLightness;
      const primaryFgColor = accessiblePrimaryLightness > 65 ? '222.2 47.4% 11.2%' : '210 40% 98%';

      themeStyles = `
      :root {
        --primary: ${accessiblePrimaryHSL};
        --primary-foreground: ${primaryFgColor};
        --accent: ${accentHSL};
        --ring: ${accessiblePrimaryHSL};
      }
    `;
    } catch {
      // ignore theme color errors
    }
  }

  return (
    <>
      {themeStyles && (
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      )}
      <div className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              ...DEFAULT_ORGANIZATION,
              ...(sitePhone ? { telephone: sitePhone } : {}),
              email: settings?.com_site_email || DEFAULT_ORGANIZATION.email,
              ...(sitePhone
                ? {
                    contactPoint: {
                      "@type": "ContactPoint",
                      telephone: sitePhone,
                      email: settings?.com_site_email || DEFAULT_ORGANIZATION.email,
                      contactType: "customer service",
                      areaServed: "TR",
                      availableLanguage: ["tr", "en"],
                    },
                  }
                : {}),
              address: {
                "@type": "PostalAddress",
                streetAddress:
                  settings?.com_site_full_address ||
                  DEFAULT_ORGANIZATION.address.streetAddress,
                addressLocality:
                  settings?.com_site_full_address
                    ? DEFAULT_ORGANIZATION.address.addressLocality
                    : DEFAULT_ORGANIZATION.address.addressLocality,
                addressRegion: DEFAULT_ORGANIZATION.address.addressRegion,
                postalCode: DEFAULT_ORGANIZATION.address.postalCode,
                addressCountry: DEFAULT_ORGANIZATION.address.addressCountry,
              },
              logo: settings?.com_site_logo || DEFAULT_ORGANIZATION.logo,
            }),
          }}
        />
        <AnalyticsScripts
          gtmId={gtmId}
          gtagIds={gtagIds}
          primaryGtagId={primaryGtagId}
          loadDirectGtagRuntime={loadDirectGtagRuntime}
          googleAdsConversionId={googleAdsConversionId}
          googleAdsPurchaseLabel={googleAdsPurchaseLabel}
          metaPixelId={metaPixelId}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider initialTheme={themeResponse} locale={locale}>
            <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
              <ThemeProvider>
                <div className="flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1 overflow-x-hidden" style={{ paddingTop: "var(--theme-popup-top-offset, 0px)" }}>{children}</main>
                  <Footer />
                </div>
                <FloatingCart />
                <CartDrawer />
                <LocationSelector />
                <ChatWidget />
                <ThemePopup />
                <ThemeSideBanner />
                <ExitIntentPopup />
                <CartSnapshotSync />
                <ExperimentProvider>{null}</ExperimentProvider>
                <AnalyticsProvider />
                <CookieBanner apiUrl={API_URL} locale={locale} />
                <ScrollToTop />
              </ThemeProvider>
            </NextThemesProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </div>
    </>
  );
}
