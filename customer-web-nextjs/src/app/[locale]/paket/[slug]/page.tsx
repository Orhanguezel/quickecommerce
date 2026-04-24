import type { Metadata } from "next";
import { BundleDetailClient } from "./bundle-detail-client";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Paket — ${slug}`,
  };
}

export default async function BundleDetailPage({ params }: Props) {
  const { slug } = await params;
  return <BundleDetailClient slug={slug} />;
}
