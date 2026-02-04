"use client";
import CustomDateRangePicker from "@/components/blocks/common/CustomDateRangePicker";
import WalletList from "@/components/blocks/seller-section/store/financial/wallet/WalletList";
import { Card, CardContent } from "@/components/ui";
import { format, formatDate } from "date-fns";
import { WalletCards } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
const Wallet = () => {
  const t = useTranslations();
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });
  const formattedFrom = dateRange.from
    ? formatDate(dateRange.from, "yyyy-MM-dd")
    : null;
  const formattedTo = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : null;

  return (
    <>
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4 items-center justify-start md:justify-between p-2 md:p-4">
          <div className="w-full md:w-auto">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              <WalletCards /> {t("label.wallets")}
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full md:w-auto">
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
        <WalletList startDate={formattedFrom} endDate={formattedTo} />
      </div>
    </>
  );
};

export default Wallet;
