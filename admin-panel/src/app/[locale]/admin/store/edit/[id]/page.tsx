import EditStore from "@/components/screen/admin-section/store/EditStore";


type Props = {params: Promise<{ id: string }>;};
const EditStorePage = async ({ params }: Props) => {
    const param = await params;
  return (
    <EditStore ID={param.id} />
  );
};
export default EditStorePage;
