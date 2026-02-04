
import CustomLayout from "@/components/layout/CustomLayout";
import EditSupportTicket from "@/components/screen/seller-section/store/support-ticket/EditSupportTicket";


type Props = {params: Promise<{ id: string }>;};
const EditSupportTicketPage = async ({ params }: Props) => {
   const param = await params;
  return (
    <CustomLayout>
      <EditSupportTicket ID={param.id} />
    </CustomLayout>
  );
};
export default EditSupportTicketPage;