import CustomLayout from "@/components/layout/CustomLayout";
import EditShippingCampaign from "@/components/screen/admin-section/promotional/shipping-campaign/EditShippingCampaign";

interface Props {
  params: { id: string };
}

const EditShippingCampaignPage = ({ params }: Props) => {
  return (
    <CustomLayout>
      <EditShippingCampaign id={params.id} />
    </CustomLayout>
  );
};

export default EditShippingCampaignPage;
