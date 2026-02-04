"use client";
import StoreIcon from "@/assets/icons/StoreIcon";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import StoreTypeTable from "@/components/blocks/admin-section/business-operations/store-type/StoreTypeTable";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { useAppDispatch } from "@/redux/hooks";
import { setDynamicValue } from "@/redux/slices/refetchSlice";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

const StoreType = () => {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchButtonClick = () => {
    setSearchValue(searchQuery);
    dispatch(setDynamicValue("search_store_type"));
  };
  const handleKeyDown = (event: { key: string }) => {
    if (event.key === "Enter") {
      handleSearchButtonClick();
    }
  };
  const [isLoading, setIsLoading] = useState(false);
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
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div className="flex items-center justify-start md:justify-center gap-2">
            <StoreIcon />
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {t("label.store_types")}
            </h1>
          </div>
          <div className="flex gap-2 items-start md:items-center">
            <div className="relative flex items-center">
              <Input
                type="text"
                placeholder={t("place_holder.search_by_name")}
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={handleSearchInputChange}
                className="app-input pr-8"
              />
              <div className="absolute top-2 right-4 text-[#CCCFD7]">
                <Search />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleSearchButtonClick}
              className="app-button "
            >
              {t("button.search")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <StoreTypeTable searchValue={searchValue} />
    </>
  );
};

export default StoreType;
