"use client";
import ReportAnalyticsTable from "@/components/blocks/admin-section/report-analytics/order/ReportAnalyticsTable";
import { AppSelect } from "@/components/blocks/common";
import { AppSearchSelect } from "@/components/blocks/common/AppSearchSelect";
import CustomDateRangePicker from "@/components/blocks/common/CustomDateRangePicker";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { useInventoryStoreQuery } from "@/modules/admin-section/inventory/inventory.action";
import { useAreaDropdownQuery } from "@/modules/common/area/area.action";
import { useCustomerQuery } from "@/modules/common/customer/customer.action";
import { usePaymentGatewayQuery } from "@/modules/common/payment-gateway/payment-gateway.action";
import { useStoreTypeQuery } from "@/modules/common/store-type/store-type.action";
import { Search, Sheet } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

const ReportAnalytics = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const StatusList = [
    { label: t("common.pending"), value: "pending" },
    { label: t("common.confirmed"), value: "confirmed" },
    { label: t("common.processing"), value: "processing" },
    { label: t("common.pickup"), value: "pickup" },
    { label: t("common.shipped"), value: "shipped" },
    { label: t("common.cancelled"), value: "cancelled" },
    { label: t("common.delivered"), value: "delivered" },
  ];
  const PaymentStatusList = [
    { label: t("common.pending"), value: "pending" },
    { label: t("common.partially_paid"), value: "partially_paid" },
    { label: t("common.paid"), value: "paid" },
    { label: t("common.cancelled"), value: "cancelled" },
    { label: t("common.failed"), value: "failed" },
    { label: t("common.refunded"), value: "refunded" },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });

  const [selectPaymentStatus, setSelectPaymentStatus] = useState<string>("");
  const [selectStatus, setSelectStatus] = useState<string>("");
  const [selectStoreID, setSelectStoreID] = useState<string>("");
  const [selectStoreType, setSelectStoreType] = useState<string>("");
  const [selectAreaId, setSelectAreaId] = useState<string>("");
  const [selectCustomerId, setSelectCustomerId] = useState<string>("");
  const [selectPaymentGateway, setSelectPaymentGateway] = useState<string>("");

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchButtonClick = () => {
    setSearchValue(searchQuery);
  };
  const handleKeyDown = (event: { key: string }) => {
    if (event.key === "Enter") {
      handleSearchButtonClick();
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
  const handlePaymentStatus = (value: string) => {
    const newSelectOwner = String(value);
    if (value === "none") {
      setSelectPaymentStatus("");
    } else {
      setSelectPaymentStatus(newSelectOwner);
    }
  };

  const { InventoryStoreList } = useInventoryStoreQuery({
    seller_id: "",
  });
  let StoreData = (InventoryStoreList as any) || [];
  const handleSelectOwner = (value: string) => {
    const newSelectOwner = String(value);
    if (value === "none") {
      setSelectStoreID("");
    } else {
      setSelectStoreID(newSelectOwner);
    }
  };

  const { storeType } = useStoreTypeQuery({});
  let typeData = (storeType as any) || [];

  const handleSelectOwner2 = (value: string) => {
    const newSelectOwner = String(value);
    if (value === "none") {
      setSelectStoreType("");
    } else {
      setSelectStoreType(newSelectOwner);
    }
  };
  const { AreaDropdownList } = useAreaDropdownQuery({});
  let AreaList = (AreaDropdownList as any) || [];
  const handleSelectAreaID = (value: string) => {
    const newSelectAreaID = String(value);
    if (value === "none") {
      setSelectAreaId("");
    } else {
      setSelectAreaId(newSelectAreaID);
    }
  };
  const { customerList } = useCustomerQuery({});
  const customerData = (customerList as any) || [];
  const handleSelectCustomerID = (value: any) => {
    const newSelectAreaID = String(value);
    if (value === "none") {
      setSelectCustomerId("");
    } else {
      setSelectCustomerId(newSelectAreaID);
    }
  };
  const { PaymentGatewayList } = usePaymentGatewayQuery({});
  let PaymentGateways = (PaymentGatewayList as any)?.paymentGateways || [];
  const handleSelectPaymentGateway = (value: any) => {
    const newSelectAreaID = String(value);
    if (value === "none") {
      setSelectPaymentGateway("");
    } else {
      setSelectPaymentGateway(newSelectAreaID);
    }
  };
  React.useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchValue("");
    }
  }, [searchQuery]);

  return (
    <>
      <Card>
        <CardContent className="p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <Sheet /> {t("label.order_report")}
            </h1>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardContent className=" p-2 md:p-6">
          <h1 className="mb-4 text-xl font-semibold text-black dark:text-white flex items-center gap-2">
            {" "}
            {t("label.filter")}
          </h1>
          <div className="space-y-2 md:space-y-0 md:grid  lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            <AppSearchSelect
              placeholder={t("place_holder.select_store")}
              value={String(selectStoreID)}
              onSelect={handleSelectOwner}
              groups={StoreData}
              customClass="w-full "
            />
            <AppSelect
              placeholder={t("place_holder.select_store_type")}
              value={String(selectStoreType)}
              onSelect={handleSelectOwner2}
              groups={typeData}
              customClass="w-full"
            />
            <AppSearchSelect
              placeholder={t("place_holder.select_area")}
              value={String(selectAreaId)}
              onSelect={handleSelectAreaID}
              groups={AreaList}
              customClass="w-full"
            />
            <AppSearchSelect
              placeholder={t("place_holder.select_customer")}
              value={String(selectCustomerId)}
              onSelect={handleSelectCustomerID}
              groups={customerData}
              customClass="w-full"
            />
            <AppSelect
              placeholder={t("place_holder.select_gateway")}
              value={String(selectPaymentGateway)}
              onSelect={handleSelectPaymentGateway}
              groups={PaymentGateways}
              customClass="w-full "
            />
            <AppSelect
              placeholder={t("place_holder.select_status")}
              value={String(selectStatus)}
              onSelect={handleSelectStatus}
              groups={StatusList}
              customClass="w-full "
            />
            <AppSelect
              placeholder={t("place_holder.select_payment_status")}
              value={String(selectPaymentStatus)}
              onSelect={handlePaymentStatus}
              groups={PaymentStatusList}
              customClass="w-full "
            />

            <div className="w-full">
              <CustomDateRangePicker
                dateRange={dateRange}
                onDateChange={setDateRange}
                customSide="right-0"
              />
            </div>
            <div className="relative flex items-center gap-2 w-full col-span-2">
              <div
                className={`${
                  locale === "ar" ? "right-3" : "left-3"
                } absolute  text-[#CCCFD7]`}
              >
                <Search width={18} height={18} />
              </div>
              <Input
                type="text"
                placeholder={t("place_holder.search_by_order_id_or_invoice_no")}
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={handleSearchInputChange}
                className="px-8 app-input w-full"
              />
              <Button
                variant="outline"
                onClick={handleSearchButtonClick}
                className="app-button"
              >
                {t("button.search")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ReportAnalyticsTable
        searchValue={searchValue}
        startDate={dateRange.from}
        endDate={dateRange.to}
        selectStatus={selectStatus}
        selectPaymentStatus={selectPaymentStatus}
        selectStoreID={selectStoreID}
        selectStoreType={selectStoreType}
        selectAreaId={selectAreaId}
        selectCustomerId={selectCustomerId}
        selectPaymentGateway={selectPaymentGateway}
      />
    </>
  );
};

export default ReportAnalytics;
