import EditTag from "@/components/screen/admin-section/tag/EditTag";


type Props = {params: Promise<{ id: string }>;};
const EditTagPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <EditTag ID={param.id} />
  );
};
export default EditTagPage;
