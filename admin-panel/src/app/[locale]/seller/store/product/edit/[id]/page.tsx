import CustomLayout from "@/components/layout/CustomLayout";
import EditProduct from "@/components/screen/seller-section/store/product/EditProduct";


type Props = {params: Promise<{ id: string }>;};
const EditProductPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <CustomLayout>
      <EditProduct ID={param.id} />
    </CustomLayout>
  );
};

export default EditProductPage;
