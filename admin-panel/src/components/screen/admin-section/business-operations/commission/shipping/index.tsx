"use client";
import ShippingSettingsCard from "@/components/blocks/admin-section/business-operations/commission/settings/ShippingSettingsCard";
import CommissionSettingsNav from "@/components/blocks/admin-section/business-operations/commission/settings/CommissionSettingsNav";
import { Card, CardContent } from "@/components/ui";
import { useTranslations } from "next-intl";

const ShippingSettings = () => {
  const t = useTranslations();
  return (
    <div>
      <Card className="shadow-xl">
        <CardContent className="flex flex-col md:flex-row gap-4 justify-between p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("label.commission_settings")}
            </h1>
          </div>
        </CardContent>
      </Card>
      <div className="mt-4">
        <CommissionSettingsNav />
        <ShippingSettingsCard />
      </div>
    </div>
  );
};

export default ShippingSettings;
