"use client";
import StaffTable from "@/components/blocks/seller-section/store/staff/StaffTable";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { SellerRoutes } from "@/config/sellerRoutes";
import { UserRoundCog } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React, { useState } from "react";

const Staff = () => {
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

  return (
    <>
      <Card>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 p-2 md:p-4">
          <div className="col-span-1">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <UserRoundCog /> {t("label.all_staff")}{" "}
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 col-span-4 justify-end">
            <div className="flex items-start md:items-center my-2 md:my-0">
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
                className="app-button mx-2 md:mx-0"
              >
                {t("button.search")}
              </Button>
            </div>
            <Link href={SellerRoutes.addStaff}>
              <Button variant="outline" className="app-button">
                + {t("label.add_staff")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <StaffTable searchValue={searchValue} />
    </>
  );
};

export default Staff;
