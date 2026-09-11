import EditUnit from "@/components/screen/admin-section/unit/EditUnit";

type Props = {params: Promise<{ id: string }>;};
const EditUnitPage = async ({ params }: Props) => {
   const param =  await params;
  return (
    <>
      <EditUnit ID={param.id} />
    </>
  );
};
export default EditUnitPage;
