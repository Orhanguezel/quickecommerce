"use client";
import { AppSelect } from "@/components/blocks/common";
import NotificationsTable from "@/components/blocks/seller-section/store/notifications/NotificationsTable";
import { Card, CardContent } from "@/components/ui";
import { BellRing } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

const Notifications = () => {
  const t = useTranslations();
  const [selectStatus, setSelectStatus] = useState<string>("");
  const StatusList = [
    { label: t("common.read"), value: "read" },
    { label: t("common.unread"), value: "unread" },
  ];

  const handleSelectStatus = (value: string) => {
    const newSelectStatus = String(value);
    if (value === "none") {
      setSelectStatus("");
    } else {
      setSelectStatus(newSelectStatus);
    }
  };
  return (
    <>
      <Card>
        <CardContent className="flex flex-col items-center lg:flex-row gap-4 justify-between p-2 lg:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <BellRing /> {t("label.notifications")}{" "}
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 justify-start md:justify-end mb-2 md:mb-0 w-full">
            <AppSelect
              placeholder={t("place_holder.select_status")}
              value={String(selectStatus)}
              onSelect={handleSelectStatus}
              groups={StatusList}
              customClass="w-full md:w-48"
            />
          </div>
        </CardContent>
      </Card>

      <NotificationsTable selectStatus={selectStatus} />
    </>
  );
};

export default Notifications;
