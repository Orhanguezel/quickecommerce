
import CustomLayout from "@/components/layout/CustomLayout";
import EditDynamicField from "@/components/screen/admin-section/dynamic-fields/EditDynamicField";


type Props = {params: Promise<{ id: string }>;};

const EditDynamicFieldPage = async ({ params }: Props) => {
  const param = await params;
  return (
    <CustomLayout>
      <EditDynamicField ID={param.id} />
    </CustomLayout>
  );
};
export default EditDynamicFieldPage;
