import CustomLayout from "@/components/layout/CustomLayout";
import EditStaff from "@/components/screen/admin-section/staff/EditStaff";


type Props = {params: Promise<{ id: string }>;};
const EditStaffPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <>
      <CustomLayout>
        <EditStaff ID={param.id} />
      </CustomLayout>
    </>
  );
};

export default EditStaffPage;