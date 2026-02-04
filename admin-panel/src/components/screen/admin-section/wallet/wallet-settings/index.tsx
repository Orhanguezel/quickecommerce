"use client";
import WalletSettingsForm from "@/components/blocks/admin-section/wallet-settings/WalletSettingsForm";
import { Card, CardContent } from "@/components/ui";
import { WalletIcon } from "lucide-react";
import { useTranslations } from "next-intl";

const WalletSettings = () => {
  const t = useTranslations();
  return (
    <div>
      <Card >
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-blue-500 flex items-center gap-2">
            <WalletIcon /> {t("label.wallet_settings")}
            </h1>
          </div>
        </CardContent>
      </Card>
      <WalletSettingsForm />
    </div>
  );
};

export default WalletSettings;