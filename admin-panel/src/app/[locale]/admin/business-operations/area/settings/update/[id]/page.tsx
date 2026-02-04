import CustomLayout from "@/components/layout/CustomLayout";
import UpdateAreaSettings from "@/components/screen/admin-section/business-operations/area/settings/UpdateAreaSettings";


type Props = {params: Promise<{ id: string }>;};
const UpdateAreaSettingsPage = async ({ params }: Props) => {
  const param = await params;
  return (
    <>
      <CustomLayout>
        <UpdateAreaSettings ID={param.id} />
      </CustomLayout>
    </>
  );
};

export default UpdateAreaSettingsPage;
