
import CustomLayout from "@/components/layout/CustomLayout";
import EditBrand from "@/components/screen/admin-section/brand/EditBrand";


type Props = {params: Promise<{ id: string }>;};

const EditBrandPage = async ({ params }: Props) => {
  const param = await params;
  return (
    <CustomLayout>
      <EditBrand ID={param.id} />
    </CustomLayout>
  );
};
export default EditBrandPage;
