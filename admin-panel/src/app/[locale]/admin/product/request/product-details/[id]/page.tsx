import CustomLayout from "@/components/layout/CustomLayout";
import ProductDetails from "@/components/screen/admin-section/products/request/ProductDetails";

type Props = { params: Promise<{ id: string }> };
const ProductRequestDetailsPage = async ({ params }: Props) => {
  const param = await params;
  return (
    <CustomLayout>
      <ProductDetails ID={param.id} />
    </CustomLayout>
  );
};

export default ProductRequestDetailsPage;
