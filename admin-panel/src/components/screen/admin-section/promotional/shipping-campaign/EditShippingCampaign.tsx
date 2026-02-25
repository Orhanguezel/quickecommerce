"use client";
import CreateOrUpdateShippingCampaignForm from "@/components/blocks/admin-section/promotional/shipping-campaign/CreateOrUpdateShippingCampaignForm";
import { Card, CardContent } from "@/components/ui";
import { useShippingCampaignQueryById } from "@/modules/admin-section/promotional/shipping-campaign/shipping-campaign.action";
import Loader from "@/components/molecules/Loader";
import { Truck } from "lucide-react";
import { useTranslations } from "next-intl";

const EditShippingCampaign = ({ id }: { id: string }) => {
  const t = useTranslations();
  const { ShippingCampaign, isPending } = useShippingCampaignQueryById(id);

  if (isPending) return <Loader />;

  return (
    <>
      <Card className="mb-4">
        <CardContent className="p-4">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            {t("common.edit_shipping_campaign") || "Kargo Kampanyası Düzenle"}
          </h1>
        </CardContent>
      </Card>
      <CreateOrUpdateShippingCampaignForm data={ShippingCampaign} />
    </>
  );
};

export default EditShippingCampaign;
