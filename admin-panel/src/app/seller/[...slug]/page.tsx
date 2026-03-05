import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ slug: string[] }>;
}

export default async function SellerNoLocaleCatchAllPage({ params }: Props) {
  const { slug } = await params;
  const target = `/tr/seller/${(slug || []).join("/")}`;
  redirect(target);
}

