import EditFlashDeals from "@/components/screen/admin-section/promotional/flash-deals/EditFlashDeals";


type Props = {params: Promise<{ id: string }>;};
const EditFlashDealsPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <>
      <EditFlashDeals ID={param.id} />
    </>
  );
};

export default EditFlashDealsPage;