import CustomLayout from "@/components/layout/CustomLayout";
import SubscriptionStoreHistory from "@/components/screen/admin-section/business-operations/subscription/store/history";


type Props = {params: Promise<{ id: string }>;};
const SubscriptionStoreHistoryRoot =async  ({ params }: Props) => {
   const param = await params;
  return (
    <CustomLayout>
      <SubscriptionStoreHistory ID={param.id} />
    </CustomLayout>
  );
};

export default SubscriptionStoreHistoryRoot;