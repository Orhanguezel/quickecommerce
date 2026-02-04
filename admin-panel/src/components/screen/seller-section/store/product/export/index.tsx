"use client";
import ExportData from "@/components/blocks/seller-section/store/products/export/ExportData";
import { Card, CardContent } from "@/components/ui";
import { StoreIcon } from "lucide-react";
import { useTranslations } from "next-intl";

const Export = () => {
  const t = useTranslations();

  return (
    <>
      <Card className="">
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <StoreIcon /> {t("common.product_export")}
            </h1>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-lg border-none mt-6 ">
        <CardContent className="p-2 md:p-4">
          <ExportData />
        </CardContent>
      </Card>
    </>
  );
};

export default Export;
