import CustomLayout from "@/components/layout/CustomLayout";
import EditAttribute from "@/components/screen/seller-section/store/attribute/EditAttribute";


type Props = {params: Promise<{ id: string }>;};

const EditAttributePage =  async ({ params }: Props) => {
     const param = await params;
  return (
    <>
      <CustomLayout>
        <EditAttribute ID={param.id} />
      </CustomLayout>
    </>
  );
};

export default EditAttributePage;
