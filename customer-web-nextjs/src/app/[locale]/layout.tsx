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
import { ThemePopup } from '@/components/layout/theme-popup';
import { ThemeSideBanner } from '@/components/layout/theme-side-banner';
import { ExitIntentPopup } from '@/components/cart/exit-intent-popup';
import { CartSnapshotSync } from '@/components/cart/cart-snapshot-sync';
import { ExperimentProvider } from '@/components/providers/experiment-provider';
import { AnalyticsProvider } from '@/components/providers/analytics-provider';
import { CookieBanner } from '@/components/cookie-banner';
import { Geist } from 'next/font/google';
import Script from 'next/script';
import { DEFAULT_ORGANIZATION, SITE_URL } from '@/lib/seo';
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

  const [messages, settings, themeColors] = await Promise.all([
    getMessages({ locale }),
    getSiteSettings(locale),
    getThemeColors(),
  ]);

  const gaId = settings?.com_google_analytics_id || process.env.NEXT_PUBLIC_GA_ID || '';
  const gtmId = settings?.com_google_tag_manager_id || process.env.NEXT_PUBLIC_GTM_ID || '';
  const googleAdsConversionId = settings?.com_google_ads_conversion_id || process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID || '';
  const googleAdsPurchaseLabel = settings?.com_google_ads_purchase_label || process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL || '';
  const gtagIds = Array.from(new Set([gaId].filter(Boolean)));
  const primaryGtagId = gtagIds[0] || '';
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';

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
      <div className={`${geistSans.variable} font-sans antialiased`}>
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
    <>
      {themeStyles && (
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      )}
      <div className={`${geistSans.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              ...DEFAULT_ORGANIZATION,
              telephone:
                settings?.com_site_contact_number ||
                DEFAULT_ORGANIZATION.telephone,
              email: settings?.com_site_email || DEFAULT_ORGANIZATION.email,
              contactPoint: {
                "@type": "ContactPoint",
                telephone:
                  settings?.com_site_contact_number ||
                  DEFAULT_ORGANIZATION.telephone,
                email: settings?.com_site_email || DEFAULT_ORGANIZATION.email,
                contactType: "customer service",
                areaServed: "TR",
                availableLanguage: ["tr", "en"],
              },
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
        {/* Google Tag Manager (noscript) */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}

        {/* Google Tag Manager */}
        {gtmId && (
          <Script id="gtm-script" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        )}

        {/* Google Analytics / Google Ads */}
        {primaryGtagId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${primaryGtagId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-script" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
function sportoonlineAnalyticsConsentGranted(){var cookie=(document.cookie||'')+';';var m=/(?:^|;\\s*)(sportoonline_cookie_consent|cookie_consent|gdpr_cookie_consent|CookieConsent)=([^;]*)/i.exec(cookie);var v=m&&m[2]?decodeURIComponent(m[2]).toLowerCase():'';if(v&&/decline|denied|reject|false|necessary/.test(v))return false;try{var stored=localStorage.getItem('sportoonline_cookie_consent')||localStorage.getItem('cookie_consent')||localStorage.getItem('gdpr_cookie_consent')||'';if(/decline|denied|reject|false|necessary/i.test(stored))return false;}catch(e){}return true;}
gtag('consent','default',{analytics_storage:sportoonlineAnalyticsConsentGranted()?'granted':'denied',ad_storage:sportoonlineAnalyticsConsentGranted()?'granted':'denied',ad_user_data:sportoonlineAnalyticsConsentGranted()?'granted':'denied',ad_personalization:sportoonlineAnalyticsConsentGranted()?'granted':'denied'});
gtag('js',new Date());
${gtagIds.map((id: string) => `gtag('config','${id}');`).join('\n')}
window.__GOOGLE_ADS_CONVERSION_ID__='${googleAdsConversionId}';
window.__GOOGLE_ADS_PURCHASE_LABEL__='${googleAdsPurchaseLabel}';`}
            </Script>
          </>
        )}
        {metaPixelId && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${metaPixelId}');
fbq('track','PageView');`}
          </Script>
        )}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
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
