"use client";
import { formatPrice } from "@/components/molecules/formatPrice";
import multiLang from "@/components/molecules/multiLang.json";
import {
  Card,
  CardContent
} from "@/components/ui";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { useAppDispatch } from "@/redux/hooks";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";

type LangKeys = keyof IntlMessages["lang"];
const DeliverymanDashboardCard = ({ data }: any) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const multiLangData = React.useMemo(() => multiLang, []);
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const dir = locale === "ar" ? "rtl" : "ltr";
  const { currency } = useCurrencyQuery({});
  const currencyData = useMemo(() => {
    const data = (currency as any) || {};
    return data;
  }, [currency]);
  const CurrencyData = currencyData.currencies_info;

  const {
    wallet,
    order_summary,
    earning_overview,
    collection_summary,
    active_orders,
  } = data;


  return (
    <>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <Card>
          <CardContent className="p-6 w-full">
            <div>
              <h1 className="text-2xl font-semibold">
                {t("orders.order_summary")}
              </h1>
            </div>
            <div className="border-b border-slate-300 py-2"></div>
            <div className="flex items-center justify-start text-lg font-semibold mt-2">
              <div className="text-black dark:text-white text-start space-y-2 min-w-[220px]">
                <p>Total Completed Orders</p>
                <p>On Going Orders</p>
                <p>Pending Orders</p>
                <p>Cancel Orders</p>
              </div>

              <div className="text-gray-500 dark:text-white text-start space-y-2">
                <div className="flex items-center">
                  <p>:</p>
                  <p className="px-0.5 mt-0.5">
                    {order_summary?.total_completed_orders}
                  </p>
                </div>
                <div className="flex items-center">
                  <p>:</p>
                  <p className="px-0.5 mt-0.5">
                    {order_summary?.ongoing_orders}
                  </p>
                </div>
                <div className="flex items-center">
                  <p>:</p>
                  <p className="px-0.5 mt-0.5">
                    {order_summary?.pending_orders}
                  </p>
                </div>
                <div className="flex items-center">
                  <p>:</p>
                  <p className="px-0.5 mt-0.5">
                    {order_summary?.cancelled_orders}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 w-full">
            <div>
              <h1 className="text-2xl font-semibold">Collection Summary</h1>
            </div>
            <div className="border-b border-slate-300 py-2"></div>
            <div className="flex items-center justify-start text-lg font-semibold mt-2">
              <div className="text-black dark:text-white text-start space-y-2 min-w-[220px]">
                <p>Total Collected Cash</p>
                <p>Total Deposit Cash </p>
                <p>Cash in Hand</p>
              </div>

              <div className="text-gray-500 dark:text-white text-start space-y-2">
                <div className="flex items-center">
                  <p>:</p>
                  <p className="px-0.5 mt-0.5">
                    {CurrencyData
                      ? formatPrice(
                          collection_summary?.total_cash_collection,
                          CurrencyData
                        )
                      : collection_summary?.total_cash_collection}
                  </p>
                </div>
                <div className="flex items-center">
                  <p>:</p>
                  <p className="px-0.5 mt-0.5">
                    {CurrencyData
                      ? formatPrice(
                          collection_summary?.total_cash_deposit,
                          CurrencyData
                        )
                      : collection_summary?.total_cash_deposit}
                  </p>
                </div>
                <div className="flex items-center">
                  <p>:</p>
                  <p className="px-0.5 mt-0.5">
                    {CurrencyData
                      ? formatPrice(
                          collection_summary?.cash_in_hand,
                          CurrencyData
                        )
                      : collection_summary?.cash_in_hand}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 w-full">
            <div>
              <h1 className="text-2xl font-semibold">Earning Overview</h1>
            </div>
            <div className="border-b border-slate-300 py-2"></div>
            <div className="flex items-center justify-start text-lg font-semibold mt-2">
              <div className="text-black dark:text-white text-start space-y-2 min-w-[220px]">
                <p>This Week</p>
                <p>This Month </p>
                <p>This Year</p>
              </div>

              <div className="text-gray-500 dark:text-white text-start space-y-2">
                <div className="flex items-center">
                  <p>:</p>
                  <p className="px-0.5 mt-0.5">
                    {CurrencyData
                      ? formatPrice(earning_overview?.this_week, CurrencyData)
                      : earning_overview?.total_cash_collection}
                  </p>
                </div>
                <div className="flex items-center">
                  <p>:</p>
                  <p className="px-0.5 mt-0.5">
                    {CurrencyData
                      ? formatPrice(earning_overview?.this_month, CurrencyData)
                      : earning_overview?.this_month}
                  </p>
                </div>
                <div className="flex items-center">
                  <p>:</p>
                  <p className="px-0.5 mt-0.5">
                    {CurrencyData
                      ? formatPrice(earning_overview?.this_year, CurrencyData)
                      : earning_overview?.this_year}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 w-full">
            <div>
              <h1 className="text-2xl font-semibold">Wallet</h1>
            </div>
            <div className="border-b border-slate-300 py-2"></div>
            <div className="flex items-center justify-start text-lg font-semibold mt-2">
              <div className="text-black dark:text-white text-start space-y-2 min-w-[220px]">
                <p>Balance</p>
                <p>Earnings </p>
                <p>Withdraw</p>
              </div>

              <div className="text-gray-500 dark:text-white text-start space-y-2">
                <div className="flex items-center">
                  <p>:</p>
                  <p className="px-0.5 mt-0.5">
                    {CurrencyData
                      ? formatPrice(wallet?.balance, CurrencyData)
                      : wallet?.balance}
                  </p>
                </div>
                <div className="flex items-center">
                  <p>:</p>
                  <p className="px-0.5 mt-0.5">
                    {CurrencyData
                      ? formatPrice(wallet?.earnings, CurrencyData)
                      : wallet?.earnings}
                  </p>
                </div>
                <div className="flex items-center">
                  <p>:</p>
                  <p className="px-0.5 mt-0.5">
                    {CurrencyData
                      ? formatPrice(wallet?.withdrawn, CurrencyData)
                      : wallet?.withdrawn}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DeliverymanDashboardCard;
