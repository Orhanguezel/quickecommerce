import CustomLayout from "@/components/layout/CustomLayout";
import EditBlogPost from "@/components/screen/admin-section/blog/posts/EditBlogPost";


type Props = {params: Promise<{ id: string }>;};

const EditBlogPostPage =async ({ params }: Props) => {
    const param =  await params;

  return (
    <CustomLayout>
      <EditBlogPost ID={param.id} />
    </CustomLayout>
  );
};
export default EditBlogPostPage;
