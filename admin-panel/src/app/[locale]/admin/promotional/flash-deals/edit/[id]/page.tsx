import CustomLayout from "@/components/layout/CustomLayout";
import EditFlashDeals from "@/components/screen/admin-section/promotional/flash-deals/EditFlashDeals";


type Props = {params: Promise<{ id: string }>;};
const EditFlashDealsPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <>
      <CustomLayout>
        <EditFlashDeals ID={param.id} />
      </CustomLayout>
    </>
  );
};

export default EditFlashDealsPage;