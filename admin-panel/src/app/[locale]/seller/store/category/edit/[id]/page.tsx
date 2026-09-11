import EditCategory from "@/components/screen/seller-section/store/category/EditCategory";

type Props = { params: Promise<{ id: string }> };

const EditCategoryPage = async ({ params }: Props) => {
  const param = await params;
  return (
    <EditCategory ID={param.id} />
  );
};

export default EditCategoryPage;
