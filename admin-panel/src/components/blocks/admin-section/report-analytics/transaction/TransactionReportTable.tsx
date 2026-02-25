"use client";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import { CountItems } from "@/config/helperJson";
import {
  ChevronsLeftIcon,
  ChevronsRightIcon,
  LayoutGrid,
  List,
  Search,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";

import {
  TotalDeliveryManIcon,
  TotalEarningsIcon,
  TotalOrderIcon,
  TotalRefundedOrderIcon,
  TotalStoresIcon,
} from "@/assets/icons";
import { formatPrice } from "@/components/molecules/formatPrice";
import { AppSearchSelect } from "@/components/blocks/common/AppSearchSelect";
import CustomDateRangePicker from "@/components/blocks/common/CustomDateRangePicker";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { Routes } from "@/config/routes";
import { formatLabel } from "@/lib/utils";
import { useInventoryStoreQuery } from "@/modules/admin-section/inventory/inventory.action";
import { useTransactionReportQuery } from "@/modules/admin-section/transaction-report/transaction-report.action";
import { useAreaDropdownQuery } from "@/modules/common/area/area.action";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { useCustomerQuery } from "@/modules/common/customer/customer.action";
import { usePaymentGatewayQuery } from "@/modules/common/payment-gateway/payment-gateway.action";
import { useStoreTypeQuery } from "@/modules/common/store-type/store-type.action";
import Link from "next/link";
import VectorIcon from "@/assets/icons/VectorIcon";
import MuteVectorIcon from "@/assets/icons/MuteVectorIcon";
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

const TransactionReportTable = () => {
  const t = useTranslations();
  const locale = useLocale();
  const StatusList = [
    { label: t("common.pending"), value: "pending" },
    { label: t("common.confirmed"), value: "confirmed" },
    { label: t("common.processing"), value: "processing" },
    { label: t("common.pickup"), value: "pickup" },
    { label: t("common.shipped"), value: "shipped" },
    { label: t("common.cancelled"), value: "cancelled" },
    { label: t("common.delivered"), value: "delivered" },
  ];
  const PaymentStatusList = [
    { label: t("common.pending"), value: "pending" },
    { label: t("common.partially_paid"), value: "partially_paid" },
    { label: t("common.paid"), value: "paid" },
    { label: t("common.cancelled"), value: "cancelled" },
    { label: t("common.failed"), value: "failed" },
    { label: t("common.refunded"), value: "refunded" },
  ];
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    return parseInt(localStorage.getItem("itemsPerPage") || "10");
  });
  const [activeTab, setActiveTab] = useState("order");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortedInfo, setSortedInfo] = useState<{
    columnKey: string;
    order: string;
  }>({
    columnKey: "",
    order: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({ from: null, to: null });

  const [selectPaymentStatus, setSelectPaymentStatus] = useState<string>("");
  const [selectStatus, setSelectStatus] = useState<string>("");
  const [selectStoreID, setSelectStoreID] = useState<string>("");
  const [selectStoreType, setSelectStoreType] = useState<string>("");
  const [selectAreaId, setSelectAreaId] = useState<string>("");
  const [selectCustomerId, setSelectCustomerId] = useState<string>("");
  const [selectPaymentGateway, setSelectPaymentGateway] = useState<string>("");

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchButtonClick = () => {
    setSearchValue(searchQuery);
  };
  const handleKeyDown = (event: { key: string }) => {
    if (event.key === "Enter") {
      handleSearchButtonClick();
    }
  };

  const handleSelectStatus = (value: string) => {
    const newSelectStatus = String(value);
    if (value === "none") {
      setSelectStatus("");
    } else {
      setSelectStatus(newSelectStatus);
    }
  };
  const handlePaymentStatus = (value: string) => {
    const newSelectOwner = String(value);
    if (value === "none") {
      setSelectPaymentStatus("");
    } else {
      setSelectPaymentStatus(newSelectOwner);
    }
  };

  const { InventoryStoreList } = useInventoryStoreQuery({
    seller_id: "",
  });
  let StoreData = (InventoryStoreList as any) || [];
  const handleSelectOwner = (value: string) => {
    const newSelectOwner = String(value);
    if (value === "none") {
      setSelectStoreID("");
    } else {
      setSelectStoreID(newSelectOwner);
    }
  };

  const { storeType } = useStoreTypeQuery({});
  let typeData = (storeType as any) || [];

  const handleSelectOwner2 = (value: string) => {
    const newSelectOwner = String(value);
    if (value === "none") {
      setSelectStoreType("");
    } else {
      setSelectStoreType(newSelectOwner);
    }
  };
  const { AreaDropdownList } = useAreaDropdownQuery({});
  let AreaList = (AreaDropdownList as any) || [];
  const handleSelectAreaID = (value: string) => {
    const newSelectAreaID = String(value);
    if (value === "none") {
      setSelectAreaId("");
    } else {
      setSelectAreaId(newSelectAreaID);
    }
  };
  const { customerList } = useCustomerQuery({});
  const customerData = (customerList as any) || [];
  const handleSelectCustomerID = (value: any) => {
    const newSelectAreaID = String(value);
    if (value === "none") {
      setSelectCustomerId("");
    } else {
      setSelectCustomerId(newSelectAreaID);
    }
  };
  const { PaymentGatewayList } = usePaymentGatewayQuery({});
  let PaymentGateways = (PaymentGatewayList as any)?.paymentGateways || [];
  const handleSelectPaymentGateway = (value: any) => {
    const newSelectAreaID = String(value);
    if (value === "none") {
      setSelectPaymentGateway("");
    } else {
      setSelectPaymentGateway(newSelectAreaID);
    }
  };
  React.useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchValue("");
    }
  }, [searchQuery]);

  const sortField = sortedInfo.order == "ascend" ? "asc" : "desc";
  const sortData =
    sortedInfo.order == "ascend"
      ? sortedInfo.columnKey
      : `${sortedInfo.columnKey}`;
  const { TransactionReportData, refetch, isPending, error, isFetching } =
    useTransactionReportQuery({
      per_page: itemsPerPage,
      language: locale,
      page: currentPage,
      sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
      sort: sortField,
      search: searchValue,
      start_date: dateRange.from,
      end_date: dateRange.to,
      order_status: selectStatus,
      payment_status: selectPaymentStatus,
      type: selectStoreType,
      store_id: selectStoreID,
      area_id: selectAreaId,
      customer_id: selectCustomerId,
      payment_gateway: selectPaymentGateway,
      transaction_type: activeTab,
    });

  let totalDataLength = (TransactionReportData as any)?.meta?.total;
  const startIndex = (TransactionReportData as any)?.meta?.from;
  const LastPage = (TransactionReportData as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (TransactionReportData as any)?.data || [];
    return data?.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [TransactionReportData, startIndex]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const {
    total_transactions_amount,
    total_refund_amount,
    admin_earnings,
    store_earnings,
    deliveryman_earnings,
  } = (TransactionReportData as any)?.dashboard || {};

  const totals = (TransactionReportData as any)?.totals || {};

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
          title: t("table_header.delivery_charge_admin"),
          dataIndex: "delivery_charge_admin",
          width: 200,
          render: (delivery_charge_admin: any) => (
            <div className="">
              {delivery_charge_admin
                ? formatPrice(delivery_charge_admin, CurrencyData)
                : delivery_charge_admin}
            </div>
          ),
        },
        {
          title: t("table_header.delivery_charge_admin_commission"),
          dataIndex: "delivery_charge_admin_commission",
          width: 200,
          render: (delivery_charge_admin_commission: any) => (
            <div className="">
              {delivery_charge_admin_commission
                ? formatPrice(delivery_charge_admin_commission, CurrencyData)
                : delivery_charge_admin_commission}
            </div>
          ),
        },
        {
          width: 300,
          title: t("table_header.additional_charge_info"),
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
          title: t("table_header.total_product_price"),
          dataIndex: "total_product_amount",
          width: 150,
          render: (total_product_amount: any) => (
            <div className="">
              {total_product_amount
                ? formatPrice(total_product_amount, CurrencyData)
                : total_product_amount}
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
  const useColumnForSubscription = (fixLeft: boolean): ColumnsType<any> => {
    const columns: ColumnsType<any> = React.useMemo(
      () => [
        {
          title: t("table_header.sl"),
          dataIndex: "serial",
          fixed: fixLeft ? "left" : undefined,
          width: 100,
        },

        {
          title: t("table_header.store"),
          dataIndex: "store",
          width: 150,
        },
        {
          title: t("table_header.subscription"),
          dataIndex: "subscription",
          width: 200,
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
          title: t("table_header.order_limit"),
          dataIndex: "order_limit",
          width: 150,
        },
        {
          title: t("table_header.product_limit"),
          dataIndex: "product_limit",
          width: 150,
        },
        {
          title: t("table_header.featured_limit"),
          dataIndex: "product_featured_limit",
          width: 150,
        },

        {
          title: t("table_header.live_chat"),
          dataIndex: "live_chat",
          render: (live_chat: any) => (
            <p className="px-4">
              {live_chat == 1 ? <VectorIcon /> : <MuteVectorIcon />}
            </p>
          ),
          width: 100,
        },
        {
          title: t("table_header.pos_system"),
          dataIndex: "pos_system",
          render: (pos_system: any) => (
            <p className="px-4">
              {pos_system == 1 ? <VectorIcon /> : <MuteVectorIcon />}
            </p>
          ),
          width: 150,
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
                    status == "1"
                      ? "bg-green-50 border border-green-500 text-green-500"
                      : status == "0"
                      ? "bg-gray-50 border border-gray-500 text-gray-500"
                      : "bg-red-50 border border-red-500 text-red-500"
                  } capitalize`}
                >
                  {status == "1"
                    ? t("common.active")
                    : status == "0"
                    ? t("common.pending")
                    : t("common.cancelled")}
                </Badge>
              </div>
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
      ],
      [fixLeft, CurrencyData, t, paymentStatusLabelMap]
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
    dateRange.from,
    dateRange.to,
    selectStatus,
    selectPaymentStatus,
    selectStoreID,
    selectStoreType,
    selectAreaId,
    selectCustomerId,
    selectPaymentGateway,
    activeTab,
    error,
  ]);

  return (
    <>
      {isPending ? (
        <TableSkeletonLoader />
      ) : (
        <>
          <Tabs
            defaultValue="order"
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <Card className="mt-4">
              <CardContent className="p-2 lg:p-4">
                <TabsList className="flex items-center justify-start gap-2 bg-transparent">
                  <TabsTrigger
                    className={`${
                      isFetching ? "pointer-events-none opacity-50" : ""
                    }`}
                    value="order"
                  >
                    <div className="text-start">
                      <h1 className="flex items-center gap-1">
                        <LayoutGrid className="w-5" />{" "}
                        <span className="text-start text-sm lg:text-lg font-semibold">
                          {t("orders.orders")}
                        </span>
                      </h1>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    className={`${
                      isFetching
                        ? "pointer-events-none opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    value="subscription"
                  >
                    <div className="text-start">
                      <h1 className="flex items-center gap-1">
                        <List className="w-5" />{" "}
                        <span className="text-start text-sm lg:text-lg font-semibold">
                          {t("table_header.subscription")}
                        </span>
                      </h1>
                    </div>
                  </TabsTrigger>
                </TabsList>

                <div className="mt-4">
                  <div className="space-y-2 md:space-y-0 md:grid  lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    <AppSearchSelect
                      placeholder={t("place_holder.select_store")}
                      value={String(selectStoreID)}
                      onSelect={handleSelectOwner}
                      groups={StoreData}
                      customClass="w-full "
                    />
                    <AppSelect
                      placeholder={t("place_holder.select_store_type")}
                      value={String(selectStoreType)}
                      onSelect={handleSelectOwner2}
                      groups={typeData}
                      customClass="w-full"
                    />
                    {activeTab === "order" && (
                      <AppSearchSelect
                        placeholder={t("place_holder.select_area")}
                        value={String(selectAreaId)}
                        onSelect={handleSelectAreaID}
                        groups={AreaList}
                        customClass="w-full"
                      />
                    )}
                    <AppSearchSelect
                      placeholder={t("place_holder.select_customer")}
                      value={String(selectCustomerId)}
                      onSelect={handleSelectCustomerID}
                      groups={customerData}
                      customClass="w-full"
                    />
                    <AppSelect
                      placeholder={t("place_holder.select_gateway")}
                      value={String(selectPaymentGateway)}
                      onSelect={handleSelectPaymentGateway}
                      groups={PaymentGateways}
                      customClass="w-full "
                    />
                    {activeTab === "order" && (
                      <AppSelect
                        placeholder={t("place_holder.select_status")}
                        value={String(selectStatus)}
                        onSelect={handleSelectStatus}
                        groups={StatusList}
                        customClass="w-full "
                      />
                    )}
                    <AppSelect
                      placeholder={t("place_holder.select_payment_status")}
                      value={String(selectPaymentStatus)}
                      onSelect={handlePaymentStatus}
                      groups={PaymentStatusList}
                      customClass="w-full "
                    />

                    <div className="w-full">
                      <CustomDateRangePicker
                        dateRange={dateRange}
                        onDateChange={setDateRange}
                        customSide="right-0"
                      />
                    </div>
                    <div className="relative flex items-center gap-2 w-full col-span-2">
                      <div
                        className={`${
                          locale === "ar" ? "right-3" : "left-3"
                        } absolute  text-[#CCCFD7]`}
                      >
                        <Search width={18} height={18} />
                      </div>
                      <Input
                        type="text"
                        placeholder={`${
                          activeTab === "order"
                            ? t("place_holder.search_by_invoice")
                            : t("place_holder.search_by_store")
                        }`}
                        value={searchQuery}
                        onKeyDown={handleKeyDown}
                        onChange={handleSearchInputChange}
                        className="px-8 app-input w-full"
                      />
                      <Button
                        variant="outline"
                        onClick={handleSearchButtonClick}
                        className="app-button"
                      >
                        {t("button.search")}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4">
                  {total_transactions_amount?.title && (
                    <Card className="bg-[#EBF0E3] dark:bg-gray-700 relative overflow-hidden rounded-lg flex items-center shadow-none ">
                      <CardContent className="flex items-center gap-2 p-3 ">
                        <div className="p-2">
                          <TotalOrderIcon />
                        </div>
                        <div className="">
                          <Link href={Routes.ordersList}>
                            <div className="text-md ">
                              {t("report.total_transactions_amount")}
                            </div>
                          </Link>

                          <div className="text-xl font-bold ">
                            {total_transactions_amount?.count
                              ? formatPrice(
                                  total_transactions_amount?.count,
                                  CurrencyData
                                )
                              : total_transactions_amount?.count}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {admin_earnings?.title && (
                    <Card className="bg-[#EDE6F3] dark:bg-gray-700 relative overflow-hidden rounded-lg flex items-center shadow-none ">
                      <CardContent className="flex items-center gap-2 p-3">
                        <div className="p-2 text-[#A970DA]">
                          <TotalEarningsIcon />
                        </div>
                        <div>
                          <div className="text-md ">
                            {t("report.admin_earnings")}
                          </div>
                          <div className="text-xl font-bold ">
                            {admin_earnings?.count
                              ? formatPrice(admin_earnings?.count, CurrencyData)
                              : admin_earnings?.count}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {store_earnings?.title && (
                    <Card className="bg-[#F5EDDF] dark:bg-gray-700 relative overflow-hidden rounded-lg flex items-center shadow-none ">
                      <CardContent className="flex items-center gap-2 p-3">
                        <div className=" p-2">
                          <TotalStoresIcon />
                        </div>
                        <div>
                          <div className="text-md ">
                            {t("report.store_earnings")}
                          </div>
                          <div className="text-xl font-bold">
                            {store_earnings?.count
                              ? formatPrice(store_earnings?.count, CurrencyData)
                              : store_earnings?.count}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {deliveryman_earnings?.title && (
                    <Card className="bg-[#E4EAF4] dark:bg-gray-700 relative overflow-hidden rounded-lg flex items-center shadow-none  ">
                      <CardContent className="flex items-center gap-2 p-3">
                        <div className="p-2">
                          <TotalDeliveryManIcon />
                        </div>
                        <div>
                          <div className="text-md ">
                            {t("report.deliveryman_earnings")}
                          </div>
                          <div className="text-xl font-bold">
                            {deliveryman_earnings?.count
                              ? formatPrice(
                                  deliveryman_earnings?.count,
                                  CurrencyData
                                )
                              : deliveryman_earnings?.count}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {total_refund_amount?.title && (
                    <Card className="bg-[#F4F0E2] dark:bg-gray-700 relative overflow-hidden rounded-lg flex items-center shadow-none ">
                      <CardContent className="flex items-center gap-2 p-3">
                        <div className="p-2 text-[#E3C048]">
                          <TotalRefundedOrderIcon />
                        </div>
                        <div>
                          <div className="text-md ">
                            {t("report.total_refund_amount")}
                          </div>
                          <div className="text-xl font-bold">
                            {total_refund_amount?.count
                              ? formatPrice(
                                  total_refund_amount?.count,
                                  CurrencyData
                                )
                              : total_refund_amount?.count}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>

            <TabsContent className="rounded-xl" value="order">
              <>
                <RCTable
                  originData={originalData}
                  useColumn={useColumn}
                  sortedInfo={sortedInfo}
                  handleSort={handleSort}
                  maxWidth={3000}
                />
                {originalData.length > 0 && (
                  <Card className="mt-4">
                    <CardContent className="p-4">
                      <h2 className="text-lg font-bold mb-3">
                        {t("report.totals")}
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">{t("table_header.order_amount")}</p>
                          <p className="text-sm font-semibold">
                            {CurrencyData ? formatPrice(totals.order_amount, CurrencyData) : totals.order_amount}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">{t("table_header.coupon_discount_amount_admin")}</p>
                          <p className="text-sm font-semibold">
                            {CurrencyData ? formatPrice(totals.coupon_discount_amount_admin, CurrencyData) : totals.coupon_discount_amount_admin}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">{t("table_header.product_discount_amount")}</p>
                          <p className="text-sm font-semibold">
                            {CurrencyData ? formatPrice(totals.product_discount_amount, CurrencyData) : totals.product_discount_amount}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">{t("table_header.flash_discount_amount_admin")}</p>
                          <p className="text-sm font-semibold">
                            {CurrencyData ? formatPrice(totals.flash_discount_amount_admin, CurrencyData) : totals.flash_discount_amount_admin}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">{t("table_header.shipping_charge")}</p>
                          <p className="text-sm font-semibold">
                            {CurrencyData ? formatPrice(totals.shipping_charge, CurrencyData) : totals.shipping_charge}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">{t("table_header.delivery_charge_admin")}</p>
                          <p className="text-sm font-semibold">
                            {CurrencyData ? formatPrice(totals.delivery_charge_admin, CurrencyData) : totals.delivery_charge_admin}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">{t("table_header.delivery_charge_admin_commission")}</p>
                          <p className="text-sm font-semibold">
                            {CurrencyData ? formatPrice(totals.delivery_charge_admin_commission, CurrencyData) : totals.delivery_charge_admin_commission}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">{t("table_header.total_tax_amount")}</p>
                          <p className="text-sm font-semibold">
                            {CurrencyData ? formatPrice(totals.total_tax_amount, CurrencyData) : totals.total_tax_amount}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">{t("table_header.total_product_price")}</p>
                          <p className="text-sm font-semibold">
                            {CurrencyData ? formatPrice(totals.total_product_amount, CurrencyData) : totals.total_product_amount}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">{t("table_header.additional_charge_info")}</p>
                          <p className="text-sm font-semibold">
                            {CurrencyData ? formatPrice(totals.additional_charge_amount, CurrencyData) : totals.additional_charge_amount}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            </TabsContent>
            <TabsContent className="rounded-xl" value="subscription">
              <>
                <RCTable
                  originData={originalData}
                  useColumn={useColumnForSubscription}
                  sortedInfo={sortedInfo}
                  handleSort={handleSort}
                  maxWidth={1500}
                />
                {originalData.length > 0 && totals.price !== undefined && (
                  <Card className="mt-4">
                    <CardContent className="p-4">
                      <h2 className="text-lg font-bold mb-3">
                        {t("report.totals")}
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">{t("table_header.price")}</p>
                          <p className="text-sm font-semibold">
                            {CurrencyData ? formatPrice(totals.price, CurrencyData) : totals.price}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            </TabsContent>
          </Tabs>
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

export default TransactionReportTable;
