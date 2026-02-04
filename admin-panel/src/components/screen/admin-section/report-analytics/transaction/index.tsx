"use client";
import TransactionReportTable from "@/components/blocks/admin-section/report-analytics/transaction/TransactionReportTable";
import { Card, CardContent } from "@/components/ui";
import { Sheet } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";


const TransactionReport = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  return (
    <>
      <Card>
        <CardContent className="p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <Sheet /> {t("label.transaction_report")}
            </h1>
          </div>
        </CardContent>
      </Card>

      <TransactionReportTable />
    </>
  );
};

export default TransactionReport;
