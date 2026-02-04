"use client";
import AddToCardIcon from "@/assets/icons/AddToCardIcon";
import WithdrawalListTable from "@/components/blocks/admin-section/financial/withdraw/WithdrawalListTable";
import { AppSelect } from "@/components/blocks/common";
import { Card, CardContent } from "@/components/ui";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const WithdrawalList = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [selectStatus, setSelectStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const StatusList = [
    { label: t("common.pending"), value: "pending" },
    { label: t("common.approved"), value: "approved" },
    { label: t("common.rejected"), value: "rejected" },
  ];

  const handleSelectStatus = (value: string) => {
    const newSelectStatus = String(value);
    if (value === "none") {
      setSelectStatus("");
    } else {
      setSelectStatus(newSelectStatus);
    }
  };

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLoading]);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-secondary border-b-transparent rounded-full animate-spin-slow"></div>
          </div>
        </div>
      )}
      <Card>
        <CardContent
          dir={dir}
          className="grid grid-cols-1 md:grid-cols-4 p-2 gap-4 md:p-4"
        >
          <div className="">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <AddToCardIcon /> {t("common.withdraw_history")}
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 col-span-3 justify-start md:justify-end w-full">
            <AppSelect
              placeholder={t("place_holder.select_status")}
              value={String(selectStatus)}
              onSelect={handleSelectStatus}
              groups={StatusList}
              customClass="mx-0 md:mx-2 w-full md:w-48"
            />
          </div>
        </CardContent>
      </Card>

      <WithdrawalListTable selectStatus={selectStatus} />
    </>
  );
};

export default WithdrawalList;
