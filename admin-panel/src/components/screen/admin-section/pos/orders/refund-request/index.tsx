"use client";

import { AppSelect } from "@/components/blocks/common";
import RefundRequestTable from "@/components/blocks/seller-section/store/orders/RefundRequest/RefundRequestTable";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { useRefundReasonQuery } from "@/modules/seller-section/orders/refund-request/refund-request.action";
import { Receipt, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

const RefundRequest = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [searchQuery, setSearchQuery] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectPaymentStatus, setSelectPaymentStatus] = useState<string>("");
  const [selectPayment2Status, setSelectPayment2Status] = useState<string>("");
  const priorityList = [
    { label: t("label.approved"), value: "approved" },
    { label: t("label.rejected"), value: "rejected" },
    { label: t("label.refunded"), value: "refunded" },
  ];

  const { RefundReasons } = useRefundReasonQuery({});
  const RefundREason = (RefundReasons as any)?.data || [];

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

  React.useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchValue("");
    }
  }, [searchQuery]);

  return (
    <>
      <Card>
        <CardContent
          dir={dir}
          className="grid grid-cols-1 xl:grid-cols-4 p-2 md:p-4"
        >
          <div className="col-span-1 mb-2 xl:mb-0">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <Receipt /> {t("common.refund_request")}
            </h1>
          </div>
          <div className="col-span-3 flex flex-col md:flex-row items-center gap-2 justify-end w-full">
            <div dir={dir} className="relative flex items-center gap-2 w-full">
              <div
                className={`${
                  locale === "ar" ? "right-3" : "left-3"
                } mt-0.5 absolute  text-[#CCCFD7]`}
              >
                <Search width={18} height={18} />
              </div>
              <Input
                type="text"
                placeholder={t("place_holder.search_by_title")}
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={handleSearchInputChange}
                className="px-8 app-input w-full"
              />
              <Button
                variant="outline"
                onClick={handleSearchButtonClick}
                className="app-button "
              >
                {t("button.search")}
              </Button>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-2 w-full xl:w-auto">
              <AppSelect
                placeholder={t("place_holder.select_reason")}
                value={String(selectPayment2Status)}
                onSelect={handlePayment2Status}
                groups={RefundREason}
                customClass="w-full lg:w-40"
              />
              <AppSelect
                placeholder={t("place_holder.select_status")}
                value={String(selectPaymentStatus)}
                onSelect={handlePaymentStatus}
                groups={priorityList}
                customClass="w-full lg:w-40"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <RefundRequestTable
        selectPayment2Status={selectPayment2Status}
        selectPaymentStatus={selectPaymentStatus}
        searchValue={searchValue}
      />
    </>
  );
};

export default RefundRequest;
