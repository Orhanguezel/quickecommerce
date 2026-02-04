"use client";
import AddToCardIcon from "@/assets/icons/AddToCardIcon";
import { AppSelect } from "@/components/blocks/common";
import CustomDateRangePicker from "@/components/blocks/common/CustomDateRangePicker";
import OrdersTable from "@/components/blocks/seller-section/store/orders/OrdersTable";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
const PaymentStatusList = [
  { label: "Paid", value: "paid" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
];

const Orders = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [selectPaymentStatus, setSelectPaymentStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchValue, setSearchValue] = useState({
    search: "",
  });
  
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });
  const formattedFrom = dateRange.from
    ? format(dateRange.from, "yyyy-MM-dd")
    : null;
  const formattedTo = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : null;

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchButtonClick = () => {
    setSearchValue({
      search: searchQuery,
    });
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
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchValue({ search: "" });
    }
  }, [searchQuery]);

  return (
    <>
      <Card>
        <CardContent
          dir={dir}
          className="grid grid-cols-1 lg:grid-cols-5 items-center gap-4 p-2 lg:p-4"
        >
          <div className="col-span-1 ">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <AddToCardIcon /> {t("orders.orders")}{" "}
            </h1>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-2 col-span-4 justify-end">
            <div
              dir={dir}
              className="relative flex items-center gap-2 justify-end w-full"
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
                placeholder={t("place_holder.search_by_order_id_or_invoice_no")}
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={handleSearchInputChange}
                className="px-8 app-input"
              />
              <Button
                variant="outline"
                onClick={handleSearchButtonClick}
                className="app-button"
              >
                {t("button.search")}
              </Button>
            </div>
            <div className="flex flex-col lg:flex-row items-center justify-end gap-2 w-full lg:w-48">
              <AppSelect
                placeholder={t("place_holder.select_payment_status")}
                value={String(selectPaymentStatus)}
                onSelect={handlePaymentStatus}
                groups={PaymentStatusList}
                customClass="mx-2 lg:mx-0 "
              />
            </div>

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

      <OrdersTable
        searchValue={searchValue}
        startDate={formattedFrom}
        endDate={formattedTo}
        selectPaymentStatus={selectPaymentStatus}
      />
    </>
  );
};

export default Orders;
