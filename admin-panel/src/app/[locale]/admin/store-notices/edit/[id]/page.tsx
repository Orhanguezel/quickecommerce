import CustomLayout from "@/components/layout/CustomLayout";
import EditStoreNotices from "@/components/screen/admin-section/store-notices/EditStoreNotices";


type Props = {params: Promise<{ id: string }>;};
const EditStoreNoticesPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <>
      <CustomLayout>
        <EditStoreNotices ID={param.id} />
      </CustomLayout>
    </>
  );
};

export default EditStoreNoticesPage;