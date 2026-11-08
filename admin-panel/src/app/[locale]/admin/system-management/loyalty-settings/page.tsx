import { redirect } from "next/navigation";

export default async function LegacyLoyaltySettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/admin/loyalty/settings`);
}
