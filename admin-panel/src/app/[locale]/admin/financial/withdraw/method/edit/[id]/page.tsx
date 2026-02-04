
import CustomLayout from "@/components/layout/CustomLayout";
import EditMethod from "@/components/screen/admin-section/financial/withdraw/method/EditMethod";


type Props = {params: Promise<{ id: string }>;};
const EditMethodPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <CustomLayout>
      <EditMethod ID={param.id} />
    </CustomLayout>
  );
};
export default EditMethodPage;