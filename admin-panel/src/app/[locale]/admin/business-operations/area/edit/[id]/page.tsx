import CustomLayout from "@/components/layout/CustomLayout";
import EditArea from "@/components/screen/admin-section/business-operations/area/EditArea";


type Props = { params: Promise<{id: string }> };
const EditAreaPage = async ({ params }: Props) => {
  const param = await params;

  return (
    <CustomLayout>
      <EditArea ID={param.id} />
    </CustomLayout>
  );
};
export default EditAreaPage;
