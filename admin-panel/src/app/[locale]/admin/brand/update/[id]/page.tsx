import EditBrand from "@/components/screen/admin-section/brand/EditBrand";


type Props = {params: Promise<{ id: string }>;};

const EditBrandPage = async ({ params }: Props) => {
  const param = await params;
  return (
    <EditBrand ID={param.id} />
  );
};
export default EditBrandPage;
