import CustomLayout from "@/components/layout/CustomLayout";
import EditCustomer from "@/components/screen/admin-section/customer/customer-list/EditCustomer";
 
type Props = {params: Promise<{ id: string }>;};
const EditCustomerPage = async ({ params }: Props) => {
  const param = await params;
  return (
    <>
      <CustomLayout>
        <EditCustomer ID={param.id} />
      </CustomLayout>
    </>
  );
};

export default EditCustomerPage;