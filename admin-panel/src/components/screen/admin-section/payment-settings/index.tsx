"use client";
import PaymentSettingsForm from "@/components/blocks/admin-section/payment-settings/PaymentSettingsForm";
import { Card, CardContent } from "@/components/ui";
import { useTranslations } from "next-intl";

const PaymentSettings = () => {
  const t = useTranslations()
  return (
    <div>
      <Card >
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-blue-500 flex items-center gap-2">
              {t("label.payment_settings")}
            </h1>
          </div>
        </CardContent>
      </Card>
      <PaymentSettingsForm />
    </div>
  );
};

export default PaymentSettings;
