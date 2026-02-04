
import CustomLayout from "@/components/layout/CustomLayout";
import EditEmailTemplate from "@/components/screen/admin-section/email-settings/email-template/EditEmailTemplate";


type Props = {params: Promise<{ id: string }>;};
const EditEmailTemplatePage = async ({ params }: Props) => {
    const param = await params;
  return (
    <CustomLayout>
      <EditEmailTemplate ID={param.id} />
    </CustomLayout>
  );
};
export default EditEmailTemplatePage;