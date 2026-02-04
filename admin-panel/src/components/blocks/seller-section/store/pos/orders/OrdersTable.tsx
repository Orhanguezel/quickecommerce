"use client";
import { formatPrice } from "@/components/molecules/formatPrice";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import {
  CustomCancelIcon,
  CustomInvoiceIcon,
  CustomViewIcon,
} from "@/components/blocks/custom-icons";
import CustomStatusUpdateIcon from "@/components/blocks/custom-icons/CustomStatusUpdateIcon";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import { Badge, Button, Card } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import { SellerRoutes } from "@/config/sellerRoutes";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { format } from "date-fns";
import {
  ChevronsLeftIcon,
  ChevronsRightIcon,
  UserRoundCheck,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import InvoiceModal from "./modals/InvoiceModal";
import StatusUpdateModal from "./modals/StatusUpdateModal";
import {
  useCancelOrder,
  useOrdersQuery,
} from "@/modules/seller-section/pos/orders/orders.action";
import { formatNumberOnly } from "@/components/molecules/formatNumberOnly";
import { usePosInvoiceMutation } from "@/modules/seller-section/pos/Pos.action";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { usePosSettingsQuery } from "@/modules/admin-section/pos/Pos.action";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  order_id: string;
  serial: string;
  title: string;
  payment_status?: string;
  invoice_number?: string;
  purchase_limit?: number;
  discount_type?: string;
  special_price?: string;
  customer?: string;
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
  selectPaymentStatus,
  startDate,
  endDate,
}: any) => {
  const t = useTranslations();
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const storeID = selectedStore?.id;
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

  const sortField = sortedInfo.order == "ascend" ? "asc" : "desc";
  const { Orders, refetch, isPending, error } = useOrdersQuery({
    ...searchValue,
    per_page: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
    sort: sortField,
    status: selectStatus,
    payment_status: selectPaymentStatus,
    store_id: storeID,
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

  const { PosSettings } = usePosSettingsQuery({});
  const QueryCommissionSettingsData = useMemo(
    () => (PosSettings as any) || [],
    [PosSettings]
  );

  const message = QueryCommissionSettingsData?.data;

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
          width: "6%",
        },
        {
          title: t("table_header.order_id"),
          width: 100,
          dataIndex: "order_id",
          render: (_: any, row: any) => <p className="px-2">{row?.order_id}</p>,
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
          render: (_: any, row: any) => (
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
          width: 150,
        },
        {
          title: t("table_header.status"),
          dataIndex: "status",
          width: 200,
        },
        {
          title: t("table_header.actions"),
          dataIndex: "actions",
          width: "15%",
          fixed: !isMobile && fixRight ? "right" : undefined,
        },
      ],
      [fixLeft, fixRight, isMobile]
    );
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [viewRowId, setViewRowId] = useState<string | null>(null);
    const handleView = (e: React.MouseEvent, id: string) => {
      const url = `${SellerRoutes.posOrderDetails}/${id}`;

      if (e.ctrlKey || e.metaKey || e.button === 1) {
        window.open(url, "_blank");
      } else {
        setViewRowId(id);
        router.push(url);
        dispatch(setRefetch(true));
      }
    };
    const cart = useSelector((state: RootState) => state.cart.cart);
    const { mutate: PosInvoice } = usePosInvoiceMutation();

    const handlePrintInvoice = (Id: string) => {
      PosInvoice(
        {
          store_id: storeID,
          order_id: Id,
        },
        {
          onSuccess: (invoiceRes: any) => {
            // generate the HTML
            const printContent = generateInvoiceHTML(invoiceRes?.data);
            const printWindow = window.open("", "_blank");
            if (printWindow) {
              printWindow.document.write(printContent);
              printWindow.document.close();
              printWindow.focus();

              // wait for image to load
              const img = printWindow.document.querySelector("img");
              if (img) {
                img.onload = () => {
                  printWindow.print();
                  printWindow.close();
                };
              } else {
                printWindow.print();
                printWindow.close();
              }
            }
          },
          onError: (err: any) => {
            console.error("Invoice error:", err);
          },
        }
      );
    };

    const generateInvoiceHTML = (invoiceData: any) => {
      const invoice = invoiceData?.invoice;
      const storeDetails = invoiceData?.store_details;
      const qrCode = invoiceData?.qr_code;
      const cleanQRCode = qrCode.replace(/\n/g, "").replace(/\r/g, "");

      // ✅ Select style based on page type
      const isThermal = message?.com_pos_settings_print_invoice === "thermal";

      return `
        <html>
          <head>
            <title>Invoice ${invoice.invoice_number}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                ${isThermal ? "max-width: 80mm;" : "width: 210mm;"} 
                margin: 0 auto;
                ${isThermal ? "padding: 10px;" : "padding: 20mm 15mm;"}
                font-size: ${isThermal ? "13px" : "14px"};
                color: #000;
              }
                @page {
                size: ${isThermal ? "80mm auto" : "A4"}; 
                margin: ${isThermal ? "5mm" : "15mm"}; /* ✅ printing margins */
              }
              .center { text-align: center; }
              .bold { font-weight: bold; }
              .line { border-top: 1px dashed #000; margin: 8px 0; }
              table { width: 100%; border-collapse: collapse; margin-top: 5px; }
              th, td { padding: 4px; text-align: left; font-size: ${
                isThermal ? "12px" : "14px"
              }; }
              td { vertical-align: top; }
              .right { text-align: right; }
              .totals { margin-top: 10px; }
              .qr-code { margin-top: 10px; text-align: center; }
              .qr-code img { width: 80px; height: 80px; }
            </style>
          </head>
          <body>
            <!-- Header -->
            <div class="center">
              <img
                src="${storeDetails?.logo}"
                alt="Store Logo"
                style="width: ${isThermal ? "50px" : "80px"}; height: ${
        isThermal ? "50px" : "80px"
      }; border-radius: 50%; object-fit: cover; margin: 0 auto 5px auto;"
              />
              <h2 style="margin: 0; font-size: ${
                isThermal ? "16px" : "22px"
              };">${storeDetails?.name || "STORE NAME"}</h2>
              <p style="margin: 0; font-size: 12px;">${
                storeDetails?.address || ""
              }</p>
              <p style="margin: 0; font-size: 12px;"><b>Contact:</b> ${
                storeDetails?.phone
              }, ${storeDetails?.email}</p>
              <h3 style="margin: 5px 0; font-size: ${
                isThermal ? "14px" : "18px"
              };">INVOICE PAID</h3>
            </div>
      
            <!-- Invoice Details -->
            <p><b>Invoice:</b> ${invoice.invoice_number}</p>
            <p><b>Customer:</b> ${invoice.customer?.name}</p>
            <p><b>Date:</b> ${invoice.invoice_date}</p>
            <div class="line"></div>
      
            <!-- Items Table -->
            <table>
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th class="center">QTY</th>
                  <th class="right">PRICE</th>
                  <th class="right">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items
                  .map(
                    (item: any) => `
                    <tr>
                      <td>${item.name}<br/>
                        <small>${Object.entries(item.variant)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(", ")}</small>
                      </td>
                      <td class="center">${item.quantity}</td>
                      <td class="right">${
                        CurrencyData
                          ? formatPrice(item.price, CurrencyData)
                          : item.price
                      }</td>
                      <td class="right">${
                        CurrencyData
                          ? formatPrice(item.amount, CurrencyData)
                          : item.amount
                      }</td>
                    </tr>
                  `
                  )
                  .join("")}
              </tbody>
            </table>
      
            <div class="line"></div>
      
            <!-- Totals -->
            <div class="totals">
              <p style="display: flex; justify-content: space-between;"><b>Sub Total:</b> <span> ${
                CurrencyData
                  ? formatPrice(invoice.subtotal, CurrencyData)
                  : invoice.subtotal
              } </span> </p>
              <p style="display: flex; justify-content: space-between;"><b>Tax ${
                cart[0]?.store_tax
                  ? `(${formatNumberOnly(
                      Number(cart[0].store_tax),
                      CurrencyData
                    )}%)`
                  : ""
              }:</b> <span> ${
        CurrencyData
          ? formatPrice(invoice.total_tax_amount, CurrencyData)
          : invoice.total_tax_amount
      } </span></p>
              <p style="display: flex; justify-content: space-between;"><b>Coupon Discount:</b> <span> ${
                CurrencyData
                  ? formatPrice(invoice.coupon_discount, CurrencyData)
                  : invoice.coupon_discount
              } </span></p>
              <div class="line"></div>
              <p style="display: flex; justify-content: space-between;"><b>Total:</b> <span> ${
                CurrencyData
                  ? formatPrice(invoice.total_amount, CurrencyData)
                  : invoice.total_amount
              } </span></p>
            </div>
      
            <div class="line"></div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div class="center">
                <p>Thank you for shopping!</p>
                <small>Powered by POS System</small>
              </div>
              <div class="qr-code">
                <img src="${cleanQRCode}" alt="QR Code" />
              </div>
            </div>
          </body>
        </html>`;
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
          render: (confirmed_by: any, row: RecordType) => (
            <span className="text-blue-500">
              {confirmed_by && <UserRoundCheck />}
            </span>
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
              </div>
            );
          },
        };
      }
      if (col.dataIndex === "status") {
        return {
          ...col,
          render: (status: any, row: RecordType) => (
            <div className="flex items-center justify-start gap-2">
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
                      : "bg-red-50 border border-red-500 text-red-500"
                  } capitalize`}
                >
                  {status}
                </Badge>
              </div>

              {/* <div className="flex items-center gap-2">
                <StatusUpdateModal
                  trigger={
                    <CustomStatusUpdateIcon disabled={status == "cancelled"} />
                  }
                  refetch={refetch}
                  row={row}
                />
              </div> */}
            </div>
          ),
        };
      }
      if (col.dataIndex === "actions") {
        return {
          ...col,
          render: (o: any, row: RecordType) => (
            <div className="flex items-center gap-2 ">
              <CustomViewIcon
                isLoading={viewRowId === row.order_id}
                onClick={(e: React.MouseEvent<Element, MouseEvent>) =>
                  handleView(e, row.order_id)
                }
              />
              <CustomInvoiceIcon
                onClick={() => handlePrintInvoice(row.order_id)}
              />

              {/* <ConfirmationModal
                trigger={
                  <CustomCancelIcon
                    disabled={
                      row.status == "shipped" ||
                      row.status == "cancelled" ||
                      row.status == "delivered" 
                    }
                  />
                }
                onSave={() => handleCancelSingleOrder(row.order_id)}
                loading={loading}
                title={t("title.cancel_order")}
                subTitle={t("sub_title.cancel_order")}
              /> */}
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
    selectPaymentStatus,
    startDate,
    endDate,
    currentPage,
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
          <RCTable
            originData={originalData}
            useColumn={useColumn}
            sortedInfo={sortedInfo}
            handleSort={handleSort}
            maxWidth={1500}
          />
          <div className="mt-4 flex flex-col md:flex-row gap-2 justify-between">
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

export default OrdersTable;
