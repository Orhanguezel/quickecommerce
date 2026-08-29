import EditVehicleType from "@/components/screen/admin-section/deliveryman/vehicle-type/EditVehicleType";


type Props = {params: Promise<{ id: string }>;};
const EditVehicleTypePage = async ({ params }: Props) => {
    const param = await params;
  return (
    <>
      <EditVehicleType ID={param.id} />
    </>
  );
};

export default EditVehicleTypePage;