"use client";
import AddToCardIcon from "@/assets/icons/AddToCardIcon";
import ActiveDealsTable from "@/components/blocks/seller-section/store/promotional/flash-deals/active-deals/ActiveDealsTable";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

const ActiveDeals = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
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
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4  justify-between p-2 md:p-4">
          <div className="flex items-center">
            <h1 className="col-span-1 text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <AddToCardIcon /> {t("common.active_deals")}
            </h1>
          </div>
          <div className="col-span-3 flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full">
            <div className="flex items-center gap-2 w-full">
              <Input
                type="text"
                placeholder={t("place_holder.search_by_title")}
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
          </div>
        </CardContent>
      </Card>

      <ActiveDealsTable searchValue={searchValue} />
    </>
  );
};

export default ActiveDeals;
