import CustomLayout from "@/components/layout/CustomLayout";
import OrdersDetails from "@/components/screen/admin-section/orders/OrdersDetails";


type Props = {params: Promise<{ id: string }>;};
const OrdersDetailsPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <>
      <CustomLayout>
        <OrdersDetails ID={param.id} />
      </CustomLayout>
    </>
  );
};

export default OrdersDetailsPage;