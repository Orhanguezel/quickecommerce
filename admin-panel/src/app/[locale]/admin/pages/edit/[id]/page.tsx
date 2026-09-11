import EditPage from "@/components/screen/admin-section/pages/EditPage";


type Props = {params: Promise<{ id: string }>;};
const EditPages = async ({ params }: Props) => {
    const param = await params;

  return (
    <EditPage ID={param.id} />
  );
};
export default EditPages;
