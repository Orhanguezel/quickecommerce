"use client";
import { Card, CardContent } from "@/components/ui";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { format } from "date-fns";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import CustomAreaChart from "../../charts/AreaChart";
import CustomBarChart from "../../charts/BarChart";

import {
  TotalAreaIcon,
  TotalCanceledOrderIcon,
  TotalCompletedOrderIcon,
  TotalCustomerIcon,
  TotalDeliveryManIcon,
  TotalEarningsIcon,
  TotalInProcessOrderIcon,
  TotalOrderIcon,
  TotalProductsIcon,
  TotalQueueOrderIcon,
  TotalRefundedOrderIcon,
  TotalRefundIcon,
  TotalRevenue2Icon,
  TotalSellersIcon,
  TotalStoresIcon,
  TotalSubscriptionEarningsIcon,
  TotalTaxIcon,
  TotalTicketsIcon,
  TotalWithdrawIcon
} from "@/assets/icons";
import ReviewIcon from "@/assets/icons/ReviewIcon";
import TotalPosOrderEarningsIcon from "@/assets/icons/TotalPosOrderEarningsIcon";
import { AppSelect } from "@/components/blocks/common";
import CustomDateRangePicker from "@/components/blocks/common/CustomDateRangePicker";
import { formatPrice } from "@/components/molecules/formatPrice";
import { Routes } from "@/config/routes";
import GlobalImageLoader from "@/lib/imageLoader";
import {
  useAdminDashboardQuery,
  useAdminGrowthOrderQuery,
  useAdminOtherSummaryQuery,
  useAdminSalesSummaryQuery,
  useStoreTypeListQuery,
} from "@/modules/admin-section/admin-dashboard/admin-dashboard.action";
import { Mail, Phone, Store } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AppSearchSelect } from "../../common/AppSearchSelect";
import { CustomViewIcon } from "../../custom-icons";
import DashboardSkeleton from "./components/DashboardSkeleton";

const StatusList = [
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "This Year", value: "this_year" },
];

const OwnerDashboard = () => {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const localeDir = pathname.split("/")[1];
  const dir = localeDir === "ar" ? "rtl" : "ltr";
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });
  const [selectStatus, setSelectStatus] = useState<string>("");
  const [hasPermission, setHasPermission] = useState(true);

  const handleSelectStatus = (value: string) => {
    const newSelectStatus = String(value);
    if (value === "none") {
      setSelectStatus("");
    } else {
      setSelectStatus(newSelectStatus);
    }
  };
  const { Stype } = useStoreTypeListQuery({
    language: locale,
  });
  let storeList = (Stype as any) || [];
  const [selectStoreType, setSelectStoreType] = useState<string>("");

  const handleSelectStoreType = (value: string) => {
    const newSelectOwner = String(value);
    if (value === "none") {
      setSelectStoreType("");
    } else {
      setSelectStoreType(newSelectOwner);
    }
  };

  const {
    AdminDashboard,
    refetch,
    isPending: isDashboardLoading,
  } = useAdminDashboardQuery({ store_type: selectStoreType, language: locale });
  const AdminDashboardData = useMemo(() => {
    const data = (AdminDashboard as any) || {};
    return data;
  }, [AdminDashboard]);

  const {
    AdminSalesSummary,
    refetch: SalesSummaryRefetch,
    isPending: isSalesSummaryLoading,
    error: SalesSummaryError,
  } = useAdminSalesSummaryQuery({
    language: locale,
    start_date: dateRange.from ?? "",
    end_date: dateRange.to ?? "",
    time_period: selectStatus,
    store_type: selectStoreType,
  });

  const AdminSalesSummaryData = useMemo(() => {
    const data = (AdminSalesSummary as any) || {};
    return data;
  }, [AdminSalesSummary]);

  const {
    AdminOrderGrowth,
    refetch: SellerGrowthRefetch,
    isPending: isOrderGrowthLoading,
    error: SellerGrowthError,
  } = useAdminGrowthOrderQuery({
    store_type: selectStoreType,
    language: locale,
  });
  const AdminOrderGrowthData = useMemo(() => {
    const data = (AdminOrderGrowth as any) || {};
    return data;
  }, [AdminOrderGrowth]);

  const {
    AdminOtherSummary,
    refetch: SellerOtherRefetch,
    isPending: isOtherSummaryLoading,
    error: SellerOtherError,
  } = useAdminOtherSummaryQuery({
    store_type: selectStoreType,
    language: locale,
  });
  const AdminOtherSummaryData = useMemo(() => {
    const data = (AdminOtherSummary as any) || {};
    return data;
  }, [AdminOtherSummary]);

  const {
    top_rated_products = [],
    recent_completed_orders = [],
    top_selling_stores = [],
    top_categories = [],
  } = AdminOtherSummaryData;
  const originalData = useMemo(() => {
    const data = (recent_completed_orders as any) || [];
    return data?.map((item: any, index: number) => ({
      ...item,
      sl: index + 1,
    }));
  }, [recent_completed_orders]);

  const {
    summary = {},
    order_summary = {},
    financial_summary = {},
  } = AdminDashboardData;
  const {
    store = {},
    order = {},
    product = {},
    area = {},
    customer = {},
    deliveryman = {},
    store_owner = {},
  } = summary;
  const {
    pending_orders = {},
    completed_orders = {},
    cancelled_orders = {},
    refunded_orders = {},
    unassigned_orders = {},
  } = order_summary;
  const {
    subscription_earnings = {},
    total_order_amount = {},
    total_order_commission = {},
    total_refunds = {},
    total_revenue = {},
    total_tax = {},
    total_withdrawals = {},
    total_pos_order_earnings = {},
  } = financial_summary;

  const { currency, refetch: refetchCurrency } = useCurrencyQuery({});
  const currencyData = useMemo(() => {
    const data = (currency as any) || {};
    return data;
  }, [currency]);
  const CurrencyData = currencyData.currencies_info;

  const router = useRouter();
  const [viewRowId, setViewRowId] = useState<string | null>(null);
  const handleView = (Id: string) => {
    setViewRowId(Id);
    router.push(`${Routes.orderDetails}/${Id}`);
  };
  const UserName = localStorage.getItem("admin_user_name");

  const isLoading =
    isDashboardLoading ||
    isSalesSummaryLoading ||
    isOrderGrowthLoading ||
    isOtherSummaryLoading;

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          refetch(),
          SalesSummaryRefetch(),
          SellerGrowthRefetch(),
          SellerOtherRefetch(),
          refetchCurrency(),
        ]);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? `Error refetching data: ${error.message}`
            : "An unknown error occurred while refetching data"
        );
      }
    };

    fetchData();
  }, [
    refetch,
    SalesSummaryRefetch,
    SellerGrowthRefetch,
    SellerOtherRefetch,
    refetchCurrency,
    selectStoreType,
  ]);

  useEffect(() => {
    if (!isSalesSummaryLoading && !SalesSummaryError) {
      SalesSummaryRefetch();
    }
  }, [
    SalesSummaryRefetch,
    dateRange.from,
    dateRange.to,
    selectStatus,
    SalesSummaryError,
    isSalesSummaryLoading,
  ]);

  useEffect(() => {
    const errors = [SalesSummaryError, SellerGrowthError, SellerOtherError];
    const has403 = errors.some(
      (err: any) => err?.response?.status === 403 || err?.status === 403
    );
    if (has403) {
      setHasPermission(false);
    }
  }, [SalesSummaryError, SellerGrowthError, SellerOtherError]);

  return (
    <div className="">
      <Card>
        <CardContent className="p-4 mb-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              {t("common.hello")},{" "}
              <span className="font-semibold text-blue-500">{UserName}</span>
            </h1>
            <p className="text-md text-gray-500 dark:text-white  flex items-center gap-2">
              {" "}
              {t("common.welcome_to_personalized_dashboard")}
            </p>
          </div>
          <div className="w-full md:w-48">
            <AppSearchSelect
              placeholder={t("place_holder.select_store_type")}
              value={String(selectStoreType)}
              onSelect={handleSelectStoreType}
              groups={storeList}
              customClass=""
            />
          </div>
        </CardContent>
      </Card>
      {!hasPermission ? (
        <Card>
          <CardContent className="p-2 md:p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              <Card className="min-h-[100px] relative overflow-hidden rounded-lg flex items-center bg-[linear-gradient(to_right,rgba(5,7,89,0.2),rgba(94,98,255,0.2))]">
                <div className="absolute -top-16 -right-4 w-32 h-32 bg-[#FFFFFF1A] rounded-full"></div>
                <div className="absolute bottom-6 -right-8 translate-y-1/2 w-28 h-28 bg-[#FFFFFF1A] rounded-full z-0"></div>
                <CardContent className="flex items-center gap-3 p-6"></CardContent>
              </Card>

              <Card className="min-h-[100px] relative overflow-hidden rounded-lg flex items-center bg-[linear-gradient(to_right,rgba(7,114,78,0.2),rgba(0,201,134,0.2))]">
                <div className="absolute -top-16 -right-4 w-32 h-32 bg-[#FFFFFF1A] rounded-full"></div>
                <div className="absolute bottom-6 -right-8 translate-y-1/2 w-28 h-28 bg-[#FFFFFF1A] rounded-full z-0"></div>
                <CardContent className="flex items-center gap-3 p-6"></CardContent>
              </Card>

              <Card className="min-h-[100px] relative overflow-hidden rounded-lg flex items-center bg-[linear-gradient(to_right,rgba(175,102,0,0.2),rgba(255,160,0,0.2))]">
                <div className="absolute -top-16 -right-4 w-32 h-32 bg-[#FFFFFF1A] rounded-full"></div>
                <div className="absolute bottom-6 -right-8 translate-y-1/2 w-28 h-28 bg-[#FFFFFF1A] rounded-full z-0"></div>
                <CardContent className="flex items-center gap-3 p-6"></CardContent>
              </Card>

              <Card className="min-h-[100px] relative overflow-hidden rounded-lg flex items-center bg-[linear-gradient(to_right,rgba(19,17,22,0.2),rgba(77,69,109,0.2))]">
                <div className="absolute -top-16 -right-4 w-32 h-32 bg-[#FFFFFF1A] rounded-full"></div>
                <div className="absolute bottom-6 -right-8 translate-y-1/2 w-28 h-28 bg-[#FFFFFF1A] rounded-full z-0"></div>
                <CardContent className="flex items-center gap-3 p-6"></CardContent>
              </Card>

              <Card className="min-h-[100px] relative overflow-hidden rounded-lg flex items-center bg-[linear-gradient(to_right,rgba(0,40,104,0.2),rgba(59,130,246,0.2))]">
                <div className="absolute -top-16 -right-4 w-32 h-32 bg-[#FFFFFF1A] rounded-full"></div>
                <div className="absolute bottom-6 -right-8 translate-y-1/2 w-28 h-28 bg-[#FFFFFF1A] rounded-full z-0"></div>
                <CardContent className="flex items-center gap-3 p-6"></CardContent>
              </Card>
            </div>

            <div className="w-full text-center my-8 text-xl font-semibold text-red-500 ">
              You do not have permission to access this dashboard
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {" "}
          {isLoading ? (
            <DashboardSkeleton />
          ) : (
            <>
              <Card>
                <CardContent className="p-2 md:p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {!selectStoreType && (
                      <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#EFEFFE] dark:bg-gray-700">
                        <CardContent className="flex items-center gap-3 p-6">
                          <div className="p-2">
                            <TotalCustomerIcon />
                          </div>
                          <div className="">
                            <Link href={Routes.CustomerList}>
                              <div className="text-md ">{customer?.title}</div>
                            </Link>
                            <div className="text-xl font-bold ">
                              {customer?.count}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#EFFCEF] dark:bg-gray-700">
                      <CardContent className="flex items-center gap-3 p-6">
                        <div className="p-2">
                          <TotalSellersIcon />
                        </div>
                        <div>
                          <Link href={Routes.SellerList}>
                            <div className="text-md ">{store_owner?.title}</div>
                          </Link>

                          <div className="text-xl font-bold">
                            {store_owner?.count}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#F5EDDF] dark:bg-gray-700">
                      <CardContent className="flex items-center gap-3 p-6">
                        <div className="p-2">
                          <TotalStoresIcon />
                        </div>
                        <div>
                          <Link className="" href={Routes.storeList}>
                            <div className="text-md">{store?.title}</div>
                          </Link>
                          <div className="text-xl font-bold">
                            {store?.count}
                          </div>
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

                          <div className="text-xl font-bold ">
                            {product?.count}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {!selectStoreType && (
                      <>
                        <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#E4EAF4] dark:bg-gray-700">
                          <CardContent className="flex items-center gap-3 p-6">
                            <div className="p-2">
                              <TotalDeliveryManIcon />
                            </div>
                            <div>
                              <div className="text-md">
                                {deliveryman?.title}
                              </div>
                              <div className="text-xl font-bold">
                                {deliveryman?.count}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#EEEAFA] dark:bg-gray-700">
                          <CardContent className="flex items-center gap-3 p-6">
                            <div className="p-2">
                              <TotalAreaIcon />
                            </div>
                            <div>
                              <Link className="" href={Routes.areaList}>
                                <div className="text-md ">{area?.title}</div>
                              </Link>

                              <div className="text-xl font-bold ">
                                {area?.count}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    )}
                    <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#EBF0E3] dark:bg-gray-700">
                      <CardContent className="flex items-center gap-3 p-6">
                        <div className="p-2">
                          <TotalOrderIcon />
                        </div>
                        <div>
                          <Link href={Routes.ordersList}>
                            <div className="text-md ">{order?.title}</div>
                          </Link>

                          <div className="text-xl font-bold ">
                            {order?.count}
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
                          <div className="text-md ">
                            {pending_orders?.title}
                          </div>
                          <div className="text-xl font-bold">
                            {pending_orders?.count}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#DEF0EE] dark:bg-gray-700">
                      <CardContent className="flex items-center gap-3 p-6">
                        <div className="p-2 text-[#4EBCAF]">
                          <TotalCompletedOrderIcon />
                        </div>
                        <div>
                          <div className="text-md ">
                            {completed_orders?.title}
                          </div>
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
                          <div className="text-md ">
                            {unassigned_orders?.title}
                          </div>
                          <div className="text-xl font-bold">
                            {unassigned_orders?.count}
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
                          <div className="text-md ">
                            {refunded_orders?.title}
                          </div>
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
                          <div className="text-md ">
                            {cancelled_orders?.title}
                          </div>
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
                          <div className="text-md ">
                            {total_order_amount?.title}
                          </div>
                          <div className="text-xl font-bold ">
                            {total_order_amount?.count
                              ? formatPrice(
                                  total_order_amount?.count,
                                  CurrencyData
                                )
                              : total_order_amount?.count}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-orange-100 dark:bg-gray-700">
                      <CardContent className="flex items-center gap-3 p-6">
                        <div className="p-2 text-orange-400">
                          <TotalPosOrderEarningsIcon />
                        </div>
                        <div>
                          <div className="text-md ">
                            {total_pos_order_earnings?.title}
                          </div>
                          <div className="text-xl font-bold ">
                            {total_pos_order_earnings?.count
                              ? formatPrice(
                                  total_pos_order_earnings?.count,
                                  CurrencyData
                                )
                              : total_pos_order_earnings?.count}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#E1F1E7] dark:bg-gray-700">
                      <CardContent className="flex items-center gap-3 p-6">
                        <div className="p-2 text-[#69BA87]">
                          <TotalSubscriptionEarningsIcon />
                        </div>
                        <div>
                          <div className="text-md ">
                            {subscription_earnings?.title}
                          </div>
                          <div className="text-xl font-bold">
                            {subscription_earnings?.count
                              ? formatPrice(
                                  subscription_earnings?.count,
                                  CurrencyData
                                )
                              : subscription_earnings?.count}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#E1F3E7] dark:bg-gray-700">
                      <CardContent className="flex items-center gap-3 p-6">
                        <div className="p-2 text-[#8AAF97]">
                          <TotalTicketsIcon />
                        </div>
                        <div>
                          <div className="text-md ">
                            {total_order_commission?.title}
                          </div>

                          <div className="text-xl font-bold">
                            {total_order_commission?.count
                              ? formatPrice(
                                  total_order_commission?.count,
                                  CurrencyData
                                )
                              : total_order_commission?.count}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#E7ECF1] dark:bg-gray-700">
                      <CardContent className="flex items-center gap-3 p-6">
                        <div className="p-2 text-[#7391AE]">
                          <TotalWithdrawIcon />
                        </div>
                        <div>
                          <div className="text-md ">
                            {total_withdrawals?.title}
                          </div>
                          <div className="text-xl font-bold">
                            {total_withdrawals?.count
                              ? formatPrice(
                                  total_withdrawals?.count,
                                  CurrencyData
                                )
                              : total_withdrawals?.count}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#F1E7F3] dark:bg-gray-700">
                      <CardContent className="flex items-center gap-3 p-6">
                        <div className="p-2 text-[#CC90D8]">
                          <TotalTaxIcon />
                        </div>
                        <div>
                          <div className="text-md ">{total_tax?.title}</div>
                          <div className="text-xl font-bold ">
                            {total_tax?.count
                              ? formatPrice(total_tax?.count, CurrencyData)
                              : total_tax?.count}
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
                          <div className="text-md ">{total_refunds?.title}</div>
                          <div className="text-xl font-bold ">
                            {total_refunds?.count
                              ? formatPrice(total_refunds?.count, CurrencyData)
                              : total_refunds?.count}
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
                          <div className="text-md ">{total_revenue?.title}</div>
                          <div className="text-xl font-bold ">
                            {total_revenue?.count
                              ? formatPrice(total_revenue?.count, CurrencyData)
                              : total_revenue?.count}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6 my-6 mt-6">
                <Card dir={dir} className="p-2 md:p-4">
                  <div className="p-2 flex flex-col md:flex-row gap-4 md:gap-0 items-start md:items-center justify-between w-full mb-4">
                    <div
                      className={` ${
                        dir === "rtl" ? "border-r-4" : "border-l-4"
                      } text-md font-bold flex items-center gap-2  border-blue-500 px-2 `}
                    >
                      {t("common.sales_summary")}
                    </div>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                      <AppSelect
                        placeholder={t("place_holder.select_time_period")}
                        value={String(selectStatus)}
                        onSelect={handleSelectStatus}
                        groups={StatusList}
                        customClass="w-full h-[41px]"
                      />
                      <div className="w-full">
                        <CustomDateRangePicker
                          dateRange={dateRange}
                          onDateChange={setDateRange}
                          customSide="right-0"
                          customWidth="!min-w-[240px]"
                        />
                      </div>
                    </div>
                  </div>
                  <CustomAreaChart
                    data={AdminSalesSummaryData}
                    isPending={isSalesSummaryLoading}
                  />
                </Card>
                <Card className="p-2 md:p-4">
                  <div className="p-2 flex items-center justify-between mb-4">
                    <div
                      className={` ${
                        dir === "rtl" ? "border-r-4" : "border-l-4"
                      } text-md font-bold flex items-center gap-2  border-blue-500 px-2 `}
                    >
                      {t("common.order_growth")}
                    </div>
                  </div>
                  <CustomBarChart
                    data={AdminOrderGrowthData}
                    isPending={isOrderGrowthLoading}
                  />
                </Card>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6 my-6">
                {Array.isArray(top_selling_stores) &&
                top_selling_stores.length > 0 ? (
                  <Card className="">
                    <div className="px-2 md:px-4">
                      <div className="p-2 my-4">
                        <div
                          className={` ${
                            dir === "rtl" ? "border-r-4" : "border-l-4"
                          } text-md font-bold flex items-center gap-2  border-blue-500 px-2 `}
                        >
                          {t("common.top_10_stores")}
                        </div>
                      </div>

                      <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {Array.isArray(top_selling_stores) &&
                        top_selling_stores.length > 0
                          ? top_selling_stores?.map(
                              (topRatedProduct, index) => {
                                const {
                                  name,
                                  slug,
                                  rating,
                                  price,
                                  phone,
                                  email,
                                  logo,
                                  store_type,
                                } = topRatedProduct;
                               
                                return (
                                  <Card key={index} className="my-2">
                                    <CardContent className="grid grid-cols-1 p-4">
                                      <div className="flex flex-col md:flex-row items-center gap-4">
                                        <div className="relative w-[60px] h-[60px]">
                                          {logo ? (
                                            <Image
                                              loader={GlobalImageLoader}
                                              src={logo}
                                              alt="logo"
                                              fill
                                              sizes="240px"
                                              className="w-full h-full rounded"
                                            />
                                          ) : (
                                            <Image
                                              src="/images/no-image.png"
                                              alt="no_image"
                                              fill
                                              sizes="240px"
                                              className=" w-full h-full rounded"
                                            />
                                          )}
                                        </div>
                                        <div className="flex flex-col md:flex-row items-center justify-between w-full">
                                          <div>
                                            <Link
                                              className="text-blue-500 hover:underline dark:text-[#93c5fd] dark:hover:text-white"
                                              href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/stores/details/${slug}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              <div>
                                                <p className="text-lg font-semibold text-center md:text-start">
                                                  {name}
                                                </p>
                                              </div>
                                            </Link>

                                            <p className=" flex items-center gap-2 text-sm text-gray-500 dark:text-white">
                                              <span className="bg-blue-50 p-1 rounded-full text-blue-500">
                                                <Store width={10} height={10} />
                                              </span>{" "}
                                              {store_type}
                                            </p>
                                            <p className=" flex items-center gap-2 text-sm text-gray-500 dark:text-white">
                                              <span className="bg-blue-50 p-1 rounded-full text-blue-500">
                                                <Phone width={10} height={10} />
                                              </span>{" "}
                                              {phone}
                                            </p>
                                            <p className=" flex items-center gap-2 text-sm text-gray-500 dark:text-white">
                                              <span className="bg-orange-50 p-1 rounded-full text-orange-500">
                                                <Mail width={10} height={10} />
                                              </span>{" "}
                                              {email}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              }
                            )
                          : ""}
                      </div>
                    </div>
                  </Card>
                ) : (
                  ""
                )}
                {Array.isArray(originalData) && originalData.length > 0 ? (
                  <Card>
                    <div className="px-2 md:px-4">
                      <div className="p-2 my-4">
                        <div
                          className={` ${
                            dir === "rtl" ? "border-r-4" : "border-l-4"
                          } text-md font-bold flex items-center gap-2  border-blue-500 px-2 `}
                        >
                          {t("common.recent_order_lists")}
                        </div>
                      </div>
                      <div className="overflow-x-auto custom-scrollbar">
                        <div className="min-w-[120px] px-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                          <Card className="">
                            <CardContent className="grid grid-cols-10 gap-4 p-3 text-start text-sm font-bold ">
                              <p className="col-span-2">
                                {t("table_header.order_id")}
                              </p>
                              <p className="col-span-3">
                                {" "}
                                {t("table_header.order_date")}
                              </p>

                              <p className="col-span-2">
                                {t("table_header.store")}
                              </p>
                              <p className="col-span-2 pr-2 text-end">
                                {t("table_header.amount")}
                              </p>
                              <p className="pr-2 text-end">
                                {t("table_header.actions")}
                              </p>
                            </CardContent>
                          </Card>
                          {Array.isArray(originalData) &&
                          originalData.length > 0
                            ? originalData?.map((recentOrder, index) => {
                                const {
                                  sl,
                                  order_date,
                                  order_amount,
                                  order_id,
                                  store,
                                  review_count,
                                } = recentOrder;

                                return (
                                  <Card key={index} className="my-2">
                                    <CardContent className="grid grid-cols-10 gap-4 p-3 text-start text-sm text-[#102A43] dark:text-white">
                                      <p className="col-span-2 pl-2">
                                        #{order_id}
                                      </p>
                                      <p className="col-span-3">
                                        {order_date &&
                                          format(
                                            order_date,
                                            "dd MMMM yyyy, hh:mm a"
                                          )}
                                      </p>
                                      <p className="col-span-2">{store}</p>
                                      <p className="col-span-2 text-end pr-2">
                                        {order_amount
                                          ? formatPrice(
                                              order_amount,
                                              CurrencyData
                                            )
                                          : order_amount}
                                      </p>
                                      <p className="">
                                        <CustomViewIcon
                                          isLoading={viewRowId === order_id}
                                          onClick={() => handleView(order_id)}
                                        />
                                      </p>
                                    </CardContent>
                                  </Card>
                                );
                              })
                            : ""}
                        </div>
                      </div>
                    </div>
                  </Card>
                ) : (
                  ""
                )}
                {Array.isArray(top_rated_products) &&
                top_rated_products.length > 0 ? (
                  <Card className="">
                    <div className="px-2 md:px-4">
                      <div className="p-2 my-4">
                        <div
                          className={` ${
                            dir === "rtl" ? "border-r-4" : "border-l-4"
                          } text-md font-bold flex items-center gap-2  border-blue-500 px-2 `}
                        >
                          {t("common.top_10_products")}
                        </div>
                      </div>

                      <div className="p-2 max-h-[418px] overflow-y-auto custom-scrollbar">
                        {Array.isArray(top_rated_products) &&
                        top_rated_products.length > 0
                          ? top_rated_products?.map(
                              (topRatedProduct, index) => {
                                const {
                                  name,
                                  image_url,
                                  slug,
                                  rating,
                                  price,
                                  review_count,
                                } = topRatedProduct;
                                const fullStars = Math.floor(rating);
                                const hasHalfStar = rating % 1 !== 0;
                                const totalStars = 5;
                                return (
                                  <Card key={index} className="my-2">
                                    <CardContent className="grid grid-cols-1 p-4">
                                      <div className="flex flex-col md:flex-row items-center gap-4">
                                        <div className="relative w-[60px] h-[60px]">
                                          {image_url ? (
                                            <Image
                                              loader={GlobalImageLoader}
                                              src={image_url}
                                              alt="image_url"
                                              fill
                                              sizes="240px"
                                              className=" w-full h-full rounded"
                                            />
                                          ) : (
                                            <Image
                                              src="/images/no-image.png"
                                              alt="no_image"
                                              fill
                                              sizes="240px"
                                              className=" w-full h-full rounded"
                                            />
                                          )}
                                        </div>
                                        <div className="flex flex-col md:flex-row items-center justify-between w-full">
                                          <div>
                                            <Link
                                              className="text-blue-500 hover:underline dark:text-[#93c5fd] dark:hover:text-white"
                                              href={`${Routes.approvedProductDetails}/${slug}`}
                                              rel="noopener noreferrer"
                                            >
                                              <div>
                                                <p className="text-lg font-semibold text-center md:text-start">
                                                  {name}
                                                </p>
                                              </div>
                                            </Link>

                                            <p className="text-sm font-bold text-gray-500 dark:text-white text-center md:text-start">
                                              {price
                                                ? formatPrice(
                                                    price,
                                                    CurrencyData
                                                  )
                                                : price}
                                            </p>
                                          </div>
                                          <div className="">
                                            <div className="flex items-center text-amber-500 gap-1">
                                              {[...Array(totalStars)].map(
                                                (_, index) => {
                                                  let fillPercentage = 0;
                                                  if (index < fullStars) {
                                                    fillPercentage = 100; // Full star
                                                  } else if (
                                                    index === fullStars &&
                                                    hasHalfStar
                                                  ) {
                                                    fillPercentage = 50; // Half star
                                                  }
                                                  return (
                                                    <ReviewIcon
                                                      key={index}
                                                      fillPercentage={
                                                        fillPercentage
                                                      }
                                                    />
                                                  );
                                                }
                                              )}
                                            </div>
                                            <div className="text-gray-600 dark:text-white text-sm text-center md:text-end">
                                              {rating} ({review_count} reviews)
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              }
                            )
                          : ""}
                      </div>
                    </div>
                  </Card>
                ) : (
                  ""
                )}
                {Array.isArray(top_categories) && top_categories.length > 0 ? (
                  <Card className="">
                    <div className="px-2 md:px-4">
                      <div className="p-2 my-4">
                        <div
                          className={` ${
                            dir === "rtl" ? "border-r-4" : "border-l-4"
                          } text-md font-bold flex items-center gap-2  border-blue-500 px-2 `}
                        >
                          {t("common.top_10_categories")}
                        </div>
                      </div>
                      <div className="p-2 max-h-[418px] overflow-y-auto custom-scrollbar">
                        {Array.isArray(top_categories) &&
                        top_categories.length > 0
                          ? top_categories?.map((topRatedProduct, index) => {
                              const {
                                category_name,
                                category_thumb,
                                slug,
                                rating,
                                price,
                                review_count,
                              } = topRatedProduct;
                              const fullStars = Math.floor(rating);
                              const hasHalfStar = rating % 1 !== 0;
                              const totalStars = 5;
                              return (
                                <Card key={index} className="my-2">
                                  <CardContent className="grid grid-cols-1 p-4">
                                    <div className="flex items-center gap-4">
                                      <div className="relative w-[40px] h-[40px]">
                                        {category_thumb ? (
                                          <Image
                                            loader={GlobalImageLoader}
                                            src={category_thumb}
                                            alt="category_thumb"
                                            fill
                                            sizes="160px"
                                            className=" w-full h-full rounded"
                                          />
                                        ) : (
                                          <Image
                                            src="/images/no-image.png"
                                            alt="no_image"
                                            fill
                                            sizes="160px"
                                            className=" w-full h-full rounded"
                                          />
                                        )}
                                      </div>
                                      <div className="flex items-center justify-between w-full">
                                        <div>
                                          <div>
                                            <p className="text-lg font-semibold text-blue-500 hover:underline dark:text-[#93c5fd] dark:hover:text-white">
                                              {category_name}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })
                          : ""}
                      </div>
                    </div>
                  </Card>
                ) : (
                  ""
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default OwnerDashboard;
