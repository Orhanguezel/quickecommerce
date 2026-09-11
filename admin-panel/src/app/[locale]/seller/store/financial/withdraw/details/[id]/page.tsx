import WithdrawDetails from "@/components/screen/seller-section/store/financial/withdraw/request/WithdrawDetails";


type Props = {params: Promise<{ id: string }>;};
const WithdrawDetailsPage = async ({ params }: Props) => {
  const param = await params;
  return (
    <WithdrawDetails ID={param.id} />
  );
};
export default WithdrawDetailsPage;