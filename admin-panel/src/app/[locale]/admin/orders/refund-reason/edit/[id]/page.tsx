import CustomLayout from "@/components/layout/CustomLayout";
import EditRefundReason from "@/components/screen/admin-section/orders/refund-reason/EditRefundReason";


type Props = {params: Promise<{ id: string }>;};
const EditCouponPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <CustomLayout>
      <EditRefundReason ID={param.id} />
    </CustomLayout>
  );
};

export default EditCouponPage;
