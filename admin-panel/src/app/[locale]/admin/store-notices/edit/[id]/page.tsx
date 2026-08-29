import EditStoreNotices from "@/components/screen/admin-section/store-notices/EditStoreNotices";


type Props = {params: Promise<{ id: string }>;};
const EditStoreNoticesPage = async ({ params }: Props) => {
    const param = await params;
  return (
    <>
      <EditStoreNotices ID={param.id} />
    </>
  );
};

export default EditStoreNoticesPage;