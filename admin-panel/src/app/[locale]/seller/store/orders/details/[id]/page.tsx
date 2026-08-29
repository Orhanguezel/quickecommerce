import OrdersDetails from "@/components/screen/seller-section/store/orders/OrdersDetails";


type Props = {params: Promise<{ id: string }>;};
const OrdersDetailsPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <>
      <OrdersDetails ID={param.id} />
    </>
  );
};

export default OrdersDetailsPage;