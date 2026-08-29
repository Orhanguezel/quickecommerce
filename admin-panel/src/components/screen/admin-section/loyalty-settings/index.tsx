"use client";
import LoyaltySettingsForm from "@/components/blocks/admin-section/loyalty-settings/LoyaltySettingsForm";
import { Card, CardContent } from "@/components/ui";

const LoyaltySettings = () => {
  return (
    <div>
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4 justify-between p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-blue-500 flex items-center gap-2">
              Sadakat Puanı Ayarları
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Müşteriler teslim edilen siparişlerden ve onaylanan
              değerlendirmelerden puan kazanır; puanları kişiye özel indirim
              çekine dönüştürür.
            </p>
          </div>
        </CardContent>
      </Card>
      <LoyaltySettingsForm />
    </div>
  );
};

export default LoyaltySettings;
