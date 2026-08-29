import EditRole from "@/components/screen/admin-section/roles/EditRole";


type Props = {params: Promise<{ id: string }>;};
const EditRolePage = async ({ params }: Props) => {
    const param = await params;

  return (
    <EditRole ID={param.id} />
  );
};
export default EditRolePage;
