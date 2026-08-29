import EditArea from "@/components/screen/admin-section/business-operations/area/EditArea";


type Props = { params: Promise<{id: string }> };
const EditAreaPage = async ({ params }: Props) => {
  const param = await params;

  return (
    <EditArea ID={param.id} />
  );
};
export default EditAreaPage;
