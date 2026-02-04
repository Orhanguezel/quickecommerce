"use client";
import RefundRequestTable from "@/components/blocks/admin-section/orders/RefundRequest/RefundRequestTable";
import { AppSelect } from "@/components/blocks/common";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { useRefundReasonQuery } from "@/modules/admin-section/orders/refund-reason/refund-reason.action";
import { useTypeWiseStoreQuery } from "@/modules/common/type-wise-store/type-wise-store.action";
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
  const [selectPayment3Status, setSelectPayment3Status] = useState<string>("");
  const priorityList = [
    { label: t("common.approved"), value: "approved" },
    { label: t("common.rejected"), value: "rejected" },
    { label: t("common.refunded"), value: "refunded" },
  ];
  const { RefundReasons, refetch, isPending } = useRefundReasonQuery({});
  const RefundREason = (RefundReasons as any)?.data || [];

  const { TypeWiseStoreList } = useTypeWiseStoreQuery({
    store_type: "",
  });
  let TypeWiseStoreData = (TypeWiseStoreList as any)?.data || [];
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
  const handlePayment3Status = (value: string) => {
    const newSelectOwner = String(value);
    if (value === "none") {
      setSelectPayment3Status("");
    } else {
      setSelectPayment3Status(newSelectOwner);
    }
  };

  const allFilters = {
    order_refund_reason_id: selectPayment2Status,
    status: selectPaymentStatus,
    store_id: selectPayment3Status,
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
          className="grid grid-cols-1 xl:grid-cols-4 p-2 lg:p-4"
        >
          <div className="col-span-1 mb-3 xl:mb-0">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <Receipt /> {t("common.refund_request")}
            </h1>
          </div>
          <div className="col-span-3 flex flex-col xl:flex-row items-center gap-2 justify-end w-full">
            <div
              dir={dir}
              className="relative flex items-center gap-2 w-full justify-end"
            >
              <div
                className={`${
                  locale === "ar" ? "right-3" : "left-3"
                } absolute  text-[#CCCFD7]`}
              >
                <Search width={18} height={18} />
              </div>
              <Input
                type="text"
                placeholder={t("place_holder.search_by_invoice")}
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
            <div className="flex flex-col md:flex-row items-center gap-2 w-full justify-end">
              <AppSelect
                placeholder={t("place_holder.select_reason")}
                value={String(selectPayment2Status)}
                onSelect={handlePayment2Status}
                groups={RefundREason}
                customClass="w-full "
              />
              <AppSelect
                placeholder={t("place_holder.select_store")}
                value={String(selectPayment3Status)}
                onSelect={handlePayment3Status}
                groups={TypeWiseStoreData}
                customClass="w-full "
              />
              <AppSelect
                placeholder={t("place_holder.select_status")}
                value={String(selectPaymentStatus)}
                onSelect={handlePaymentStatus}
                groups={priorityList}
                customClass="w-full "
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <RefundRequestTable searchValue={searchValue} allFilters={allFilters} />
    </>
  );
};

export default RefundRequest;
