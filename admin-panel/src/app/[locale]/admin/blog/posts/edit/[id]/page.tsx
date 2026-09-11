import EditBlogPost from "@/components/screen/admin-section/blog/posts/EditBlogPost";


type Props = {params: Promise<{ id: string }>;};

const EditBlogPostPage =async ({ params }: Props) => {
    const param =  await params;

  return (
    <EditBlogPost ID={param.id} />
  );
};
export default EditBlogPostPage;
