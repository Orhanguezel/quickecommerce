import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LegacyProductsDetailsPage({ params }: PageProps) {
  const { slug } = await params;

  redirect(`/tr/urun/${slug}`);
}
