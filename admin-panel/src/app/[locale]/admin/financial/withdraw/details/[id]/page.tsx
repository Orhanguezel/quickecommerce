
import CustomLayout from "@/components/layout/CustomLayout";
import WithdrawDetails from "@/components/screen/admin-section/financial/withdraw/WithdrawDetails";


type Props = {params: Promise<{ id: string }>;};
const WithdrawDetailsPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <CustomLayout>
      <WithdrawDetails ID={param.id} />
    </CustomLayout>
  );
};
export default WithdrawDetailsPage;