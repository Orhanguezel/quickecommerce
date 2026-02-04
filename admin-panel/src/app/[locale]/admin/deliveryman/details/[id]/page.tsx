import CustomLayout from "@/components/layout/CustomLayout";
import DeliverymanDashboard from "@/components/screen/admin-section/deliveryman/DeliverymanDashboard";


type Props = {params: Promise<{ id: string }>;};
const EditDeliverymanPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <>
      <CustomLayout>
        <DeliverymanDashboard ID={param.id} />
      </CustomLayout>
    </>
  );
};

export default EditDeliverymanPage;