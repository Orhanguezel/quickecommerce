import SellerDetails from "@/components/screen/admin-section/seller/SellerDetails";


type Props = {params: Promise<{ id: string }>;};
const SellerDetailsPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <>
      <SellerDetails ID={param.id} />
    </>
  );
};

export default SellerDetailsPage;