import CustomLayout from "@/components/layout/CustomLayout";
import EditBanner from "@/components/screen/admin-section/promotional/banner/EditBanner";


type Props = {params: Promise<{ id: string }>;};
const EditBannerPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <>
      <CustomLayout>
        <EditBanner ID={param.id} />
      </CustomLayout>
    </>
  );
};

export default EditBannerPage;