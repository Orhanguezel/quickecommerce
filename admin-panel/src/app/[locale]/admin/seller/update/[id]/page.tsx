import EditSeller from "@/components/screen/admin-section/seller/EditSeller";


type Props = {params: Promise<{ id: string }>;};
const UpdateSellerPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <>
      <EditSeller ID={param.id} />
    </>
  );
};

export default UpdateSellerPage;