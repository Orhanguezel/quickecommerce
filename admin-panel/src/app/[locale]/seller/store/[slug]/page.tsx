import CustomLayout from "@/components/layout/CustomLayout";
import StoreDashboard from "@/components/screen/seller-section/store/StoreDashboard";


 type Props = { params: Promise<{slug: string }> };
const StoreDashboardRoot = async ({ params }: Props) => {
    const param = await params;

  return (
    <>
      <CustomLayout>
        <StoreDashboard slug={param.slug} />
      </CustomLayout>
    </>
  );
};
export default StoreDashboardRoot;
