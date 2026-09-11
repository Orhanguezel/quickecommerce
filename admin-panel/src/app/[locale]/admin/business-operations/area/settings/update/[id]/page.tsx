import UpdateAreaSettings from "@/components/screen/admin-section/business-operations/area/settings/UpdateAreaSettings";


type Props = {params: Promise<{ id: string }>;};
const UpdateAreaSettingsPage = async ({ params }: Props) => {
  const param = await params;
  return (
    <>
      <UpdateAreaSettings ID={param.id} />
    </>
  );
};

export default UpdateAreaSettingsPage;
