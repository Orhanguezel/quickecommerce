"use client";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import RefundReasonTable from "@/components/blocks/admin-section/orders/RefundReason/RefundReasonTable";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { Routes } from "@/config/routes";
import { Receipt, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

const RefundReason = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
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
        <CardContent
          dir={dir}
          className="grid grid-cols-1 xl:grid-cols-4 p-2 md:p-4"
        >
          <div className="col-span-1 mb-3 xl:mb-0">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <Receipt /> {t("common.refund_reason")}
            </h1>
          </div>
          <div className="col-span-3 flex flex-col md:flex-row items-start md:items-center gap-2 justify-end w-full">
            <div
              dir={dir}
              className="relative flex items-center gap-2 justify-end w-full"
            >
              <div
                className={`${
                  locale === "ar" ? "right-4" : "left-4"
                } absolute  text-[#CCCFD7]`}
              >
                <Search width={18} height={18} />
              </div>
              <Input
                type="text"
                placeholder={t("place_holder.search_by_reason")}
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={handleSearchInputChange}
                className="px-8 app-input "
              />
              <Button
                variant="outline"
                onClick={handleSearchButtonClick}
                className="app-button"
              >
                {t("button.search")}
              </Button>
            </div>
            <Link href={Routes.addRefundReason}>
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
                + {t("common.add_refund_reason")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <RefundReasonTable searchValue={searchValue} />
    </>
  );
};

export default RefundReason;
