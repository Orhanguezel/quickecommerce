import CustomLayout from "@/components/layout/CustomLayout";
import SellerDetails from "@/components/screen/admin-section/seller/SellerDetails";


type Props = {params: Promise<{ id: string }>;};
const SellerDetailsPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <>
      <CustomLayout>
        <SellerDetails ID={param.id} />
      </CustomLayout>
    </>
  );
};

export default SellerDetailsPage;