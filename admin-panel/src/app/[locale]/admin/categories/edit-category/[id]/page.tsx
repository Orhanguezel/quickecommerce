import CustomLayout from "@/components/layout/CustomLayout";
import EditCategory from "@/components/screen/admin-section/category/EditCategory";


type Props = {params: Promise<{ id: string }>;};
const EditCategoryPage = async ({ params }: Props) => {
 const param = await params;

  return (
    <CustomLayout>
      <EditCategory ID={param.id} />
    </CustomLayout>
  );
};
export default EditCategoryPage;
