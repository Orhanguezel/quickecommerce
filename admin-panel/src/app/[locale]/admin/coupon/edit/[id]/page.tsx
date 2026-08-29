import EditCoupon from "@/components/screen/admin-section/coupon/EditCoupon";
 


type Props = {params: Promise<{ id: string }>;};
const EditCouponPage = async ({ params }: Props ) => {
   const param = await params;
  return (
    <EditCoupon ID={param.id} />
  );
};

export default EditCouponPage;
