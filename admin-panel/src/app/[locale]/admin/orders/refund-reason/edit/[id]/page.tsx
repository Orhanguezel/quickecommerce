import EditRefundReason from "@/components/screen/admin-section/orders/refund-reason/EditRefundReason";


type Props = {params: Promise<{ id: string }>;};
const EditCouponPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <EditRefundReason ID={param.id} />
  );
};

export default EditCouponPage;
