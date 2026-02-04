
import CustomLayout from "@/components/layout/CustomLayout";
import EditBlogCategory from "@/components/screen/admin-section/blog/category/EditBlogCategory";

type Props = {params: Promise<{ id: string }>;};
const EditBlogCategoryPage = async ({ params }: Props) => {
  const param = await params;
  return (
    <CustomLayout>
      <EditBlogCategory ID={param.id} />
    </CustomLayout>
  );
};
export default EditBlogCategoryPage;
