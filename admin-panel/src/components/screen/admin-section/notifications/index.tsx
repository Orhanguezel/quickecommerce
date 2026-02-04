"use client";
import NotificationsTable from "@/components/blocks/admin-section/notifications/NotificationsTable";
import { AppSelect } from "@/components/blocks/common";
import { Card, CardContent } from "@/components/ui";
import { BellRing } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

const Notifications = () => {
  const t = useTranslations();
  const [selectStatus, setSelectStatus] = useState<string>("");
  const [selectNotifiableType, setSelectNotifiableType] = useState<string>("");
  const StatusList = [
    { label: t("common.read"), value: "read" },
    { label: t("common.unread"), value: "unread" },
  ];
  const NotifiableTypeList = [
    { label: t("common.admin"), value: "admin" },
    { label: t("common.store"), value: "store" },
    { label: t("common.customer"), value: "customer" },
    { label: t("common.deliveryman"), value: "deliveryman" },
  ];
  const handleSelectNotifiableType = (value: string) => {
    const newSelectStatus = String(value);
    if (value === "none") {
      setSelectNotifiableType("");
    } else {
      setSelectNotifiableType(newSelectStatus);
    }
  };
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
        <CardContent className="flex flex-col lg:flex-row justify-between p-2 lg:p-4">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <BellRing /> {t("label.notifications")}{" "}
            </h1>
          </div>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="flex flex-col md:flex-row gap-2 items-start md:items-center w-full md:w-auto">
              <AppSelect
                placeholder="Select notifiable type"
                value={String(selectNotifiableType)}
                onSelect={handleSelectNotifiableType}
                groups={NotifiableTypeList}
                customClass="w-full md:w-60"
              />
              <AppSelect
                placeholder={t("place_holder.select_status")}
                value={String(selectStatus)}
                onSelect={handleSelectStatus}
                groups={StatusList}
                customClass="w-full md:w-48"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <NotificationsTable
        selectNotifiableType={selectNotifiableType}
        selectStatus={selectStatus}
      />
    </>
  );
};

export default Notifications;
