"use client";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import SliderTable from "@/components/blocks/admin-section/slider/SliderTable";
import { AppSelect } from "@/components/blocks/common";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { Routes } from "@/config/routes";
import { Images } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

const Slider = () => {
  const t = useTranslations();
  const statusList = [
    { label: t("common.web"), value: "web " },
    { label: t("common.mobile"), value: "mobile" },
  ];
  const pathname = usePathname();
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
        <CardContent className="grid grid-cols-1 xl:grid-cols-5 items-center gap-4 p-2 md:p-4">
          <div className="col-span-1">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <Images /> {t("common.all_slider")}{" "}
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 col-span-4 justify-start md:justify-end w-full">
            <div className="flex flex-col md:flex-row gap-2 items-start md:items-center w-full">
              <div className="flex items-center gap-2 w-full">
                <Input
                  type="text"
                  placeholder="Search with title or sub title or button text.."
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
              <AppSelect
                placeholder="Select Platform"
                value={String(selectReviewableType)}
                onSelect={handleSelectStatus}
                groups={statusList}
                customClass="w-full md:w-48"
              />
            </div>
            <Link href={Routes.addSlider}>
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
                + {t("button.add_slider")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <SliderTable searchValue={searchValue} status={selectReviewableType} />
    </>
  );
};

export default Slider;
