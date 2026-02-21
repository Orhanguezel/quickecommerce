"use client";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import { CountItems } from "@/config/helperJson";
import { useReportAnalyticsQuery } from "@/modules/admin-section/report-analytics/report-analytics.action";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";

import {
  TotalCanceledOrderIcon,
  TotalCompletedOrderIcon,
  TotalEarningsIcon,
  TotalInProcessOrderIcon,
  TotalOrderIcon,
  TotalQueueOrderIcon,
  TotalRefundedOrderIcon,
  TotalTicketsIcon,
  TotalWithdrawIcon,
} from "@/assets/icons";
import { formatPrice } from "@/components/molecules/formatPrice";
import { Badge, Card, CardContent } from "@/components/ui";
import { Routes } from "@/config/routes";
import { formatLabel } from "@/lib/utils";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import Link from "next/link";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  serial: string;
  name: string;
  url?: string;
  is_visible?: string;
  position?: string;
  actions?: any;
  status?: boolean;
  key: React.Key;
  children?: RecordType[];
}
interface ColumnType<RecordType> {
  title: string;
  dataIndex?: keyof RecordType;
  key?: string;
  width?: number | string;
  fixed?: "left" | "right" | undefined;
  ellipsis?: boolean;
  children?: ColumnType<RecordType>[];
}
type ColumnsType<RecordType> = ColumnType<RecordType>[];

const ReportAnalyticsTable = ({
  searchValue,
  startDate,
  endDate,
  selectStatus,
  selectPaymentStatus,
  selectStoreID,
  selectStoreType,
  selectAreaId,
  selectCustomerId,
  selectPaymentGateway,
}: any) => {
  const t = useTranslations();
  const locale = useLocale();
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    return parseInt(localStorage.getItem("itemsPerPage") || "10");
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortedInfo, setSortedInfo] = useState<{
    columnKey: string;
    order: string;
  }>({
    columnKey: "",
    order: "",
  });

  const sortField = sortedInfo.order == "ascend" ? "asc" : "desc";
  const sortData =
    sortedInfo.order == "ascend"
      ? sortedInfo.columnKey
      : `${sortedInfo.columnKey}`;
  const { ReportAnalyticsData, refetch, isPending, error } =
    useReportAnalyticsQuery({
      per_page: itemsPerPage,
      language: locale,
      page: currentPage,
      sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
      sort: sortField,
      search: searchValue,
      start_date: startDate,
      end_date: endDate,
      order_status: selectStatus,
      payment_status: selectPaymentStatus,
      type: selectStoreType,
      store_id: selectStoreID,
      area_id: selectAreaId,
      customer_id: selectCustomerId,
      payment_gateway: selectPaymentGateway,
    });

  let totalDataLength = (ReportAnalyticsData as any)?.meta?.total;
  const startIndex = (ReportAnalyticsData as any)?.meta?.from;
  const LastPage = (ReportAnalyticsData as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (ReportAnalyticsData as any)?.data || [];
    return data?.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [ReportAnalyticsData, startIndex]);

  const {
    total_orders,
    pending_orders,
    confirmed_orders,
    processing_orders,
    shipped_orders,
    completed_orders,
    cancelled_orders,
    unassigned_orders,
    refunded_orders,
  } = (ReportAnalyticsData as any)?.dashboard || {};

  const { currency } = useCurrencyQuery({});
  const currencyData = useMemo(() => {
    const data = (currency as any) || {};
    return data;
  }, [currency]);
  const CurrencyData = currencyData.currencies_info;
  const paymentStatusLabelMap: Record<string, string> = {
    pending: t("common.pending"),
    partially_paid: t("common.partially_paid"),
    paid: t("common.paid"),
    cancelled: t("common.cancelled"),
    failed: t("common.failed"),
    refunded: t("common.refunded"),
  };
  const orderStatusLabelMap: Record<string, string> = {
    pending: t("common.pending"),
    confirmed: t("common.confirmed"),
    processing: t("common.processing"),
    pickup: t("common.pickup"),
    shipped: t("common.shipped"),
    cancelled: t("common.cancelled"),
    delivered: t("common.delivered"),
  };

  useEffect(() => {
    if (Number(currentPage) > Number(LastPage)) {
      setCurrentPage(LastPage);
    } else {
      setCurrentPage(currentPage);
    }
  }, [LastPage, currentPage]);

  const updatePage = (p: any) => {
    setCurrentPage(p);
  };

  const handleSort = (columnKey: string) => {
    setSortedInfo((prev) => {
      const isSameColumn = prev.columnKey === columnKey;
      const newOrder =
        isSameColumn && prev.order === "ascend" ? "descend" : "ascend";
      return { columnKey, order: newOrder };
    });
  };

  const handleSelectItemsPerPage = (value: string) => {
    const newItemsPerPage = parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    localStorage.setItem("itemsPerPage", value);
  };

  const useColumn = (fixLeft: boolean): ColumnsType<any> => {
    const columns: ColumnsType<any> = React.useMemo(
      () => [
        {
          title: t("table_header.sl"),
          dataIndex: "serial",
          fixed: fixLeft ? "left" : undefined,
          width: 100,
        },
        {
          title: t("table_header.order_id"),
          dataIndex: "order_id",
          width: 100,
        },
        {
          title: t("table_header.invoice"),
          dataIndex: "invoice",
          width: 200,
        },
        {
          title: t("table_header.store"),
          dataIndex: "store",
          width: 100,
        },
        {
          title: t("table_header.area"),
          dataIndex: "area",
          width: 100,
        },
        {
          title: t("table_header.customer"),
          dataIndex: "customer",
          width: 150,
        },
        {
          title: t("table_header.payment_gateway"),
          dataIndex: "payment_gateway",
          width: 200,
          render: (payment_gateway: string) => (
            <div>
              {payment_gateway && formatLabel(payment_gateway || "", "_")}
            </div>
          ),
        },
        {
          title: t("table_header.payment_status"),
          dataIndex: "payment_status",
          width: 200,
          render: (payment_status: any, row: RecordType) => {
            const statusStyles: Record<string, string> = {
              paid: "border border-green-500 bg-green-50 text-green-600",
              partially_paid: "border border-blue-500 bg-blue-50 text-blue-600",
              refunded: "border border-purple-500 bg-purple-50 text-purple-600",
              failed: "border border-red-500 bg-red-50 text-red-600",
              pending: "border border-yellow-500 bg-yellow-50 text-yellow-600",
              default: "border border-gray-400 bg-gray-50 text-gray-600",
            };

            const badgeClass =
              statusStyles[payment_status] || statusStyles.default;

            return (
              <div className="flex items-center justify-start gap-2">
                <div className="w-32">
                  <span
                    className={`${badgeClass} capitalize py-1 px-2 rounded`}
                  >
                    {paymentStatusLabelMap[payment_status] ||
                      payment_status?.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            );
          },
        },
        {
          title: t("table_header.order_amount"),
          dataIndex: "order_amount",
          width: 200,
          render: (order_amount: any) => (
            <div className="">
              {order_amount
                ? formatPrice(order_amount, CurrencyData)
                : order_amount}
            </div>
          ),
        },
        {
          title: t("table_header.coupon_discount_amount_admin"),
          dataIndex: "coupon_discount_amount_admin",
          width: 200,
          render: (coupon_discount_amount_admin: any) => (
            <div className="">
              {coupon_discount_amount_admin
                ? formatPrice(coupon_discount_amount_admin, CurrencyData)
                : coupon_discount_amount_admin}
            </div>
          ),
        },
        {
          title: t("table_header.product_discount_amount"),
          dataIndex: "product_discount_amount",
          width: 200,
          render: (product_discount_amount: any) => (
            <div className="">
              {product_discount_amount
                ? formatPrice(product_discount_amount, CurrencyData)
                : product_discount_amount}
            </div>
          ),
        },
        {
          title: t("table_header.flash_discount_amount_admin"),
          dataIndex: "flash_discount_amount_admin",
          width: 200,
          render: (flash_discount_amount_admin: any) => (
            <div className="">
              {flash_discount_amount_admin
                ? formatPrice(flash_discount_amount_admin, CurrencyData)
                : flash_discount_amount_admin}
            </div>
          ),
        },
        {
          title: t("table_header.shipping_charge"),
          dataIndex: "shipping_charge",
          width: 200,
          render: (shipping_charge: any) => (
            <div className="">
              {shipping_charge
                ? formatPrice(shipping_charge, CurrencyData)
                : shipping_charge}
            </div>
          ),
        },
        {
          width: 300,
          title: t("table_header.additional_charge_info"),
          dataIndex: "additional_charge_info",
          render: (row: any) => (
            <div className="space-y-2">
              {row?.additional_charge_name && (
                <div className="flex items-center gap-2">
                  <span className=" text-sm font-semibold capitalize">
                    {t("table_header.name")}
                  </span>
                  <span className=" text-sm text-black dark:text-white font-semibold capitalize">
                    : {row?.additional_charge_name}
                  </span>
                </div>
              )}
              {row?.additional_charge_amount && (
                <div className="flex items-center gap-2">
                  <span className=" text-sm font-semibold capitalize">
                    {t("table_header.order_amount")}
                  </span>
                  <span className=" text-sm text-black dark:text-white font-semibold capitalize">
                    :{" "}
                    {formatPrice(row?.additional_charge_amount, CurrencyData) ??
                      ""}{" "}
                    {row?.admin_commission_type && (
                      <span className="text-sm text-black dark:text-white font-semibold capitalize">
                        ({row?.admin_commission_type})
                      </span>
                    )}
                  </span>
                </div>
              )}

              {row?.admin_additional_charge_commission && (
                <div className="flex items-center gap-2">
                  <span className=" text-sm font-semibold capitalize">
                    {t("table_header.admin_commission_amount")}
                  </span>
                  <span className=" text-sm text-black dark:text-white font-semibold capitalize">
                    : {row?.admin_additional_charge_commission}%
                  </span>
                </div>
              )}
              {row?.additional_charge_store_amount && (
                <div className="flex items-center gap-2">
                  <span className=" text-sm font-semibold capitalize">
                    {t("table_header.store_amount")}
                  </span>
                  <span className=" text-sm text-black dark:text-white font-semibold capitalize">
                    :{" "}
                    {formatPrice(
                      row?.additional_charge_store_amount,
                      CurrencyData
                    ) ?? ""}
                  </span>
                </div>
              )}
            </div>
          ),
        },
        {
          title: t("table_header.refund_status"),
          dataIndex: "refund_status",
          width: 200,
        },
        {
          title: t("table_header.status"),
          dataIndex: "status",
          width: 200,
          render: (status: any) => (
            <div className="flex items-center gap-2">
              <div className="w-24">
                <Badge
                  className={` ${
                    status === "delivered"
                      ? "bg-green-50 border border-green-500 text-green-500"
                      : status === "confirmed"
                      ? "bg-blue-50 border border-blue-500 text-blue-500"
                      : status === "shipped"
                      ? "bg-indigo-50 border border-indigo-500 text-indigo-500"
                      : status === "pending"
                      ? "bg-gray-50 border border-gray-500 text-gray-500"
                      : status === "processing"
                      ? "bg-yellow-50 border border-yellow-500 text-yellow-500"
                      : status === "pickup"
                      ? "bg-teal-50 border border-teal-500 text-teal-500"
                      : "bg-red-50 border border-red-500 text-red-500"
                  } capitalize`}
                >
                  {orderStatusLabelMap[status] || status}
                </Badge>
              </div>
            </div>
          ),
        },
        {
          title: t("table_header.base_price"),
          dataIndex: "base_price",
          width: 200,
          render: (base_price: any) => (
            <div className="">
              {base_price ? formatPrice(base_price, CurrencyData) : base_price}
            </div>
          ),
        },
        {
          title: t("table_header.price"),
          dataIndex: "price",
          width: 150,
          render: (price: any) => (
            <div className="">
              {price ? formatPrice(price, CurrencyData) : price}
            </div>
          ),
        },
        {
          title: t("table_header.quantity"),
          dataIndex: "quantity",
          width: 150,
        },
        {
          title: t("table_header.line_total_price_with_qty"),
          dataIndex: "line_total_price_with_qty",
          width: 250,
          render: (line_total_price_with_qty: any) => (
            <div className="">
              {line_total_price_with_qty
                ? formatPrice(line_total_price_with_qty, CurrencyData)
                : line_total_price_with_qty}
            </div>
          ),
        },
        {
          title: t("table_header.line_total_excluding_tax"),
          dataIndex: "line_total_excluding_tax",
          width: 250,
          render: (line_total_excluding_tax: any) => (
            <div className="">
              {line_total_excluding_tax
                ? formatPrice(line_total_excluding_tax, CurrencyData)
                : line_total_excluding_tax}
            </div>
          ),
        },
        {
          title: t("table_header.tax_rate"),
          dataIndex: "tax_rate",
          width: 250,
          render: (tax_rate: any) => <div>{`${Number(tax_rate)}%`}</div>,
        },

        {
          title: t("table_header.tax_amount"),
          dataIndex: "tax_amount",
          width: 150,
          render: (tax_amount: any) => (
            <div className="">
              {tax_amount ? formatPrice(tax_amount, CurrencyData) : tax_amount}
            </div>
          ),
        },
        {
          title: t("table_header.total_tax_amount"),
          dataIndex: "total_tax_amount",
          width: 150,
          render: (total_tax_amount: any) => (
            <div className="">
              {total_tax_amount
                ? formatPrice(total_tax_amount, CurrencyData)
                : total_tax_amount}
            </div>
          ),
        },
        {
          title: t("table_header.line_total_price"),
          dataIndex: "line_total_price",
          width: 150,
          render: (line_total_price: any) => (
            <div className="">
              {line_total_price
                ? formatPrice(line_total_price, CurrencyData)
                : line_total_price}
            </div>
          ),
        },
        {
          title: t("table_header.admin_commission_rate"),
          dataIndex: "admin_commission_rate",
          width: 250,
          render: (admin_commission_rate: any) => (
            <div className="">
              {admin_commission_rate
                ? formatPrice(admin_commission_rate, CurrencyData)
                : admin_commission_rate}
            </div>
          ),
        },
        {
          title: t("table_header.admin_commission_amount"),
          dataIndex: "admin_commission_amount",
          width: 250,
          render: (admin_commission_amount: any) => (
            <div className="">
              {admin_commission_amount
                ? formatPrice(admin_commission_amount, CurrencyData)
                : admin_commission_amount}
            </div>
          ),
        },
      ],
      [fixLeft, CurrencyData, t, paymentStatusLabelMap, orderStatusLabelMap]
    );

    const renderColumns = columns.map((col) => {
      return col;
    });
    return renderColumns;
  };

  useEffect(() => {
    if (!isPending && !error) {
      refetch();
    }
  }, [
    searchValue,
    sortField,
    itemsPerPage,
    currentPage,
    isPending,
    refetch,
    startDate,
    endDate,
    selectStatus,
    selectPaymentStatus,
    selectStoreID,
    selectStoreType,
    selectAreaId,
    selectCustomerId,
    selectPaymentGateway,
    error,
  ]);

  return (
    <>
      {isPending ? (
        <TableSkeletonLoader />
      ) : (
        <>
          <Card className="mt-4 ">
            <CardContent className="p-2 md:p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
                <Card className="bg-[#EBF0E3] dark:bg-gray-700 relative overflow-hidden rounded-lg flex items-center shadow-none ">
                  <CardContent className="flex items-center gap-2 p-3 ">
                    <div className="p-2">
                      <TotalOrderIcon />
                    </div>
                    <div className="">
                      <Link href={Routes.ordersList}>
                        <div className="text-md ">{t("report.total_orders")}</div>
                      </Link>

                      <div className="text-xl font-bold ">
                        {total_orders?.count}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="relative overflow-hidden rounded-lg flex items-center shadow-none bg-[#E1F3E7] dark:bg-gray-700">
                  <CardContent className="flex items-center gap-2 p-3">
                    <div className="p-2">
                      <TotalInProcessOrderIcon />
                    </div>
                    <div>
                      <div className="text-md ">{t("report.pending_orders")}</div>
                      <div className="text-xl font-bold">
                        {pending_orders?.count}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="relative overflow-hidden rounded-lg flex items-center shadow-none bg-[#EDE6F3] dark:bg-gray-700">
                  <CardContent className="flex items-center gap-2 p-3">
                    <div className="p-2 text-[#A970DA]">
                      <TotalEarningsIcon />
                    </div>
                    <div>
                      <div className="text-md ">{t("report.confirmed_orders")}</div>
                      <div className="text-xl font-bold ">
                        {confirmed_orders?.count}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="relative overflow-hidden rounded-lg flex items-center shadow-none bg-[#E1F3E7] dark:bg-gray-700">
                  <CardContent className="flex items-center gap-2 p-3">
                    <div className="p-2 text-[#8AAF97]">
                      <TotalTicketsIcon />
                    </div>
                    <div>
                      <div className="text-md ">{t("report.processing_orders")}</div>
                      <div className="text-xl font-bold">
                        {processing_orders?.count}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="relative overflow-hidden rounded-lg flex items-center shadow-none  bg-[#E7ECF1] dark:bg-gray-700">
                  <CardContent className="flex items-center gap-2 p-3">
                    <div className="p-2 text-[#7391AE]">
                      <TotalWithdrawIcon />
                    </div>
                    <div>
                      <div className="text-md ">{t("report.shipped_orders")}</div>
                      <div className="text-xl font-bold">
                        {shipped_orders?.count}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="relative overflow-hidden rounded-lg flex items-center shadow-none bg-[#DEF0EE] dark:bg-gray-700 ">
                  <CardContent className="flex items-center gap-2 p-3">
                    <div className="p-2 text-[#4EBCAF]">
                      <TotalCompletedOrderIcon />
                    </div>
                    <div>
                      <div className="text-md ">{t("report.completed_orders")}</div>
                      <div className="text-xl font-bold">
                        {completed_orders?.count}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="relative overflow-hidden rounded-lg flex items-center shadow-none bg-[#E1EDF2] dark:bg-gray-700 ">
                  <CardContent className="flex items-center gap-2 p-3">
                    <div className="p-2 text-[#45A0C7]">
                      <TotalCanceledOrderIcon />
                    </div>
                    <div>
                      <div className="text-md ">{t("report.cancelled_orders")}</div>
                      <div className="text-xl font-bold">
                        {cancelled_orders?.count}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="relative overflow-hidden rounded-lg flex items-center shadow-none bg-[#E7EDE3] dark:bg-gray-700">
                  <CardContent className="flex items-center gap-2 p-3">
                    <div className="p-2 text-[#87A870]">
                      <TotalQueueOrderIcon />
                    </div>
                    <div>
                      <div className="text-md ">{t("report.unassigned_orders")}</div>
                      <div className="text-xl font-bold">
                        {unassigned_orders?.count}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="relative overflow-hidden rounded-lg flex items-center shadow-none bg-[#F4F0E2] dark:bg-gray-700 ">
                  <CardContent className="flex items-center gap-2 p-3">
                    <div className="p-2 text-[#E3C048]">
                      <TotalRefundedOrderIcon />
                    </div>
                    <div>
                      <div className="text-md ">{t("report.refunded_orders")}</div>
                      <div className="text-xl font-bold">
                        {refunded_orders?.count}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <RCTable
            originData={originalData}
            useColumn={useColumn}
            sortedInfo={sortedInfo}
            handleSort={handleSort}
            maxWidth={5000}
          />
          <div className="mt-3 flex flex-col md:flex-row justify-between">
            <div>
              <AppSelect
                value={String(itemsPerPage)}
                onSelect={handleSelectItemsPerPage}
                groups={CountItems}
                customClass="w-[80px] h-8 app-input"
                hideNone
              />
            </div>
            <Pagination
              pageSize={itemsPerPage}
              outline
              onChange={updatePage}
              current={currentPage}
              total={totalDataLength}
              defaultCurrent={1}
              jumpPrevIcon={<ChevronsLeftIcon className="h-4 w-4" />}
              jumpNextIcon={<ChevronsRightIcon className="h-4 w-4" />}
            />
          </div>
        </>
      )}
    </>
  );
};

export default ReportAnalyticsTable;
