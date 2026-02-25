"use client";
import CreateOrUpdateShippingCampaignForm from "@/components/blocks/admin-section/promotional/shipping-campaign/CreateOrUpdateShippingCampaignForm";
import { Card, CardContent } from "@/components/ui";
import { Truck } from "lucide-react";
import { useTranslations } from "next-intl";

const AddShippingCampaign = () => {
  const t = useTranslations();
  return (
    <>
      <Card className="mb-4">
        <CardContent className="p-4">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            {t("common.add_shipping_campaign") || "Kargo Kampanyası Ekle"}
          </h1>
        </CardContent>
      </Card>
      <CreateOrUpdateShippingCampaignForm />
    </>
  );
};

export default AddShippingCampaign;
