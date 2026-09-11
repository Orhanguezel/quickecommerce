import DeliverymanDashboard from "@/components/screen/admin-section/deliveryman/DeliverymanDashboard";


type Props = {params: Promise<{ id: string }>;};
const EditDeliverymanPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <>
      <DeliverymanDashboard ID={param.id} />
    </>
  );
};

export default EditDeliverymanPage;