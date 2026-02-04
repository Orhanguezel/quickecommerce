import CustomLayout from "@/components/layout/CustomLayout";
import EditAuthor from "@/components/screen/seller-section/store/product/author/EditAuthor";


type Props = {params: Promise<{ id: string }>;};
const EditAuthorPage =async ({ params }: Props) => {
    const param = await params;
  return (
    <>
      <CustomLayout>
        <EditAuthor ID={param.id} />
      </CustomLayout>
    </>
  );
};
export default EditAuthorPage;
