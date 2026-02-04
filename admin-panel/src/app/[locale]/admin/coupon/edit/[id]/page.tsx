import CustomLayout from "@/components/layout/CustomLayout";
import EditCoupon from "@/components/screen/admin-section/coupon/EditCoupon";
 


type Props = {params: Promise<{ id: string }>;};
const EditCouponPage = async ({ params }: Props ) => {
   const param = await params;
  return (
    <CustomLayout>
      <EditCoupon ID={param.id} />
    </CustomLayout>
  );
};

export default EditCouponPage;
