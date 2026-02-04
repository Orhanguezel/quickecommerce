import CustomLayout from "@/components/layout/CustomLayout";
import StoreView from "@/components/screen/admin-section/store/StoreView";


type Props = {params: Promise<{ id: string }>;};
const StoreViewPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <CustomLayout>
      <StoreView ID={param.id} />
    </CustomLayout>
  );
};
export default StoreViewPage;