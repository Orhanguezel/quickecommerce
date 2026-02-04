"use client";
import RequestProductTable from "@/components/blocks/admin-section/products/request/RequestProductTable";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { useAppSelector } from "@/redux/hooks/index";
import { PackageSearch, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

const Request = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const slug = selectedStore?.slug;
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
      <Card className="">
        <CardContent className="grid grid-cols-1 md:grid-cols-7 items-center gap-2 p-2 md:p-4">
          <div className="col-span-2 py-2 md:py-0">
            <h1 className="text-md xl:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <PackageSearch />  {t("label.product_request")}
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 col-span-5 justify-end">
            <div className="relative flex items-center w-full">
              <div
                className={`${
                  locale === "ar" ? "right-3" : "left-3"
                } absolute  text-gray-500 dark:text-white mt-0.5`}
              >
                <Search width={18} height={18} />
              </div>
              <Input
                type="text"
                placeholder={t("place_holder.search_by_product")}
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={handleSearchInputChange}
                className="app-input  px-8"
              />
              <Button
                variant="outline"
                onClick={handleSearchButtonClick}
                className="app-button mx-2"
              >
                {t("button.search")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <div>
        <RequestProductTable searchValue={searchValue} />
      </div>
    </>
  );
};

export default Request;
