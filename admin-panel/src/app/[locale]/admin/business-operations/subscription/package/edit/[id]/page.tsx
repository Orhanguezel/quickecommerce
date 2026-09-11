import EditPackage from "@/components/screen/admin-section/business-operations/subscription/package/EditPackage";


type Props = {params: Promise<{ id: string }>;};
const EditPackagePage =async  ({ params }: Props) => {
   const param = await params;
  return (
    <EditPackage ID={param.id} />
  );
};

export default EditPackagePage;