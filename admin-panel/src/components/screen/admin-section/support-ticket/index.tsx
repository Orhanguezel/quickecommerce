"use client";
import TicketIcon from "@/assets/icons/TicketIcon";
import SupportTicketTable from "@/components/blocks/admin-section/support-ticket/SupportTicketTable";
import { AppSelect } from "@/components/blocks/common";
import { AppSearchSelect } from "@/components/blocks/common/AppSearchSelect";
import { Card, CardContent } from "@/components/ui";
import { useDepartmentQuery } from "@/modules/common/department/department.action";
import { useTypeWiseStoreQuery } from "@/modules/common/type-wise-store/type-wise-store.action";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";

const SupportTicket = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const priorityList = [
    { label: t("common.urgent"), value: "urgent" },
    { label: t("common.high"), value: "high" },
    { label: t("common.medium"), value: "medium" },
    { label: t("common.low"), value: "low" },
  ];
  const statusList = [
    { label: t("common.active"), value: "1" },
    { label: t("common.resolved"), value: "0" },
  ];

  const [selectPaymentStatus, setSelectPaymentStatus] = useState<string>("");
  const [selectPayment2Status, setSelectPayment2Status] = useState<string>("");
  const [selectPayment3Status, setSelectPayment3Status] = useState<string>("");
  const [selectStatus, setSelectStatus] = useState<string>("");

  const { DepartmentList } = useDepartmentQuery({});
  let DepartmentListData = (DepartmentList as any)?.data || [];

  const { TypeWiseStoreList } = useTypeWiseStoreQuery({
    store_type: "",
  });
  let TypeWiseStoreData = (TypeWiseStoreList as any)?.data || [];

  const handleSelectStatus = (value: string) => {
    const newSelectStatus = String(value);
    if (value === "none") {
      setSelectStatus("");
    } else {
      setSelectStatus(newSelectStatus);
    }
  };
  const handlePaymentStatus = (value: string) => {
    const newSelectOwner = String(value);
    if (value === "none") {
      setSelectPaymentStatus("");
    } else {
      setSelectPaymentStatus(newSelectOwner);
    }
  };
  const handlePayment2Status = (value: string) => {
    const newSelectOwner = String(value);
    if (value === "none") {
      setSelectPayment2Status("");
    } else {
      setSelectPayment2Status(newSelectOwner);
    }
  };
  const handlePayment3Status = (value: string) => {
    const newSelectOwner = String(value);
    if (value === "none") {
      setSelectPayment3Status("");
    } else {
      setSelectPayment3Status(newSelectOwner);
    }
  };

  const allFilters = {
    department_id: selectPayment2Status,
    priority: selectPaymentStatus,
    status: selectStatus,
    store_id: selectPayment3Status,
  };

  return (
    <>
      <Card>
        <CardContent className="flex flex-col xl:flex-row gap-4  justify-between p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <TicketIcon /> {t("common.support_ticket")}
            </h1>
          </div>

          <div className="flex flex-col md:flex-row gap-2 items-center w-full md:w-auto">
            <AppSearchSelect
              placeholder={t("place_holder.select_store")}
              value={String(selectPayment3Status)}
              onSelect={handlePayment3Status}
              groups={TypeWiseStoreData}
              customClass="w-full md:w-40"
            />
            <AppSearchSelect
              placeholder={t("place_holder.select_department")}
              value={String(selectPayment2Status)}
              onSelect={handlePayment2Status}
              groups={DepartmentListData}
              customClass="w-full md:w-40"
            />
            <AppSelect
              placeholder={t("place_holder.select_priority")}
              value={String(selectPaymentStatus)}
              onSelect={handlePaymentStatus}
              groups={priorityList}
              customClass="w-full md:w-40"
            />
            <AppSelect
              placeholder={t("place_holder.select_status")}
              value={String(selectStatus)}
              onSelect={handleSelectStatus}
              groups={statusList}
              customClass=" w-full md:w-40"
            />
          </div>
        </CardContent>
      </Card>

      <SupportTicketTable allFilters={allFilters} />
    </>
  );
};

export default SupportTicket;
