import EditDepartment from "@/components/screen/admin-section/ticket/department/EditDepartment";


type Props = {params: Promise<{ id: string }>;};
const EditDepartmentPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <EditDepartment ID={param.id} />
  );
};
export default EditDepartmentPage;
