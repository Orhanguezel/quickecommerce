import EditEmailTemplate from "@/components/screen/admin-section/email-settings/email-template/EditEmailTemplate";


type Props = {params: Promise<{ id: string }>;};
const EditEmailTemplatePage = async ({ params }: Props) => {
    const param = await params;
  return (
    <EditEmailTemplate ID={param.id} />
  );
};
export default EditEmailTemplatePage;