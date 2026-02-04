
import CustomLayout from "@/components/layout/CustomLayout";
import JoinDeals from "@/components/screen/seller-section/store/promotional/flash-deals/join-deals/JoinDeals";


type Props = {params: Promise<{ id: string }>;};
const EditSupportTicketPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <CustomLayout>
      <JoinDeals ID={param.id} />
    </CustomLayout>
  );
};
export default EditSupportTicketPage;