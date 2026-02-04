import CustomLayout from "@/components/layout/CustomLayout";
import EditTag from "@/components/screen/admin-section/tag/EditTag";


type Props = {params: Promise<{ id: string }>;};
const EditTagPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <CustomLayout>
      <EditTag ID={param.id} />
    </CustomLayout>
  );
};
export default EditTagPage;
