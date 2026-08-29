import SubscriptionStoreHistory from "@/components/screen/admin-section/business-operations/subscription/store/history";


type Props = {params: Promise<{ id: string }>;};
const SubscriptionStoreHistoryRoot =async  ({ params }: Props) => {
   const param = await params;
  return (
    <SubscriptionStoreHistory ID={param.id} />
  );
};

export default SubscriptionStoreHistoryRoot;