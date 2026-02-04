
import CustomLayout from "@/components/layout/CustomLayout";
import CustomerDetails from "@/components/screen/admin-section/customer/customer-list/CustomerDetails";

type Props = {params: Promise<{ id: string }>;};
const CustomerDetailsPage = async ({ params }: Props) => {
   const param = await params;
  return (
    <CustomLayout>
      <CustomerDetails ID={param.id} />
    </CustomLayout>
  );
};
export default CustomerDetailsPage;