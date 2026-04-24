import type { Metadata } from "next";
import { UnsubscribeClient } from "./unsubscribe-client";

export const metadata: Metadata = {
  title: "Abonelikten çık",
  robots: { index: false },
};

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function UnsubscribePage({ searchParams }: Props) {
  const sp = await searchParams;
  return <UnsubscribeClient token={sp.token ?? ""} />;
}
