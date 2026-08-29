import EditBanner from "@/components/screen/admin-section/promotional/banner/EditBanner";


type Props = {params: Promise<{ id: string }>;};
const EditBannerPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <>
      <EditBanner ID={param.id} />
    </>
  );
};

export default EditBannerPage;