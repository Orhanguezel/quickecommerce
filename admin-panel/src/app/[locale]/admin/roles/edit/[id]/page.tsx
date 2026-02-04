import CustomLayout from "@/components/layout/CustomLayout";
import EditRole from "@/components/screen/admin-section/roles/EditRole";


type Props = {params: Promise<{ id: string }>;};
const EditRolePage = async ({ params }: Props) => {
    const param = await params;

  return (
    <CustomLayout>
      <EditRole ID={param.id} />
    </CustomLayout>
  );
};
export default EditRolePage;
