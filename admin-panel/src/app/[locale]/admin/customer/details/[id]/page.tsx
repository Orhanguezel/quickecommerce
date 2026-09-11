import CustomerDetails from "@/components/screen/admin-section/customer/customer-list/CustomerDetails";

type Props = {params: Promise<{ id: string }>;};
const CustomerDetailsPage = async ({ params }: Props) => {
   const param = await params;
  return (
    <CustomerDetails ID={param.id} />
  );
};
export default CustomerDetailsPage;