import FlashSaleDetails from "@/components/screen/admin-section/promotional/flash-deals/FlashSaleDetails";



type Props = {params: Promise<{ id: string }>;};
const FlashSaleDetailsPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <FlashSaleDetails ID={param.id} />
  );
};
export default FlashSaleDetailsPage;