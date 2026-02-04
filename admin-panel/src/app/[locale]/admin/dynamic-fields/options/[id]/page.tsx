
import CustomLayout from "@/components/layout/CustomLayout";
import DynamicFieldOptions from "@/components/screen/admin-section/dynamic-fields/DynamicFieldOptions";


type Props = {params: Promise<{ id: string }>;};

const DynamicFieldOptionsPage = async ({ params }: Props) => {
  const param = await params;
  return (
    <CustomLayout>
      <DynamicFieldOptions ID={param.id} />
    </CustomLayout>
  );
};
export default DynamicFieldOptionsPage;
