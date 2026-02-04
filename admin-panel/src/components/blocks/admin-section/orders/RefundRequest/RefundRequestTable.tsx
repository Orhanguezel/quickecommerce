"use client";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/components/molecules/formatPrice";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import { CustomViewIcon } from "@/components/blocks/custom-icons";
import CustomFileIcon from "@/components/blocks/custom-icons/CustomFileIcon";
import CustomStatusUpdateIcon from "@/components/blocks/custom-icons/CustomStatusUpdateIcon";
import { Badge } from "@/components/ui";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CountItems } from "@/config/helperJson";
import { Routes } from "@/config/routes";
import { useRefundRequestQuery } from "@/modules/admin-section/orders/refund-request/refund-request.action";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import ShowFileModal from "../modals/ShowFileModal";
import StatusUpdateModal from "./modal/StatusUpdateModal";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";
interface RecordType {
  id: string;
  serial: string;
  order_refund_reason: string;
  order_id?: any;
  amount: string;
  store: string;
  customer_note: string;
  status?: string;
  customer?: string;
  meta_description?: string;
  invoice?: any;
  actions?: any;
  key: React.Key;
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

const RefundRequestTable = ({ searchValue, allFilters }: any) => {
  const locale = useLocale();
  const t = useTranslations();
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
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
  const { currency, refetch: refetchCurrency } = useCurrencyQuery({});
  const currencyData = useMemo(() => {
    const data = (currency as any) || {};
    return data;
  }, [currency]);
  const CurrencyData = currencyData.currencies_info;
  const sortField = sortedInfo.order == "ascend" ? "asc" : "desc";
  const sortData =
    sortedInfo.order == "ascend"
      ? sortedInfo.columnKey
      : `${sortedInfo.columnKey}`;

  const { RefundRequests, refetch, isPending } = useRefundRequestQuery({
    ...allFilters,
    per_page: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
    sort: sortField,
    search: searchValue,
  });
  let totalDataLength = (RefundRequests as any)?.meta?.total;
  const startIndex = (RefundRequests as any)?.meta?.from;
  const LastPage = (RefundRequests as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (RefundRequests as any)?.data || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [RefundRequests, startIndex]);

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
          title: t("table_header.invoice_no"),
          dataIndex: "invoice",
          width: 200,
        },
        {
          title: t("table_header.customer"),
          width: 200,
          dataIndex: "customer",
          render: (row: any) => <p className="capitalize">{row?.customer}</p>,
        },
        {
          title: t("table_header.store"),
          dataIndex: "store",
          width: 150,
        },
        {
          title: t("table_header.amount"),
          dataIndex: "amount",
          width: 100,
        },
        {
          title: t("table_header.refund_reason"),
          dataIndex: "order_refund_reason",
          width: 200,
        },

        {
          title: t("table_header.status"),
          dataIndex: "status",
          width: 150,
        },
        {
          title: t("table_header.actions"),
          dataIndex: "actions",
          width: "10%",
          fixed: !isMobile && fixRight ? "right" : undefined,
        },
      ],
      [fixLeft, fixRight, isMobile]
    );
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [editRowId, setEditRowId] = useState<string | null>(null);
    const handleEdit = (Id: string) => {
      setEditRowId(Id);
      router.push(`${Routes.supportTicketDetails}/${Id}`);
      dispatch(setRefetch(true));
    };
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
    const renderColumns = columns.map((col) => {
      if (col.dataIndex === "amount") {
        return {
          ...col,
          render: (amount: any, row: RecordType) => (
            <span className="text-right">
              {CurrencyData ? formatPrice(amount, CurrencyData) : amount}
            </span>
          ),
        };
      }
      if (col.dataIndex === "status") {
        return {
          ...col,
          render: (status: any, row: RecordType) => (
            <div className="relative flex items-center justify-start gap-2">
              <div className="w-[85px]">
                <Badge
                  className={`border ${
                    status === "rejected"
                      ? "text-red-500 border-red-500 bg-red-50"
                      : status === "refunded"
                      ? "text-blue-500 border-blue-500 bg-blue-50"
                      : status === "approved"
                      ? "text-green-500 border-green-500 bg-green-50"
                      : "text-yellow-500 border-yellow-500 bg-yellow-50"
                  } capitalize `}
                >
                  {status}
                </Badge>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <StatusUpdateModal
                      trigger={
                        <CustomStatusUpdateIcon
                          disabled={
                            status == "refunded" || status == "rejected"
                          }
                        />
                      }
                      refetch={refetch}
                      row={row}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-blue-500 text-white">
                  {t("tooltip.status_update")}
                </TooltipContent>
              </Tooltip>
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
              <ShowFileModal
                trigger={<CustomFileIcon />}
                refetch={refetch}
                row={row}
              />
            </div>
          ),
        };
      }
      return col;
    });
    return renderColumns;
  };
  const dispatch = useAppDispatch();
  useEffect(() => {
    refetch();
    dispatch(setRefetch(false));
    if (Number(currentPage) > Number(LastPage)) {
      setCurrentPage(LastPage);
    } else {
      setCurrentPage(currentPage);
    }
  }, [
    isRefetch,
    dispatch,
    refetch,
    searchValue,
    sortField,
    itemsPerPage,
    currentPage,
    allFilters,
    LastPage,
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
            maxWidth={1200}
          />
          <div className="mt-4 flex flex-col lg:flex-row justify-between">
            <div>
              <AppSelect
                value={String(itemsPerPage)}
                onSelect={handleSelectItemsPerPage}
                groups={CountItems}
                customClass="w-[80px] h-8 mb-4 lg:mb-0"
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

export default RefundRequestTable;
