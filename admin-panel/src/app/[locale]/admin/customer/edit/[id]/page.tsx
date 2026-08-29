import EditCustomer from "@/components/screen/admin-section/customer/customer-list/EditCustomer";
 
type Props = {params: Promise<{ id: string }>;};
const EditCustomerPage = async ({ params }: Props) => {
  const param = await params;
  return (
    <>
      <EditCustomer ID={param.id} />
    </>
  );
};

export default EditCustomerPage;