import EditAttribute from "@/components/screen/admin-section/attribute/EditAttribute";

type Props = { params: Promise<{ id: string }> };
const EditAttributePage = async ({ params }: Props) => {
  const param = await params;

  return (
    <>
      <EditAttribute ID={param.id} />
    </>
  );
};

export default EditAttributePage;
