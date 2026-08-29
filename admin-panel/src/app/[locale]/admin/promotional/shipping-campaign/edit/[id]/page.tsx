import EditShippingCampaign from "@/components/screen/admin-section/promotional/shipping-campaign/EditShippingCampaign";
import { use } from "react";

interface Props {
  params: Promise<{ id: string }>;
}

const EditShippingCampaignPage = ({ params }: Props) => {
  const { id } = use(params);
  return (
    <EditShippingCampaign id={id} />
  );
};

export default EditShippingCampaignPage;
