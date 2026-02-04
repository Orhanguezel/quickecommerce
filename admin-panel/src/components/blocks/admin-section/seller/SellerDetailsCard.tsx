"use client";
import { formatPrice } from "@/components/molecules/formatPrice";
import multiLang from "@/components/molecules/multiLang.json";
import { Card, CardContent } from "@/components/ui";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { useAppDispatch } from "@/redux/hooks";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";

import {
  TotalCanceledOrderIcon,
  TotalCompletedOrderIcon,
  TotalEarningsIcon,
  TotalInProcessOrderIcon,
  TotalOrderIcon,
  TotalProductsIcon,
  TotalQueueOrderIcon,
  TotalRefundedOrderIcon,
  TotalRefundIcon,
  TotalRevenue2Icon,
  TotalStaffIcon,
  TotalStoresIcon
} from "@/assets/icons";
import TotalProcessingOrdersIcon from "@/assets/icons/TotalProcessingOrdersIcon";
import { Routes } from "@/config/routes";
import Link from "next/link";

type LangKeys = keyof IntlMessages["lang"];
const SellerDetailsCard = ({ data }: any) => {
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
  const { summary = {}, order_summary = {} } = data;

  const {
    store = {},
    order = {},
    product = {},
    earnings = {},
    refunds = {},
    revenue = {},
  } = summary;
  const {
    pending_orders = {},
    completed_orders = {},
    cancelled_orders = {},
    refunded_orders = {},
    unassigned_orders = {},
    processing_orders = {},
    shipped_orders = {},
    deliveryman_not_assigned_orders = {},
  } = order_summary;

  return (
    <>
      <div className="mt-4">
        <Card>
          <CardContent className="p-2 md:p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#F5EDDF] dark:bg-gray-700">
                <CardContent className="flex items-center gap-3 p-6">
                  <div className="p-2">
                    <TotalStoresIcon />
                  </div>
                  <div>
                    <Link className="" href={Routes.storeList}>
                      <div className="text-md">{store?.title}</div>
                    </Link>
                    <div className="text-xl font-bold">{store?.count}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#E5E4F7] dark:bg-gray-700">
                <CardContent className="flex items-center gap-3 p-6">
                  <div className="p-2">
                    <TotalProductsIcon />
                  </div>
                  <div>
                    <Link className="" href={Routes.productList}>
                      <div className="text-md ">{product?.title}</div>
                    </Link>

                    <div className="text-xl font-bold ">{product?.count}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#EBF0E3] dark:bg-gray-700">
                <CardContent className="flex items-center gap-3 p-6">
                  <div className="p-2">
                    <TotalOrderIcon />
                  </div>
                  <div>
                    <Link href={Routes.ordersList}>
                      <div className="text-md ">{order?.title}</div>
                    </Link>

                    <div className="text-xl font-bold ">{order?.count}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#DEF0EE] dark:bg-gray-700">
                <CardContent className="flex items-center gap-3 p-6">
                  <div className="p-2 text-[#4EBCAF]">
                    <TotalCompletedOrderIcon />
                  </div>
                  <div>
                    <div className="text-md ">{completed_orders?.title}</div>
                    <div className="text-xl font-bold">
                      {completed_orders?.count}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#E7EDE3] dark:bg-gray-700">
                <CardContent className="flex items-center gap-3 p-6">
                  <div className="p-2 text-[#87A870]">
                    <TotalQueueOrderIcon />
                  </div>
                  <div>
                    <div className="text-md">
                      {deliveryman_not_assigned_orders?.title}
                    </div>
                    <div className="text-xl font-bold">
                      {deliveryman_not_assigned_orders?.count}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#F1E7F3] dark:bg-gray-700">
                <CardContent className="flex items-center gap-3 p-6">
                  <div className="p-2">
                    <TotalProcessingOrdersIcon />
                  </div>
                  <div>
                    <div className="text-md ">{processing_orders?.title}</div>

                    <div className="text-xl font-bold ">
                      {processing_orders?.count}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#E1F2F5] dark:bg-gray-700">
                <CardContent className="flex items-center gap-3 p-6">
                  <div className="p-2">
                    <TotalStaffIcon />
                  </div>
                  <div>
                    <div className="text-md ">{shipped_orders?.title}</div>

                    <div className="text-xl font-bold">
                      {shipped_orders?.count}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#E1F3E7] dark:bg-gray-700">
                <CardContent className="flex items-center gap-3 p-6">
                  <div className="p-2">
                    <TotalInProcessOrderIcon />
                  </div>
                  <div>
                    <div className="text-md ">{pending_orders?.title}</div>
                    <div className="text-xl font-bold">
                      {pending_orders?.count}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#F4F0E2] dark:bg-gray-700">
                <CardContent className="flex items-center gap-3 p-6">
                  <div className="p-2 text-[#E3C048]">
                    <TotalRefundedOrderIcon />
                  </div>
                  <div>
                    <div className="text-md ">{refunded_orders?.title}</div>
                    <div className="text-xl font-bold">
                      {refunded_orders?.count}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#E1EDF2] dark:bg-gray-700">
                <CardContent className="flex items-center gap-3 p-6">
                  <div className="p-2 text-[#45A0C7]">
                    <TotalCanceledOrderIcon />
                  </div>
                  <div>
                    <div className="text-md ">{cancelled_orders?.title}</div>
                    <div className="text-xl font-bold">
                      {cancelled_orders?.count}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#EDE6F3] dark:bg-gray-700">
                <CardContent className="flex items-center gap-3 p-6">
                  <div className="p-2 text-[#A970DA]">
                    <TotalEarningsIcon />
                  </div>
                  <div>
                    <div className="text-md ">{earnings?.title}</div>
                    <div className="text-xl font-bold">
                      {earnings?.count
                        ? formatPrice(earnings?.count, CurrencyData)
                        : earnings?.count}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#F3E9E9] dark:bg-gray-700">
                <CardContent className="flex items-center gap-3 p-6">
                  <div className="p-2 text-[#F38585]">
                    <TotalRefundIcon />
                  </div>

                  <div>
                    <div className="text-md ">{refunds?.title}</div>
                    <div className="text-xl font-bold ">
                      {refunds?.count
                        ? formatPrice(refunds?.count, CurrencyData)
                        : refunds?.count}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#E6F3F5] dark:bg-gray-700">
                <CardContent className="flex items-center gap-3 p-6">
                  <div className="p-2 text-[#4CC3D5]">
                    <TotalRevenue2Icon />
                  </div>
                  <div>
                    <div className="text-md ">{revenue?.title}</div>
                    <div className="text-xl font-bold ">
                      {revenue?.count
                        ? formatPrice(revenue?.count, CurrencyData)
                        : revenue?.count}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SellerDetailsCard;
