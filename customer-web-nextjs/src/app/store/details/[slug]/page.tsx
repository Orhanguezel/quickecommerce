import { redirect } from "next/navigation";

export default async function LegacyStoreDetailWithoutLocalePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  redirect(`/tr/magaza/${slug}`);
}
