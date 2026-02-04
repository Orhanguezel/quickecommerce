import CustomLayout from "@/components/layout/CustomLayout";
import EditStore from "@/components/screen/admin-section/store/EditStore";


type Props = {params: Promise<{ id: string }>;};
const EditStorePage = async ({ params }: Props) => {
    const param = await params;
  return (
    <CustomLayout>
      <EditStore ID={param.id} />
    </CustomLayout>
  );
};
export default EditStorePage;
