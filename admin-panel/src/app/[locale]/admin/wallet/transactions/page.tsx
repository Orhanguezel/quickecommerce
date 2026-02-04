import CustomLayout from "@/components/layout/CustomLayout";
import TransactionHistory from "@/components/screen/admin-section/wallet/transaction-history";


const TransactionHistoryRoot = () => {
  return (
    <CustomLayout>
      <TransactionHistory />
    </CustomLayout>
  );
};

export default TransactionHistoryRoot;