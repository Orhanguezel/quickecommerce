"use client";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import { AppSelect } from "@/components/blocks/common";
import ProductTable from "@/components/blocks/seller-section/store/products/ProductTable";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { SellerRoutes } from "@/config/sellerRoutes";
import { useAppSelector } from "@/redux/hooks/index";
import { PackageSearch, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
type Option = {
  label: string;
  value: boolean;
};

const Products = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [searchQuery, setSearchQuery] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectStatus, setSelectStatus] = useState<string>("");
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
            <Link href={SellerRoutes.productAdd}>
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
      <Card className="mt-4">
        <CardContent className="grid grid-cols-1 md:grid-cols-5 items-center gap-2 p-2 md:p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 col-span-5 justify-end">
            <div className="flex items-center gap-2 w-full lg:w-48">
              <AppSelect
                placeholder={t("place_holder.select_status")}
                value={String(selectStatus)}
                onSelect={handleSelectStatus}
                groups={StatusList}
                customClass=""
              />
            </div>
            <div className="relative flex items-center gap-2 w-full">
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
                className="app-input px-8"
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
        <ProductTable selectStatus={selectStatus} searchValue={searchValue} />
      </div>
    </>
  );
};

export default Products;
