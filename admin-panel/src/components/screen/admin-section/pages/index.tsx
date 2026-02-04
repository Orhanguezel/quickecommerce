"use client";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import PagesTable from "@/components/blocks/admin-section/pages/PageTable";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { Routes } from "@/config/routes";
import { Layers3 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

const Page = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
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
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <Layers3 /> {t("label.pages")}{" "}
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
            <div className="flex items-center w-full md:w-auto">
              <Input
                type="text"
                placeholder={t("place_holder.search_by_name")}
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={handleSearchInputChange}
                className="mx-o md:mx-2 w-full md:w-auto"
              />
              <Button
                variant="outline"
                onClick={handleSearchButtonClick}
                className="app-button mx-2 md:mx-0"
              >
                {t("button.search")}
              </Button>
            </div>
            <Link href={Routes.addPage}>
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
                + {t("button.add_page")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <PagesTable searchValue={searchValue} />
    </>
  );
};

export default Page;
