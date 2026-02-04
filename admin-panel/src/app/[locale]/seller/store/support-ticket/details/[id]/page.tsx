import CustomLayout from "@/components/layout/CustomLayout";
import SupportTicketDetails from "@/components/screen/seller-section/store/support-ticket/SupportTicketDetails";


type Props = {params: Promise<{ id: string }>;};
const SupportTicketDetailsPage = async ({ params }: Props) => {
   const param = await params;
  return (
    <>
      <CustomLayout>
        <SupportTicketDetails ID={param.id} />
      </CustomLayout>
    </>
  );
};

export default SupportTicketDetailsPage;