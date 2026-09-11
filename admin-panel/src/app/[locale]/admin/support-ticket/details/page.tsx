import SupportTicketDetails from "@/components/screen/admin-section/support-ticket/SupportTicketDetails";


type Props = {params: Promise<{ id: string }>;};
const SupportTicketDetailsPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <>
      <SupportTicketDetails ID={param.id} />
    </>
  );
};

export default SupportTicketDetailsPage;