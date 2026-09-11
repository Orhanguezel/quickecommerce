import EditBlogCategory from "@/components/screen/admin-section/blog/category/EditBlogCategory";

type Props = {params: Promise<{ id: string }>;};
const EditBlogCategoryPage = async ({ params }: Props) => {
  const param = await params;
  return (
    <EditBlogCategory ID={param.id} />
  );
};
export default EditBlogCategoryPage;
