"use client";
import React, { useEffect, useState } from "react";
import { Routes } from "@/config/routes";
import Link from "next/link";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { Boxes } from "lucide-react";
import UnitTable from "@/components/blocks/admin-section/unit/UnitTable";
import { useTranslations } from "next-intl";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import { usePathname } from "next/navigation";

type Option = {
  label: string;
  value: boolean;
};

const Unit = () => {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [options, setOptions] = useState<Option[] | null>(null);

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
        <CardContent className="flex flex-col md:flex-row justify-between gap-4 p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <Boxes /> {t("label.unit")}{" "}
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center">
              <Input
                type="text"
                placeholder={t("place_holder.search_by_name")}
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={handleSearchInputChange}
                className="mx-0 md:mx-2 app-input "
              />
              <Button
                variant="outline"
                onClick={handleSearchButtonClick}
                className="mx-2 md:mx-0 app-button"
              >
                {t("button.search")}
              </Button>
            </div>
            <Link href={Routes.addUnit}>
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
                + {t("button.add_unit")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <UnitTable searchValue={searchValue} options={options} />
    </>
  );
};

export default Unit;
