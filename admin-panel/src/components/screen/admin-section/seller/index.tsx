"use client";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import SellerTable from "@/components/blocks/admin-section/seller/SellerTable";
import { AppSelect } from "@/components/blocks/common";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { Routes } from "@/config/routes";
import { BaggageClaim } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

const Seller = () => {
  const t = useTranslations();
  const ReviewableTypeList = [
    { label: t("common.active"), value: "1" },
    { label: t("common.inactive"), value: "0" },
    { label: t("common.suspended"), value: "2" },
  ];
  const [searchQuery, setSearchQuery] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectReviewableType, setSelectReviewableType] = useState<string>("");

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
      setSelectReviewableType("");
    } else {
      setSelectReviewableType(newSelectStatus);
    }
  };

  const pathname = usePathname();
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
        <CardContent className="flex flex-col lg:flex-row items-center justify-between p-2 lg:p-4">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <BaggageClaim /> {t("label.seller")}{" "}
            </h1>
          </div>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2">
            <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
              <AppSelect
                placeholder={t("place_holder.select_status")}
                value={String(selectReviewableType)}
                onSelect={handleSelectStatus}
                groups={ReviewableTypeList}
                customClass="w-full md:w-48"
              />
              <div className="flex items-center">
                <Input
                  type="text"
                  placeholder={t("place_holder.search_by_name")}
                  value={searchQuery}
                  onKeyDown={handleKeyDown}
                  onChange={handleSearchInputChange}
                  className="mx-0 lg:mx-2 app-input "
                />
                <Button
                  variant="outline"
                  onClick={handleSearchButtonClick}
                  className="app-button ml-2 lg:ml-0"
                >
                  {t("button.search")}
                </Button>
              </div>
            </div>
            <Link href={Routes.addSeller}>
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
                + {t("button.add_seller")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <SellerTable searchValue={searchValue} status={selectReviewableType} />
    </>
  );
};

export default Seller;
