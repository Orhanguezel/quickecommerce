"use client";

import StockReportTable from "@/components/blocks/admin-section/products/stock-report/StockReportTable";
import { Card, CardContent } from "@/components/ui";
import { SquareActivity } from "lucide-react";
import { useTranslations } from "next-intl";
const StockReport = () => {
const t = useTranslations()
  return (
    <>
      <Card className="">
        <CardContent className="flex flex-col md:flex-row gap-4  justify-between p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <SquareActivity /> {t("label.stock_report")}
            </h1>
          </div>
          <div className="flex items-center gap-4">
          </div>
        </CardContent>
      </Card>
      <div>
        <StockReportTable />
      </div>
    </>
  );
};

export default StockReport;
