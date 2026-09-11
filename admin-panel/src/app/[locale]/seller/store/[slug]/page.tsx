import StoreDashboard from "@/components/screen/seller-section/store/StoreDashboard";


 type Props = { params: Promise<{slug: string }> };
const StoreDashboardRoot = async ({ params }: Props) => {
    const param = await params;

  return (
    <>
      <StoreDashboard slug={param.slug} />
    </>
  );
};
export default StoreDashboardRoot;
