import JoinDeals from "@/components/screen/seller-section/store/promotional/flash-deals/join-deals/JoinDeals";


type Props = {params: Promise<{ id: string }>;};
const EditSupportTicketPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <JoinDeals ID={param.id} />
  );
};
export default EditSupportTicketPage;