import CustomLayout from "@/components/layout/CustomLayout";
import EditDepartment from "@/components/screen/admin-section/ticket/department/EditDepartment";


type Props = {params: Promise<{ id: string }>;};
const EditDepartmentPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <CustomLayout>
      <EditDepartment ID={param.id} />
    </CustomLayout>
  );
};
export default EditDepartmentPage;
