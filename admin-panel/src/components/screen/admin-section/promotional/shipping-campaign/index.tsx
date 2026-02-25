"use client";
import ShippingCampaignTable from "@/components/blocks/admin-section/promotional/shipping-campaign/ShippingCampaignTable";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { Routes } from "@/config/routes";
import { Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";

const ShippingCampaigns = () => {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchValue, setSearchValue] = useState({ search: "" });

  const handleSearch = () => {
    setSearchValue({ search: searchQuery });
  };

  return (
    <>
      <Card>
        <CardContent className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between p-2 md:p-4">
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-blue-600" />
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white">
              {t("common.shipping_campaigns") || "Kargo Kampanyaları"}
            </h1>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex items-center w-full md:w-[250px]">
              <Search className="absolute left-3 text-gray-400" width={16} height={16} />
              <Input
                type="text"
                placeholder={t("place_holder.search_by_title")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-8 app-input"
              />
            </div>
            <Link href={Routes.addShippingCampaign}>
              <Button variant="outline" className="app-button whitespace-nowrap">
                + {t("button.add") || "Ekle"}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <ShippingCampaignTable searchValue={searchValue} />
    </>
  );
};

export default ShippingCampaigns;
