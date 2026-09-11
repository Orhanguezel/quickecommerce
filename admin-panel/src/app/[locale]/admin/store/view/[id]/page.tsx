import StoreView from "@/components/screen/admin-section/store/StoreView";


type Props = {params: Promise<{ id: string }>;};
const StoreViewPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <StoreView ID={param.id} />
  );
};
export default StoreViewPage;