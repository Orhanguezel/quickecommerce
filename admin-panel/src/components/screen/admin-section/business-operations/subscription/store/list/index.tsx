"use client";
import SubscriptionStoreListTable from "@/components/blocks/admin-section/business-operations/subscription/store/list/SubscriptionStoreListTable";
import { AppSelect } from "@/components/blocks/common";
import { AppSearchSelect } from "@/components/blocks/common/AppSearchSelect";
import { Card, CardContent } from "@/components/ui";
import { useTypeWiseStoreQuery } from "@/modules/common/type-wise-store/type-wise-store.action";
import CustomDateRangePicker from "@/components/blocks/common/CustomDateRangePicker";
import { Receipt } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";

const SubscriptionStoreList = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [selectPaymentStatus, setSelectPaymentStatus] = useState<string>("");
  const [selectPayment3Status, setSelectPayment3Status] = useState<string>("");
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });
  const formattedFrom = dateRange.from
    ? format(dateRange.from, "yyyy-MM-dd")
    : null;
  const formattedTo = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : null;
  const statusList = [
    { label: t("common.active"), value: "1" },
    { label: t("common.pending"), value: "0" },
    { label: t("common.cancelled"), value: "2" },
  ];

  const { TypeWiseStoreList } = useTypeWiseStoreQuery({
    store_type: "",
  });
  let TypeWiseStoreData = (TypeWiseStoreList as any)?.data || [];

  const handlePaymentStatus = (value: string) => {
    const newSelectOwner = String(value);
    if (value === "none") {
      setSelectPaymentStatus("");
    } else {
      setSelectPaymentStatus(newSelectOwner);
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
    status: selectPaymentStatus,
    store_id: selectPayment3Status,
  };
  return (
    <>
      <Card>
        <CardContent
          dir={dir}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2 md:p-4"
        >
          <div className="col-span-1">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <Receipt /> {t("label.subscription_store_list")}
            </h1>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 justify-start md:justify-end w-full">
            <AppSearchSelect
              placeholder={t("place_holder.select_store")}
              value={String(selectPayment3Status)}
              onSelect={handlePayment3Status}
              groups={TypeWiseStoreData}
              customClass="w-full md:w-40"
            />
            <AppSelect
              placeholder={t("place_holder.select_status")}
              value={String(selectPaymentStatus)}
              onSelect={handlePaymentStatus}
              groups={statusList}
              customClass="w-full md:w-40"
            />
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full md:w-auto">
              <div className="w-full">
                <CustomDateRangePicker
                  dateRange={dateRange}
                  onDateChange={setDateRange}
                  customSide="right-0"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <SubscriptionStoreListTable
        allFilters={allFilters}
        startDate={formattedFrom}
        endDate={formattedTo}
      />
    </>
  );
};

export default SubscriptionStoreList;
