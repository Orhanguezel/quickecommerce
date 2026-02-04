import CustomLayout from "@/components/layout/CustomLayout";
import CustomerList from "@/components/screen/admin-section/customer/customer-list";

const CustomerListRoot = () => {
  return (
    <CustomLayout>
      <CustomerList />
    </CustomLayout>
  );
};

export default CustomerListRoot;