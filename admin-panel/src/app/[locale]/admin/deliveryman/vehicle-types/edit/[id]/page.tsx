import CustomLayout from "@/components/layout/CustomLayout";
import EditVehicleType from "@/components/screen/admin-section/deliveryman/vehicle-type/EditVehicleType";


type Props = {params: Promise<{ id: string }>;};
const EditVehicleTypePage = async ({ params }: Props) => {
    const param = await params;
  return (
    <>
      <CustomLayout>
        <EditVehicleType ID={param.id} />
      </CustomLayout>
    </>
  );
};

export default EditVehicleTypePage;