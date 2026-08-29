import EditCouponLine from "@/components/screen/admin-section/coupon-line/EditCouponLine";
 


type Props = {params: Promise<{ id: string }>;};   
const EditCouponLinePage =async ({ params }: Props) => {
   const param = await params;
  return (
    <EditCouponLine ID={param.id} />
  );
};

export default EditCouponLinePage;