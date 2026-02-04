import CustomLayout from "@/components/layout/CustomLayout";
import EditUnit from "@/components/screen/admin-section/unit/EditUnit";

type Props = {params: Promise<{ id: string }>;};
const EditUnitPage = async ({ params }: Props) => {
   const param =  await params;
  return (
    <>
      <CustomLayout>
        <EditUnit ID={param.id} />
      </CustomLayout>
    </>
  );
};
export default EditUnitPage;
