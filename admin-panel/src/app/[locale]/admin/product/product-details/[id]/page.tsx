import ProductDetails from "@/components/screen/admin-section/products/request/ProductDetails";

type Props = { params: Promise<{ id: string }> };
const ApprovedProductDetailsPage = async ({ params }: Props) => {
  const param = await params;
  return (
    <ProductDetails ID={param.id} />
  );
};

export default ApprovedProductDetailsPage;
