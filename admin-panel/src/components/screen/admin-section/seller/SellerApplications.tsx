"use client";
import SellerApplicationTable from "@/components/blocks/admin-section/seller/SellerApplicationTable";
import { AppSelect } from "@/components/blocks/common";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { Routes } from "@/config/routes";
import { ClipboardList } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React, { useState } from "react";

const SellerApplications = () => {
  const t = useTranslations();
  const statusOptions = [
    { label: "Beklemede", value: "0" },
    { label: "Onaylandı", value: "1" },
    { label: "Reddedildi", value: "2" },
  ];
  const [searchQuery, setSearchQuery] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

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
    if (value === "none") {
      setStatusFilter("");
    } else {
      setStatusFilter(String(value));
    }
  };

  React.useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchValue("");
    }
  }, [searchQuery]);

  return (
    <>
      <Card>
        <CardContent className="flex flex-col lg:flex-row items-center justify-between p-2 lg:p-4">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              <ClipboardList /> Satıcı Başvuruları
            </h1>
          </div>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2">
            <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
              <AppSelect
                placeholder={t("place_holder.select_status")}
                value={String(statusFilter)}
                onSelect={handleSelectStatus}
                groups={statusOptions}
                customClass="w-full md:w-48"
              />
              <div className="flex items-center">
                <Input
                  type="text"
                  placeholder="Şirket adı, isim veya e-posta ara..."
                  value={searchQuery}
                  onKeyDown={handleKeyDown}
                  onChange={handleSearchInputChange}
                  className="mx-0 lg:mx-2 app-input"
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
            <Link href={Routes.SellerList}>
              <Button variant="outline" className="app-button">
                Satıcı Listesi
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <SellerApplicationTable
        searchValue={searchValue}
        status={statusFilter}
      />
    </>
  );
};

export default SellerApplications;
