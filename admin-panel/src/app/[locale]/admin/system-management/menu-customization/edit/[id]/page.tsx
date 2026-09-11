import EditMenuCustomization from "@/components/screen/admin-section/system-management/menu-customization/EditMenuCustomization";
 

type Props = {params: Promise<{ id: string }>;};
const EditMenuCustomizationPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <>
      <EditMenuCustomization ID={param.id} />
    </>
  );
};

export default EditMenuCustomizationPage;