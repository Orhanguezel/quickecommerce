"use client";
import TransactionHistoryList from "@/components/blocks/admin-section/wallet/TransactionHistoryList";
import CustomDateRangePicker from "@/components/blocks/common/CustomDateRangePicker";
import { Card, CardContent } from "@/components/ui";
import { WalletCards } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

const TransactionHistory = () => {
  const t = useTranslations();
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });

  return (
    <>
      <Card>
        <CardContent className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between p-2 md:p-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              <WalletCards /> {t("common.transaction_history")}
            </h1>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-full">
              <CustomDateRangePicker
                dateRange={dateRange}
                onDateChange={setDateRange}
                customSide="right-0"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <div>
        <TransactionHistoryList
          startDate={dateRange.from}
          endDate={dateRange.to}
        />
      </div>
    </>
  );
};

export default TransactionHistory;
