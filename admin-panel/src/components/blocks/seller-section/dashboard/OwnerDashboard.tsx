"use client";
import ReviewIcon from "@/assets/icons/ReviewIcon";
import TotalCanceledOrderIcon from "@/assets/icons/TotalCanceledOrderIcon";
import TotalCompletedOrderIcon from "@/assets/icons/TotalCompletedOrderIcon";
import TotalEarningsIcon from "@/assets/icons/TotalEarningsIcon";
import TotalInProcessOrderIcon from "@/assets/icons/TotalInProcessOrderIcon";
import TotalProductsIcon from "@/assets/icons/TotalProductsIcon";
import TotalQueueOrderIcon from "@/assets/icons/TotalQueueOrderIcon";
import TotalRefundIcon from "@/assets/icons/TotalRefundIcon";
import TotalStoresIcon from "@/assets/icons/TotalStoresIcon";
import { formatPrice } from "@/components/molecules/formatPrice";
import { AppSelect } from "@/components/blocks/common";
import CustomDateRangePicker from "@/components/blocks/common/CustomDateRangePicker";
import { Card, CardContent } from "@/components/ui";
import { SellerRoutes } from "@/config/sellerRoutes";
import { authorizationAtom } from "@/lib/authorization-atom";
import GlobalImageLoader from "@/lib/imageLoader";
import { useToken } from "@/lib/use-token";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import {
  useSellerDashboardQuery,
  useSellerGrowthOrderQuery,
  useSellerOtherSummaryQuery,
  useSellerSalesSummaryQuery,
} from "@/modules/seller-section/seller-dashboard/seller-dashboard.action";
import { useAppSelector } from "@/redux/hooks";
import { format, formatDate } from "date-fns";
import { useAtom } from "jotai";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import DashboardSkeleton from "../../admin-section/dashboard/components/DashboardSkeleton";
import CustomAreaChart from "../../charts/AreaChart";
import CustomBarChart from "../../charts/BarChart";
import { CustomViewIcon } from "../../custom-icons";
import { TotalOrderIcon } from "@/assets/icons";
import TotalPosOrderEarningsIcon from "@/assets/icons/TotalPosOrderEarningsIcon";

const OwnerDashboard = () => {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const localeDir = pathname.split("/")[1];
  const dir = localeDir === "ar" ? "rtl" : "ltr";
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const slug = selectedStore?.slug ?? "";

  const StatusList = [
    { label: "This Week", value: "this_week" },
    { label: "This Month", value: "this_month" },
    { label: "This Year", value: "this_year" },
  ];

  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });
  const [selectStatus, setSelectStatus] = useState<string>("");
  const [hasPermission, setHasPermission] = useState(true);

  const searchParams = useSearchParams();
  const { setToken } = useToken();
  const [_, setAuthorized] = useAtom(authorizationAtom);
  useEffect(() => {
    const token = searchParams.get("token");
    const message = searchParams.get("message");
    if (token) {
      toast.success(message || "User Login Successfully");
      setToken(token);
      setAuthorized(true);
      router.replace("/seller/dashboard", { scroll: false });
    }
  }, [router, searchParams, setAuthorized, setToken]);

  const handleSelectStatus = (value: string) => {
    const newSelectStatus = String(value);
    if (value === "none") {
      setSelectStatus("");
    } else {
      setSelectStatus(newSelectStatus);
    }
  };

  const {
    SellerDashboard,
    refetch,
    isPending: isDashboardLoading,
  } = useSellerDashboardQuery({ language: locale, slug });
  const formattedFrom = dateRange.from
    ? formatDate(dateRange.from, "yyyy-MM-dd")
    : null;
  const formattedTo = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : null;
  const {
    SellerSalesSummary,
    refetch: SalesSummaryRefetch,
    isPending: isSalesSummaryLoading,
    error: SalesSummaryError,
  } = useSellerSalesSummaryQuery({
    language: locale,
    slug,
    start_date: formattedFrom ?? "",
    end_date: formattedTo ?? "",
    time_period: selectStatus,
  });

  const {
    SellerOrderGrowth,
    refetch: SellerGrowthRefetch,
    isPending: isOrderGrowthLoading,
    error: SellerGrowthError,
  } = useSellerGrowthOrderQuery({ language: locale, slug });

  const {
    SellerOtherSummary,
    refetch: SellerOtherRefetch,
    isPending: isOtherSummaryLoading,
    error: SellerOtherError,
  } = useSellerOtherSummaryQuery({ language: locale, slug });

  const SellerDashboardData = useMemo(() => {
    const data = (SellerDashboard as any) || {};
    return data;
  }, [SellerDashboard]);

  const SellerSalesSummaryData = useMemo(() => {
    const data = (SellerSalesSummary as any) || [];
    return data;
  }, [SellerSalesSummary]);

  const SellerOrderGrowthData = useMemo(() => {
    const data = (SellerOrderGrowth as any) || [];
    return data;
  }, [SellerOrderGrowth]);

  const SellerOtherSummaryData = useMemo(() => {
    const data = (SellerOtherSummary as any) || {};
    return data;
  }, [SellerOtherSummary]);

  const { top_rated_products = [], recent_completed_orders = [] } =
    SellerOtherSummaryData;
  const originalData = useMemo(() => {
    const data = (recent_completed_orders as any) || [];
    return data?.map((item: any, index: number) => ({
      ...item,
      sl: index + 1,
    }));
  }, [recent_completed_orders]);

  const { summary = {}, order_summary = {} } = SellerDashboardData;
  const {
    store = {},
    refunds = {},
    earnings = {},
    pos_order_amount = {},
    product = {},
  } = summary;
  const {
    pending_orders = {},
    completed_orders = {},
    cancelled_orders = {},
    refunded_orders = {},
    pos_orders = {},
  } = order_summary;

  const { currency, refetch: refetchCurrency } = useCurrencyQuery({});
  const currencyData = useMemo(() => {
    const data = (currency as any) || {};
    return data;
  }, [currency]);
  const CurrencyData = currencyData.currencies_info;

  const [viewRowId, setViewRowId] = useState<string | null>(null);
  const handleView = (Id: string) => {
    setViewRowId(Id);
    router.push(`${SellerRoutes.orderDetails}/${Id}`);
  };

  const UserName = localStorage.getItem("user_name");

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
    isSalesSummaryLoading,
    SalesSummaryError,
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
      {!hasPermission ? (
        <Card>
          <CardContent className="p-2 md:p-6">
            <div className="mb-4">
              <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
                {" "}
                {t("common.hello")},{" "}
                <span className="font-semibold text-blue-500">{UserName}</span>
              </h1>
              <p className="text-md text-gray-500 dark:text-white flex items-center gap-2">
                {" "}
                {t("common.welcome_to_personalized_dashboard")}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
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
              {t("common.you_do_not_have_permission_to_access_this_dashboard")}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {isLoading ? (
            <DashboardSkeleton />
          ) : (
            <>
              <Card className="">
                <CardContent className=" p-2 md:p-6">
                  <div className="mb-4">
                    <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white mb-2">
                      {" "}
                      {t("common.my_dashboard")}
                    </h1>
                    <div
                      dir={dir}
                      className="text-md text-gray-500 dark:text-white flex flex-col md:flex-row items-start md:items-center"
                    >
                      <div
                        dir={dir}
                        className="flex items-start md:items-center"
                      >
                        <p>{t("common.hello")}</p>
                        <p className="font-semibold text-blue-500 mx-2">
                          {UserName},
                        </p>
                      </div>
                      <p>{t("common.welcome_to_personalized_dashboard")}</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#F5EDDF] dark:bg-gray-700">
                      <CardContent className="flex items-center gap-3 p-6">
                        <div className="p-2">
                          <TotalStoresIcon />
                        </div>
                        <div>
                          <Link href={SellerRoutes.store}>
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
                          <Link href={SellerRoutes.productList}>
                            <div className="text-md ">{product?.title}</div>
                          </Link>

                          <div className="text-xl font-bold ">
                            {product?.count}
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
                          <div className="text-md">{earnings?.title}</div>
                          <div className="text-xl font-bold">
                            {earnings?.count
                              ? formatPrice(earnings?.count, CurrencyData)
                              : earnings?.count}
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
                          <div className="text-md">
                            {pos_order_amount?.title}
                          </div>
                          <div className="text-xl font-bold">
                            {pos_order_amount?.count
                              ? formatPrice(
                                  pos_order_amount?.count,
                                  CurrencyData
                                )
                              : pos_order_amount?.count}
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
                          <div className="text-md">{refunds?.title}</div>
                          <div className="text-xl font-bold ">
                            {refunds?.count
                              ? formatPrice(refunds?.count, CurrencyData)
                              : refunds?.count}
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
                          <div className="text-md">
                            {completed_orders?.title}
                          </div>
                          <div className="text-xl font-bold">
                            {completed_orders?.count}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#DEF0EE] dark:bg-gray-700">
                      <CardContent className="flex items-center gap-3 p-6">
                        <div className="p-2 text-[#4EBCAF]">
                          <TotalOrderIcon />
                        </div>
                        <div>
                          <div className="text-md">{pos_orders?.title}</div>
                          <div className="text-xl font-bold">
                            {pos_orders?.count}
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
                          <div className="text-md">{pending_orders?.title}</div>
                          <div className="text-xl font-bold ">
                            {pending_orders?.count}
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
                          <div className="text-md">
                            {cancelled_orders?.title}
                          </div>
                          <div className="text-xl font-bold ">
                            {cancelled_orders?.count}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="min-h-[125px] relative overflow-hidden shadow-none rounded-lg flex items-center bg-[#F4F0E2] dark:bg-gray-700">
                      <CardContent className="flex items-center gap-3 p-6">
                        <div className="p-2 text-[#E3C048]">
                          <TotalQueueOrderIcon />
                        </div>
                        <div>
                          <div className="text-md">
                            {refunded_orders?.title}
                          </div>
                          <div className="text-xl font-bold ">
                            {refunded_orders?.count}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6 my-6 mt-6">
                <Card className="p-2 md:p-4">
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
                    data={SellerSalesSummaryData}
                    isPending={isSalesSummaryLoading}
                  />
                </Card>

                <Card className="p-2 md:p-4">
                  <div className="p-2 flex items-center justify-between mb-8">
                    <div className="text-md font-bold flex items-center gap-2 border-l-4 border-blue-500 px-2">
                      {t("common.order_growth")}
                    </div>
                  </div>
                  <CustomBarChart
                    data={SellerOrderGrowthData}
                    isPending={isOrderGrowthLoading}
                  />
                </Card>

                {top_rated_products && top_rated_products.length > 0 && (
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
                      <div className="p-2 max-h-[500px] overflow-y-auto custom-scrollbar">
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
                                          <Image
                                            loader={GlobalImageLoader}
                                            src={
                                              image_url ??
                                              "/images/no-image.png"
                                            }
                                            alt={
                                              image_url
                                                ? "image_url"
                                                : "no_image"
                                            }
                                            fill
                                            sizes="60px"
                                            className="w-full h-full rounded"
                                          />
                                        </div>
                                        <div className="flex flex-col md:flex-row items-center justify-between w-full">
                                          <div>
                                            <Link
                                              className="text-blue-500 hover:underline dark:text-[#93c5fd] dark:hover:text-white"
                                              href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/product-details/${slug}`}
                                              target="_blank"
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
                                            <div className="text-gray-600 dark:text-white text-sm text-end">
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
                )}
                {originalData && originalData.length > 0 && (
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
                        <div className="min-w-[640px] px-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                          <Card className="">
                            <CardContent className="grid grid-cols-10 gap-4 p-3 text-start text-sm font-bold ">
                              <p className="col-span-2">
                                {" "}
                                {t("table_header.order_id")}
                              </p>
                              <p className="col-span-3">
                                {t("table_header.order_date")}
                              </p>

                              <p className="col-span-2">
                                {t("table_header.store")}
                              </p>
                              <p className="col-span-2 pr-2 text-end">
                                {t("table_header.amount")}{" "}
                              </p>
                              {slug !== "" && (
                                <p className="pr-2 text-end">
                                  {t("table_header.actions")}
                                </p>
                              )}
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
                                      {slug !== "" && (
                                        <div className="">
                                          <CustomViewIcon
                                            disabled={slug == ""}
                                            isLoading={viewRowId === order_id}
                                            onClick={() => handleView(order_id)}
                                          />
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                );
                              })
                            : ""}
                        </div>
                      </div>
                    </div>
                  </Card>
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
