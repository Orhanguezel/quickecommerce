import CustomLayout from "@/components/layout/CustomLayout";
import EditPage from "@/components/screen/admin-section/pages/EditPage";


type Props = {params: Promise<{ id: string }>;};
const EditPages = async ({ params }: Props) => {
    const param = await params;

  return (
    <CustomLayout>
      <EditPage ID={param.id} />
    </CustomLayout>
  );
};
export default EditPages;
