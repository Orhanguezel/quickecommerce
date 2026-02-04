"use client";
import StoreIcon from "@/assets/icons/StoreIcon";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import MyStores from "@/components/blocks/admin-section/store/MyStores";
import { AppSelect } from "@/components/blocks/common";
import { AppSearchSelect } from "@/components/blocks/common/AppSearchSelect";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { Routes } from "@/config/routes";
import { useSellerQuery } from "@/modules/admin-section/seller/seller.action";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
type Option = {
  label: string;
  value: boolean;
};

const Store = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const StatusList = [
    { label: t("common.active"), value: "1" },
    { label: t("common.inactive"), value: "2" },
    { label: t("common.pending"), value: "0" },
  ];
  const [searchQuery, setSearchQuery] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [options, setOptions] = useState<Option[] | null>(null);
  const [selectStatus, setSelectStatus] = useState<string>("");

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
  const { sellerList } = useSellerQuery({});
  let sellerData = (sellerList as any) || [];
  const [selectSeller, setSelectSeller] = useState<string>("");

  const handleSelectOwner = (value: string) => {
    const newSelectOwner = String(value);
    if (value === "none") {
      setSelectSeller("");
    } else {
      setSelectSeller(newSelectOwner);
    }
  };

  useEffect(() => {
    const storedOptions = localStorage.getItem("selectedOptions");
    if (storedOptions) {
      setOptions(JSON.parse(storedOptions));
    }
  }, []);

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
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <StoreIcon /> {t("label.store")}{" "}
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full">
            <div className="flex items-center w-full">
              <Input
                type="text"
                placeholder={t("place_holder.search_by_name")}
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={handleSearchInputChange}
                className="mx-0 md:mx-2 app-input w-full"
              />
              <Button
                variant="outline"
                onClick={handleSearchButtonClick}
                className="mx-2 md:mx-0 app-button"
              >
                {t("button.search")}
              </Button>
            </div>
            <AppSearchSelect
              placeholder={t("place_holder.select_seller")}
              value={String(selectSeller)}
              onSelect={handleSelectOwner}
              groups={sellerData}
              customClass="w-full xl:w-48"
            />
            <AppSelect
              placeholder={t("place_holder.select_status")}
              value={String(selectStatus)}
              onSelect={handleSelectStatus}
              groups={StatusList}
              customClass="w-full lg:w-48"
            />

            <Link href={Routes.addStore}>
              <Button
                variant="outline"
                className="app-button"
                onClick={(e) => {
                  const isNewTab = e.metaKey || e.ctrlKey || e.button === 1;

                  if (!isNewTab) {
                    setIsLoading(true);
                  }
                }}
              >
                + {t("button.add_store")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      <div>
        <MyStores
          searchValue={searchValue}
          selectStatus={selectStatus}
          selectSeller={selectSeller}
        />
      </div>
    </>
  );
};

export default Store;
