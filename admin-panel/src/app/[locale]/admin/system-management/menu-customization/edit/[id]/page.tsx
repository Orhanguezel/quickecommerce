import CustomLayout from "@/components/layout/CustomLayout";
import EditMenuCustomization from "@/components/screen/admin-section/system-management/menu-customization/EditMenuCustomization";
 

type Props = {params: Promise<{ id: string }>;};
const EditMenuCustomizationPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <>
      <CustomLayout>
        <EditMenuCustomization ID={param.id} />
      </CustomLayout>
    </>
  );
};

export default EditMenuCustomizationPage;