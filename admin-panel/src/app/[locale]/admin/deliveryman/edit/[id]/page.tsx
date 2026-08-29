import EditDeliveryman from "@/components/screen/admin-section/deliveryman/EditDeliveryman";


type Props = {params: Promise<{ id: string }>;};
const EditDeliverymanPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <>
      <EditDeliveryman ID={param.id} />
    </>
  );
};

export default EditDeliverymanPage;