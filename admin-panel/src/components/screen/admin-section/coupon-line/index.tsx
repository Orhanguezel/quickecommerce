"use client";
import CouponLineTable from "@/components/blocks/admin-section/coupon-line/CouponLineTable";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { TicketPercent } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

const CouponLine = () => {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchValue, setSearchValue] = useState("");

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
  React.useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchValue("");
    }
  }, [searchQuery]);
  return (
    <>
      <Card>
        <CardContent className="flex flex-col md:flex-row justify-between p-2 md:p-4">
          <div className="mb-4 md:mb-0">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <TicketPercent /> {t("label.coupon_line")}{" "}
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-start md:items-center">
              <Input
                type="text"
                placeholder={t("place_holder.search_by_name")}
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={handleSearchInputChange}
                className="mx-0 md:mx-2 app-input "
              />
              <Button
                variant="outline"
                onClick={handleSearchButtonClick}
                className="mx-2 md:mx-0 app-button"
              >
                {t("button.search")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <CouponLineTable searchValue={searchValue} />
    </>
  );
};

export default CouponLine;
