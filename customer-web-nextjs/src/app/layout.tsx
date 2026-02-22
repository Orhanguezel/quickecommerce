import { Metadata } from "next";

interface SiteInfo {
  com_site_title: string;
  com_site_subtitle: string;
  com_site_favicon: string;
  com_site_logo: string;
}

async function fetchSiteInfo(): Promise<SiteInfo | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/site-general-info`,
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sportoonline.com';

  return {
    metadataBase: new URL(siteUrl),
    title: siteInfo?.com_site_title || "Sportoonline",
    description: siteInfo?.com_site_subtitle || "Modern e-commerce platform",
    icons: {
      icon: siteInfo?.com_site_favicon
        ? [{ url: siteInfo.com_site_favicon }]
        : [
            { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
            { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
          ],
      shortcut: siteInfo?.com_site_favicon || '/favicon/favicon.ico',
      apple: siteInfo?.com_site_favicon
        ? [{ url: siteInfo.com_site_favicon }]
        : [
            { url: '/apple/apple-touch-icon-120x120.png', sizes: '120x120' },
            { url: '/apple/apple-touch-icon-152x152.png', sizes: '152x152' },
            { url: '/apple/apple-touch-icon-167x167.png', sizes: '167x167' },
            { url: '/apple/apple-touch-icon-180x180.png', sizes: '180x180' },
          ],
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
