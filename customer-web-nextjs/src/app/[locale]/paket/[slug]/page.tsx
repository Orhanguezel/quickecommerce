import type { Metadata } from "next";
import { localizedAlternates } from "@/lib/seo";
import { BundleDetailClient } from "./bundle-detail-client";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  return {
    title: `Paket — ${slug}`,
    // Layout varsayilani (301 donen site koku) miras kalmasin.
    alternates: {
      canonical: `/${locale}/paket/${slug}`,
      languages: localizedAlternates(`/paket/${slug}`),
    },
  };
}

export default async function BundleDetailPage({ params }: Props) {
  const { slug } = await params;
  return <BundleDetailClient slug={slug} />;
}
