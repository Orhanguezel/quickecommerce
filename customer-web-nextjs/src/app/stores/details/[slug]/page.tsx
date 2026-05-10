import { redirect } from "next/navigation";

export default async function LegacyStoreDetailsWithoutLocalePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  redirect(`/tr/magaza/${slug}`);
}
