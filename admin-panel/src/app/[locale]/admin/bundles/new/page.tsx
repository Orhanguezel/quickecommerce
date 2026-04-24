import CustomLayout from "@/components/layout/CustomLayout";
import BundleForm from "@/components/screen/admin-section/bundles/BundleForm";

export default function NewBundlePage() {
  return (
    <CustomLayout>
      <BundleForm bundleId={null} />
    </CustomLayout>
  );
}
