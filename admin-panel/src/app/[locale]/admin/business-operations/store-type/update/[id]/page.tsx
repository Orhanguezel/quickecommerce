import CustomLayout from "@/components/layout/CustomLayout";
import UpdateStoreType from "@/components/screen/admin-section/business-operations/store-type/UpdateStoreType";


type Props = {params: Promise<{ id: string }>;};
const UpdateStoreTypePage = async ({ params }: Props) => {
  const param = await params;
  return (
    <>
      <CustomLayout>
        <UpdateStoreType ID={param.id} />
      </CustomLayout>
    </>
  );
};

export default UpdateStoreTypePage;
