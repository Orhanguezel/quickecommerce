import CustomLayout from "@/components/layout/CustomLayout";
import EditDeliveryman from "@/components/screen/admin-section/deliveryman/EditDeliveryman";


type Props = {params: Promise<{ id: string }>;};
const EditDeliverymanPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <>
      <CustomLayout>
        <EditDeliveryman ID={param.id} />
      </CustomLayout>
    </>
  );
};

export default EditDeliverymanPage;