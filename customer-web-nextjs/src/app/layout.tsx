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

  return {
    title: siteInfo?.com_site_title || "Sportoonline",
    description: siteInfo?.com_site_subtitle || "Modern e-commerce platform",
    icons: {
      icon: siteInfo?.com_site_favicon || "/favicon.ico",
      shortcut: siteInfo?.com_site_favicon || "/favicon.ico",
      apple: siteInfo?.com_site_favicon || "/favicon.ico",
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
