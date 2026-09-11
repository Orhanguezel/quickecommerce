import EditStaff from "@/components/screen/admin-section/staff/EditStaff";


type Props = {params: Promise<{ id: string }>;};
const EditStaffPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <>
      <EditStaff ID={param.id} />
    </>
  );
};

export default EditStaffPage;