import CustomLayout from "@/components/layout/CustomLayout";
import EditAttribute from "@/components/screen/admin-section/attribute/EditAttribute";

type Props = { params: Promise<{ id: string }> };
const EditAttributePage = async ({ params }: Props) => {
  const param = await params;

  return (
    <>
      <CustomLayout>
        <EditAttribute ID={param.id} />
      </CustomLayout>
    </>
  );
};

export default EditAttributePage;
