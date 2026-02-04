import CustomLayout from "@/components/layout/CustomLayout";
import EditPackage from "@/components/screen/admin-section/business-operations/subscription/package/EditPackage";


type Props = {params: Promise<{ id: string }>;};
const EditPackagePage =async  ({ params }: Props) => {
   const param = await params;
  return (
    <CustomLayout>
      <EditPackage ID={param.id} />
    </CustomLayout>
  );
};

export default EditPackagePage;