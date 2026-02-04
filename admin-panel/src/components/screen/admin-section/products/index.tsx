"use client";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import ProductTable from "@/components/blocks/admin-section/products/ProductTable";
import { AppSelect } from "@/components/blocks/common";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { Routes } from "@/config/routes";
import { useInventoryStoreQuery } from "@/modules/admin-section/inventory/inventory.action";
import { useStoreTypeQuery } from "@/modules/common/store-type/store-type.action";
import { useAppSelector } from "@/redux/hooks/index";
import { PackageSearch, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

const Products = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [searchQuery, setSearchQuery] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectStatus, setSelectStatus] = useState<string>("");
  const [selectStoreID, setSelectStoreID] = useState<string>("");
  const [selectStoreID2, setSelectStoreID2] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const StatusList = [
  { label: t("common.draft"), value: "draft" },
  { label: t("common.pending"), value: "pending" },
  { label: t("common.approved"), value: "approved" },
  { label: t("common.inactive"), value: "inactive" },
  { label: t("common.suspended"), value: "suspended" },
];

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
      setSelectStoreID2("");
    } else {
      setSelectStoreID2(newSelectOwner);
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
      <Card className="">
        <CardContent className="grid grid-cols-1 md:grid-cols-6 items-center gap-2 p-2 md:p-4">
          <div className="py-2 md:py-0">
            <h1 className="text-md xl:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <PackageSearch /> {t("label.product")}{" "}
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 col-span-5 justify-end">
            <Link href={Routes.addProduct}>
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
                + {t("button.add_product")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      <Card className=" mt-4">
        <CardContent className="grid grid-cols-1 md:grid-cols-5 items-center gap-2 p-2 md:p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 col-span-5 justify-end">
            <div className="flex items-center gap-2">
              <AppSelect
                placeholder={t("place_holder.select_status")}
                value={String(selectStatus)}
                onSelect={handleSelectStatus}
                groups={StatusList}
                customClass="w-full lg:w-48"
              />
              <AppSelect
                placeholder={t("place_holder.select_store")}
                value={String(selectStoreID)}
                onSelect={handleSelectOwner}
                groups={StoreData}
                customClass="w-full xl:w-40"
              />
              <AppSelect
                placeholder={t("place_holder.select_store_type")}
                value={String(selectStoreID2)}
                onSelect={handleSelectOwner2}
                groups={typeData}
                customClass="w-full xl:w-40"
              />
            </div>
            <div className="relative flex items-center w-full">
              <div
                className={`${
                  locale === "ar" ? "right-3" : "left-4"
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
                className="app-input mx-0 lg:mx-2 px-8"
              />
              <Button
                variant="outline"
                onClick={handleSearchButtonClick}
                className="app-button mx-2 lg:mx-0"
              >
                {t("button.search")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <div>
        <ProductTable
          searchValue={searchValue}
          selectStatus={selectStatus}
          selectStoreID={selectStoreID}
          selectStoreID2={selectStoreID2}
        />
      </div>
    </>
  );
};

export default Products;
