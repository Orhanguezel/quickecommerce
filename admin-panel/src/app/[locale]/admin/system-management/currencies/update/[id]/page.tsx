import EditBrand from "@/components/screen/admin-section/brand/EditBrand";
import UpdateCurrency from "@/components/screen/admin-section/system-management/currencies/UpdateCurrency";


type Props = {params: Promise<{ id: string }>;};

const UpdateCurrencyPage = async ({ params }: Props) => {
  const param = await params;
  return (
    <UpdateCurrency ID={param.id} />
  );
};
export default UpdateCurrencyPage;
