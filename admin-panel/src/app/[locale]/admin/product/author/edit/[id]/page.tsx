import EditAuthor from "@/components/screen/admin-section/products/author/EditAuthor";

type Props = {params: Promise<{ id: string }>;};

const EditAuthorPage = async ({ params }: Props) => {
     const param = await params;
  return (
    <>
      <EditAuthor ID={param.id} />
    </>
  );
};

export default EditAuthorPage;
