import CustomLayout from "@/components/layout/CustomLayout";
import BundleForm from "@/components/screen/admin-section/bundles/BundleForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBundlePage({ params }: Props) {
  const { id } = await params;
  return (
    <CustomLayout>
      <BundleForm bundleId={Number(id)} />
    </CustomLayout>
  );
}
