import EditProduct from "@/components/screen/admin-section/products/EditProduct";


type Props = {params: Promise<{ id: string }>;};
const EditProductPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <EditProduct ID={param.id} />
  );
};

export default EditProductPage;
