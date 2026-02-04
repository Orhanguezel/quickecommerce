"use client";
import WalletList from "@/components/blocks/admin-section/wallet/WalletList";
import { AppSelect } from "@/components/blocks/common";
import { Card, CardContent } from "@/components/ui";
import { WalletIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

const Wallet = () => {
  const t = useTranslations();
  const [selectOwner, setSelectOwner] = useState<string>("");
  const [selectStatus, setSelectStatus] = useState<string>("all");

  const StatusList = [
    { label: t("label.all"), value: "all" },
    { label: t("label.active"), value: "1" },
    { label: t("label.inactive"), value: "0" },
  ];
  const OwnerList = [
    { label: t("label.all"), value: "all" },
    { label: t("label.user"), value: "user" },
    { label: t("label.customer"), value: "customer" },
  ];

  const handleSelectStatus = (value: string) => {
    const newSelectStatus = String(value);
    if (value === "none") {
      setSelectStatus("all");
    } else {
      setSelectStatus(newSelectStatus);
    }
  };
  const handleSelectOwner = (value: string) => {
    const newSelectOwner = String(value);
    if (value === "none") {
      setSelectOwner("");
    } else {
      setSelectOwner(newSelectOwner);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              <WalletIcon /> {t("label.wallets")}
            </h1>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-end gap-2 w-full md:w-auto">
            <AppSelect
              placeholder={t("place_holder.select_status")}
              value={String(selectStatus)}
              onSelect={handleSelectStatus}
              groups={StatusList}
              customClass="w-full md:w-40"
              hideNone
            />
            <AppSelect
              placeholder={t("place_holder.select_owner")}
              value={String(selectOwner)}
              onSelect={handleSelectOwner}
              groups={OwnerList}
              customClass="w-full md:w-40"
              hideNone
            />
          </div>
        </CardContent>
      </Card>
      <div>
        <WalletList selectStatus={selectStatus} selectOwner={selectOwner} />
      </div>
    </>
  );
};

export default Wallet;
