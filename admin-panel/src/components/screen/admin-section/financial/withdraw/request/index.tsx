"use client";
import AddToCardIcon from "@/assets/icons/AddToCardIcon";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import RequestTable from "@/components/blocks/admin-section/financial/withdraw/request/RequestTable";
import CustomDateRangePicker from "@/components/blocks/common/CustomDateRangePicker";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

const RequestList = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
  React.useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchValue("");
    }
  }, [searchQuery]);

  return (
    <>
      <LoaderOverlay isLoading={isLoading} />
      <Card>
        <CardContent
          dir={dir}
          className="grid grid-cols-1 xl:grid-cols-4 items-center p-2 md:p-4"
        >
          <div className="col-span-1 mb-4 xl:mb-0">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <AddToCardIcon /> {t("common.withdrawal_request")}
            </h1>
          </div>
          <div className="col-span-3 flex flex-col md:flex-row items-start md:items-center gap-2 justify-start md:justify-end mb-2 md:mb-0 w-full">
            <div className="flex items-center gap-2 w-full">
              <Input
                type="text"
                placeholder={t("place_holder.search_by_amount")}
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={handleSearchInputChange}
                className="app-input "
              />
              <Button
                variant="outline"
                onClick={handleSearchButtonClick}
                className="app-button"
              >
                {t("button.search")}
              </Button>
            </div>
            <div className="w-full md:w-auto">
              <CustomDateRangePicker
                dateRange={dateRange}
                onDateChange={setDateRange}
                customSide="right-0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <RequestTable
        searchValue={searchValue}
        startDate={dateRange.from}
        endDate={dateRange.to}
      />
    </>
  );
};

export default RequestList;
