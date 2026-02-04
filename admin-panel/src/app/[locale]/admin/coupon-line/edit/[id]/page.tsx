import CustomLayout from "@/components/layout/CustomLayout";
import EditCouponLine from "@/components/screen/admin-section/coupon-line/EditCouponLine";
 


type Props = {params: Promise<{ id: string }>;};   
const EditCouponLinePage =async ({ params }: Props) => {
   const param = await params;
  return (
    <CustomLayout>
      <EditCouponLine ID={param.id} />
    </CustomLayout>
  );
};

export default EditCouponLinePage;