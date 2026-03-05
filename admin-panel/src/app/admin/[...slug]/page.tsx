import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ slug: string[] }>;
}

export default async function AdminNoLocaleCatchAllPage({ params }: Props) {
  const { slug } = await params;
  const target = `/tr/admin/${(slug || []).join("/")}`;
  redirect(target);
}

