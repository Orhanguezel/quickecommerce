import UpdateStoreType from "@/components/screen/admin-section/business-operations/store-type/UpdateStoreType";


type Props = {params: Promise<{ id: string }>;};
const UpdateStoreTypePage = async ({ params }: Props) => {
  const param = await params;
  return (
    <>
      <UpdateStoreType ID={param.id} />
    </>
  );
};

export default UpdateStoreTypePage;
