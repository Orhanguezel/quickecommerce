import EditDynamicField from "@/components/screen/admin-section/dynamic-fields/EditDynamicField";


type Props = {params: Promise<{ id: string }>;};

const EditDynamicFieldPage = async ({ params }: Props) => {
  const param = await params;
  return (
    <EditDynamicField ID={param.id} />
  );
};
export default EditDynamicFieldPage;
