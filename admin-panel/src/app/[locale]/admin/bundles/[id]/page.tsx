import BundleForm from "@/components/screen/admin-section/bundles/BundleForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBundlePage({ params }: Props) {
  const { id } = await params;
  return (
    <BundleForm bundleId={Number(id)} />
  );
}
