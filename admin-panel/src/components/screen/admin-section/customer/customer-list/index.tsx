"use client";
import LoaderOverlay from "@/components/molecules/LoaderOverlay";
import CustomerListTable from "@/components/blocks/admin-section/customer/customer-list/CustomerListTable";
import { AppSelect } from "@/components/blocks/common";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { Routes } from "@/config/routes";
import { Search, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const CustomerList = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [selectStatus, setSelectStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchValue, setSearchValue] = useState({
    search: "",
  });
  const StatusList = [
    { label: t("common.active"), value: "1" },
    { label: t("common.inactive"), value: "0" },
  ];
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  const handleSearchButtonClick = () => {
    setSearchValue({
      search: searchQuery,
    });
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

  return (
    <>
      <LoaderOverlay isLoading={isLoading} />
      <Card>
        <CardContent
          dir={dir}
          className="grid grid-cols-1 md:grid-cols-5 p-2 gap-4 md:p-4"
        >
          <div className="col-span-2">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              <Users className="mt-1" /> {t("label.customers")}
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 col-span-3 justify-start md:justify-end w-full">
            <div
              dir={dir}
              className="relative flex items-center w-full md:w-[30%]"
            >
              <div
                className={` ${
                  locale === "ar" ? "right-3" : "left-3"
                } absolute  text-[#CCCFD7]`}
              >
                <Search width={18} height={18} />
              </div>
              <Input
                type="text"
                placeholder={t("place_holder.search_by_customer_name")}
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={handleSearchInputChange}
                className="px-10 app-input"
              />
            </div>

            <AppSelect
              placeholder={t("place_holder.select_status")}
              value={String(selectStatus)}
              onSelect={handleSelectStatus}
              groups={StatusList}
              customClass="mx-0 md:mx-2 w-full md:w-48"
            />

            <Link href={Routes.addCustomer}>
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
                + {t("button.add_customer")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      <div>
        <CustomerListTable
          searchValue={searchValue}
          selectStatus={selectStatus}
        />
      </div>
    </>
  );
};

export default CustomerList;
