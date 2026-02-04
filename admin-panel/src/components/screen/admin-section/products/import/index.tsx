"use client";
import ImportData from "@/components/blocks/admin-section/products/import/ImportData";
import { Card, CardContent } from "@/components/ui";
import { StoreIcon } from "lucide-react";
import { useTranslations } from "next-intl";

const Import = () => {
  const t = useTranslations()
  return (
    <>
      <Card className="">
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <StoreIcon />  {t("label.product_import")}
            </h1>
          </div>
        </CardContent>
      </Card>
      <>
        <ImportData />
      </>
    </>
  );
};

export default Import;
