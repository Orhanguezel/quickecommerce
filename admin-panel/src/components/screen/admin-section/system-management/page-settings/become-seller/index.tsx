"use client";
import BecomeSellerForm from "@/components/blocks/admin-section/system-management/page-settings/become-seller/BecomeSellerForm";
import { Card, CardContent } from "@/components/ui";
import { useTranslations } from "next-intl";

const BecomeSeller = () => {
  const t = useTranslations();
  return (
    <div>
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-blue-500 flex items-center gap-2">
              {t("label.become_seller")}
            </h1>
          </div>
        </CardContent>
      </Card>
      <BecomeSellerForm />
    </div>
  );
};

export default BecomeSeller;
