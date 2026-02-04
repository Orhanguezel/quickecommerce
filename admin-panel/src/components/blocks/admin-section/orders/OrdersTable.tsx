"use client";
import { formatPrice } from "@/components/molecules/formatPrice";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import {
  CustomAssigneeIcon,
  CustomCancelIcon,
  CustomInvoiceIcon,
  CustomViewIcon,
} from "@/components/blocks/custom-icons";
import CustomStatusUpdateIcon from "@/components/blocks/custom-icons/CustomStatusUpdateIcon";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import { Badge, Button, Card } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import { Routes } from "@/config/routes";
import GlobalImageLoader from "@/lib/imageLoader";
import {
  useCancelOrder,
  useOrdersQuery,
} from "@/modules/admin-section/orders/orders.action";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { format } from "date-fns";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import DeliverymanAssignModal from "./modals/DeliverymanAssignModal";
import InvoiceModal from "./modals/InvoiceModal";
import PaymentStatusUpdateModal from "./modals/PaymentStatusUpdateModal";
import StatusUpdateModal from "./modals/StatusUpdateModal";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  order_id: string;
  customer?: string;
  serial: string;
  title: string;
  payment_status?: string;
  invoice_number?: string;
  purchase_limit?: number;
  discount_type?: string;
  special_price?: string;
  store?: string;
  order_date?: string;
  order_amount?: string;
  thumbnail_image?: any;
  confirmed_by?: any;
  actions?: any;
  status?: any;
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

const OrdersTable = ({
  searchValue,
  selectStoreID,
  selectPaymentStatus,
  startDate,
  endDate,
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

  const [selectStatus, setSelectStatus] = useState<string>("");

  const statusFilter = selectStatus == "refunded" ? "" : selectStatus;
  const refundFilter = selectStatus !== "refunded" ? "" : selectStatus;

  const sortField = sortedInfo.order == "ascend" ? "asc" : "desc";
  const { Orders, refetch, isPending, error } = useOrdersQuery({
    ...searchValue,
    per_page: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
    sort: sortField,
    status: statusFilter,
    refund_status: refundFilter,
    payment_status: selectPaymentStatus,
    store_id: selectStoreID,
    start_date: startDate,
    end_date: endDate,
  });

  let totalDataLength = (Orders as any)?.meta?.total;
  const startIndex = (Orders as any)?.meta?.from;
  const LastPage = (Orders as any)?.meta?.last_page;
  const StatusFilter = (Orders as any)?.status;
  const originalData = useMemo(() => {
    const data = (Orders as any)?.orders || [];
    return data?.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
      id: item?.order_id,
    }));
  }, [Orders, startIndex]);

  useEffect(() => {
    if (Number(currentPage) > Number(LastPage)) {
      setCurrentPage(LastPage);
    } else {
      setCurrentPage(currentPage);
    }
  }, [LastPage, currentPage]);

  const { currency, refetch: refetchCurrency } = useCurrencyQuery({});
  const currencyData = useMemo(() => {
    const data = (currency as any) || {};
    return data;
  }, [currency]);
  const CurrencyData = currencyData.currencies_info;

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

  const [loading, setLoading] = useState(false);
  const { mutate: CancelSingleOrder } = useCancelOrder();
  const handleCancelSingleOrder = (id: any) => {
    setLoading(true);
    CancelSingleOrder(
      {
        order_id: id,
      },
      {
        onSuccess: () => {
          refetch();
          setLoading(false);
        },
        onError: () => {
          setLoading(false);
        },
      }
    );
  };

  const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkIsMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkIsMobile();
      window.addEventListener("resize", checkIsMobile);
      return () => window.removeEventListener("resize", checkIsMobile);
    }, []);

    return isMobile;
  };
  const useColumn = (
    fixLeft: boolean,
    fixRight: boolean
  ): ColumnsType<RecordType> => {
    const isMobile = useIsMobile();
    const columns: ColumnsType<RecordType> = React.useMemo(
      () => [
        {
          title: t("table_header.sl"),
          dataIndex: "serial",
          fixed: fixLeft ? "left" : undefined,
          width: 80,
        },
        {
          title: t("table_header.order_id"),
          dataIndex: "order_id",
          width: 100,
          render: (_:any , row: RecordType) => <p className="px-2">{row?.order_id}</p>,
        },
        {
          title: t("table_header.invoice_no"),
          dataIndex: "invoice_number",
          width: 150,
        },
        {
          title: t("table_header.order_date"),
          dataIndex: "order_date",
          width: 200,
        },
        {
          title: t("table_header.customer"),
          width: 200,
            dataIndex: "customer",
          render: (_:any , row: any) => (
            <div className="flex items-center gap-2">
              <div>
                <p className="text-blue-500 text-md font-semibold capitalize">
                  {row?.order_master?.customer?.full_name}
                </p>
                <p className="text-gray-500 dark:text-white text-sm font-normal mt-1">
                  {row?.order_master?.customer?.email}
                </p>
              </div>
            </div>
          ),
        },
        {
          title: t("table_header.order_amount"),
          dataIndex: "order_amount",
          width: 150,
        },
        {
          title: t("table_header.store"),
          dataIndex: "store",
          width: 150,
        },
        {
          title: t("table_header.payment_status"),
          dataIndex: "payment_status",
          width: 250,
        },
        {
          title: t("table_header.status"),
          dataIndex: "status",
          width: 200,
        },
        {
          title: t("table_header.deliveryman"),
          dataIndex: "confirmed_by",
          width: 200,
        },
        {
          title: t("table_header.actions"),
          dataIndex: "actions",
          width: 200,
          fixed: !isMobile && fixRight ? "right" : undefined,
        },
      ],
      [fixLeft, fixRight, isMobile]
    );
    const router = useRouter();
    const [viewRowId, setViewRowId] = useState<string | null>(null);
    const handleView = (e: React.MouseEvent, id: string) => {
      const url = `${Routes.orderDetails}/${id}`;

      if (e.ctrlKey || e.metaKey || e.button === 1) {
        // Open in new tab
        window.open(url, "_blank");
      } else {
        // Same tab behavior
        setViewRowId(id);
        router.push(url);
      }
    };
    const [invoiceRowId, setInvoiceRowId] = useState<string | null>(null);
    const handleInvoice = (Id: string) => {
      setInvoiceRowId(Id);
    };
    const renderColumns = columns.map((col) => {
      if (col.dataIndex === "order_date") {
        return {
          ...col,
          render: (order_date: any, row: RecordType) => (
            <span>
              {order_date && format(order_date, "dd MMMM yyyy hh:mm a")}
            </span>
          ),
        };
      }
      if (col.dataIndex === "order_amount") {
        return {
          ...col,
          render: (order_amount: any, row: RecordType) => (
            <span className="text-right">
              {CurrencyData
                ? formatPrice(order_amount, CurrencyData)
                : order_amount}
            </span>
          ),
        };
      }
      if (col.dataIndex === "confirmed_by") {
        return {
          ...col,
          render: (confirmed_by: any, row: any) => (
            <div>
              {confirmed_by ? (
                <div className="flex items-center gap-2">
                  <div className="relative w-10 h-10 rounded-full">
                    {row?.deliveryman?.image_url !== null ? (
                      <Image
                        loader={GlobalImageLoader}
                        src={row?.deliveryman?.image_url}
                        alt="Deliveryman"
                        fill
                        sizes="40px"
                        className="w-full h-full rounded-full"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="/images/no-image.png"
                      />
                    ) : (
                      <Image
                        src="/images/no-user-image.jpg"
                        alt="No Image"
                        fill
                        sizes="40px"
                        className="w-full h-full rounded-full"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-blue-500 text-sm font-semibold capitalize">
                      {row?.deliveryman?.name}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold capitalize">
                    {t("common.not_assigned_yet")}
                  </p>
                </div>
              )}
            </div>
          ),
        };
      }

      if (col.dataIndex === "payment_status") {
        return {
          ...col,
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
                    {payment_status?.replace(/_/g, " ")}
                  </span>
                </div>
                <PaymentStatusUpdateModal
                  trigger={
                    <CustomStatusUpdateIcon
                      disabled={
                        row?.status === "delivered" ||
                        row?.status === "cancelled" ||
                        payment_status === "paid"
                      }
                    />
                  }
                  refetch={refetch}
                  row={row}
                />
              </div>
            );
          },
        };
      }
      if (col.dataIndex === "status") {
        return {
          ...col,
          render: (status: any, row: RecordType) => (
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
                      ? "bg-yellow-50 border border-yellow-500 text-yellow-500"
                      : status === "processing"
                      ? "bg-yellow-50 border border-orange-500 text-orange-500"
                      : status === "pickup"
                      ? "bg-teal-50 border border-teal-500 text-teal-500"
                      : "bg-red-50 border border-red-500 text-red-500"
                  } capitalize`}
                >
                  {status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <StatusUpdateModal
                  trigger={
                    <CustomStatusUpdateIcon
                      disabled={
                        status === "delivered" || status === "cancelled"
                      }
                    />
                  }
                  refetch={refetch}
                  row={row}
                />
              </div>
            </div>
          ),
        };
      }
      if (col.dataIndex === "actions") {
        return {
          ...col,
          render: (o: any, row: RecordType) => (
            <div className="flex items-center gap-2 ">
              <DeliverymanAssignModal
                trigger={
                  <CustomAssigneeIcon
                    disabled={
                      row.status === "pending" ||
                      row.status === "confirmed" ||
                      row.status === "shipped" ||
                      row.status === "cancelled" ||
                      row.status === "delivered"
                    }
                  />
                }
                refetch={refetch}
                row={row}
              />
              <CustomViewIcon
                isLoading={viewRowId === row.order_id}
                onClick={(e: React.MouseEvent<Element, MouseEvent>) =>
                  handleView(e, row.order_id)
                }
              />
              <InvoiceModal
                trigger={
                  <CustomInvoiceIcon
                    onClick={() => handleInvoice(row.order_id)}
                  />
                }
                RowId={invoiceRowId}
              />

              <ConfirmationModal
                trigger={
                  <CustomCancelIcon
                    disabled={
                      row.status === "delivered" || row.status === "cancelled"
                    }
                  />
                }
                onSave={() => handleCancelSingleOrder(row.order_id)}
                loading={loading}
                title="Cancel Order!"
                subTitle="Are you sure you want to cancel order?"
              />
            </div>
          ),
        };
      }
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
    selectStatus,
    selectStoreID,
    selectPaymentStatus,
    currentPage,
    startDate,
    endDate,
    isPending,
    refetch,
    error,
  ]);

  return (
    <>
      {isPending ? (
        <TableSkeletonLoader />
      ) : (
        <>
          <Card className="p-4 mt-4">
            <div className="flex flex-wrap gap-2 ">
              {StatusFilter.map((status: any, index: any) => (
                <Button
                  key={index}
                  onClick={() => setSelectStatus(status.value)}
                  className={`px-4 py-2 transition-all bg-blue-50 text-blue-500 hover:bg-blue-400 hover:text-white ${
                    selectStatus === status.value && "bg-blue-400 text-white"
                  }`}
                >
                  {status.label} ({status?.count})
                </Button>
              ))}
            </div>
          </Card>
          <RCTable
            originData={originalData}
            useColumn={useColumn}
            sortedInfo={sortedInfo}
            handleSort={handleSort}
            maxWidth={1900}
          />
          <div className="mt-4 flex flex-col lg:flex-row  justify-between">
            <div>
              <AppSelect
                value={String(itemsPerPage)}
                onSelect={handleSelectItemsPerPage}
                groups={CountItems}
                customClass="w-[80px] h-8 app-input mb-4 lg:mb-0"
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

export default OrdersTable;
