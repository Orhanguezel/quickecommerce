import DynamicFieldOptions from "@/components/screen/admin-section/dynamic-fields/DynamicFieldOptions";


type Props = {params: Promise<{ id: string }>;};

const DynamicFieldOptionsPage = async ({ params }: Props) => {
  const param = await params;
  return (
    <DynamicFieldOptions ID={param.id} />
  );
};
export default DynamicFieldOptionsPage;
