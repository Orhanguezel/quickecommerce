"use client";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import BrandTable from "@/components/blocks/admin-section/brand/BrandTable";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { Routes } from "@/config/routes";
import { BaggageClaim } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

const Brand = () => {
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
        <CardContent className="flex flex-col lg:flex-row justify-between p-2 lg:p-4">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <BaggageClaim /> {t("label.all_brand")}{" "}
            </h1>
          </div>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
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
                className="app-button mx-2 lg:mx-0"
              >
                {t("button.search")}
              </Button>
            </div>
            <Link href={Routes.addBrand}>
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
                + {t("button.add_brand")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <BrandTable searchValue={searchValue} />
    </>
  );
};

export default Brand;
