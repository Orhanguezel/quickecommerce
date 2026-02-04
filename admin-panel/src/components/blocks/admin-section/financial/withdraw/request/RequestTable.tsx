"use client";
import { formatPrice } from "@/components/molecules/formatPrice";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import { CustomViewIcon } from "@/components/blocks/custom-icons";
import CustomApproveIcon from "@/components/blocks/custom-icons/CustomApproveIcon";
import CustomRejectIcon from "@/components/blocks/custom-icons/CustomRejectIcon";
import { Badge } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import { Routes } from "@/config/routes";
import {
  useRequestQuery,
  useRequestRejectMutation,
} from "@/modules/admin-section/financial/withdraw/request/request.action";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { formatDate } from "date-fns";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import ApproveConfirmModal from "../modals/ApproveConfirmModal";
import RejectConfirmModal from "../modals/RejectConfirmModal";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";
interface RecordType {
  owner_type: any;
  owner: any;
  id: string;
  serial: string;
  reviewed: string;
  store: string;
  owner_name: string;
  amount: string;
  created_at: string;
  gateway_name: string;
  details: string;
  status: string;
  selectActions?: any;
  actions?: any;
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

const RequestTable = ({ searchValue, startDate, endDate }: any) => {
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
  const { Requests, refetch, isPending, error } = useRequestQuery({
    from_date: startDate,
    to_date: endDate,
    per_page: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : "name",
    sort: sortField,
    amount: searchValue,
  });

  let totalDataLength = (Requests as any)?.meta?.total;
  const startIndex = (Requests as any)?.meta?.from;
  const LastPage = (Requests as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (Requests as any)?.data || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [Requests, startIndex]);
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

  const { currency, refetch: refetchCurrency } = useCurrencyQuery({});
  const currencyData = useMemo(() => {
    const data = (currency as any) || {};
    return data;
  }, [currency]);
  const CurrencyData = currencyData.currencies_info;

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
  const { mutate: RejectSingleRowId } = useRequestRejectMutation();
  const handleSingleReject = (id: string, reason: string) => {
    const payload = { id: id, reject_reason: reason };
    setLoading(true);
    RejectSingleRowId(payload, {
      onSuccess: () => {
        refetch();
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      },
    });
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
          width: "5%",
        },
        {
          title: t("table_header.amount"),
          dataIndex: "amount",
          width: 100,
          render: (amount: any, row: RecordType) => (
            <div className="capitalize">
              {amount ? formatPrice(amount, CurrencyData) : amount}
            </div>
          ),
        },
        {
          title: t("table_header.owner_name"),
          width: 100,
          dataIndex: "owner_name",
          render: (_: any, row: RecordType) => (
            <div className="flex items-center gap-1 capitalize ">
              <p className="text-blue-500">{row?.owner?.name}</p>
              <p className="text-sm">({row?.owner_type})</p>
            </div>
          ),
        },
        {
          title: t("table_header.gateway_name"),
          dataIndex: "gateway_name",
          width: 100,
        },
        {
          title: t("table_header.request_at"),
          dataIndex: "created_at",
          width: 100,
        },
        {
          title: t("table_header.status"),
          dataIndex: "status",
          width: 100,
        },
        {
          title: t("table_header.actions"),
          dataIndex: "actions",
          width: "12%",
          fixed: !isMobile && fixRight ? "right" : undefined,
        },
      ],
      [fixLeft, fixRight, isMobile]
    );
    const router = useRouter();

    const [viewRowId, setViewRowId] = useState<string | null>(null);
    const handleView = (e: React.MouseEvent, id: string) => {
      const url = `${Routes.withdrawDetails}/${id}`;
      if (e.ctrlKey || e.metaKey || e.button === 1) {
        window.open(url, "_blank");
      } else {
        setViewRowId(id);
        router.push(url);
      }
    };
    const renderColumns = columns.map((col) => {
      if (col.dataIndex === "gateway_name") {
        const colors = [
          { border: "border-red-500", bg: "bg-red-100", text: "text-red-500" },
          {
            border: "border-blue-500",
            bg: "bg-blue-100",
            text: "text-blue-500",
          },
          {
            border: "border-green-500",
            bg: "bg-green-100",
            text: "text-green-500",
          },
          {
            border: "border-yellow-500",
            bg: "bg-yellow-100",
            text: "text-yellow-500",
          },
          {
            border: "border-purple-500",
            bg: "bg-purple-100",
            text: "text-purple-500",
          },
          {
            border: "border-pink-500",
            bg: "bg-pink-100",
            text: "text-pink-500",
          },
          {
            border: "border-indigo-500",
            bg: "bg-indigo-100",
            text: "text-indigo-500",
          },
        ];

        return {
          ...col,
          render: (gateway_name: string, row: RecordType) => {
            const index =
              Math.abs(
                gateway_name
                  .split("")
                  .reduce((acc, char) => acc + char.charCodeAt(0), 0)
              ) % colors.length;
            const color = colors[index];

            return (
              <div className="relative flex items-center justify-start gap-2">
                <div>
                  <span
                    className={`border ${color.border} ${color.bg} ${color.text}
                    capitalize px-2 py-1 rounded`}
                  >
                    {gateway_name}
                  </span>
                </div>
              </div>
            );
          },
        };
      }
      if (col.dataIndex === "created_at") {
        return {
          ...col,
          render: (created_at: any, row: RecordType) => (
            <span>
              {created_at && formatDate(created_at, "dd MMMM yyyy hh:mm a")}
            </span>
          ),
        };
      }
      if (col.dataIndex === "status") {
        return {
          ...col,
          render: (status: any, row: RecordType) => (
            <div className="flex items-center justify-start gap-2">
              <div className="flex items-center gap-2">
                <Badge
                  className={` ${
                    status === "approved"
                      ? "bg-green-50 border border-green-500 text-green-500"
                      : status === "pending"
                      ? "bg-yellow-50 border border-yellow-500 text-yellow-500"
                      : "bg-red-50 border border-red-500 text-red-500"
                  } capitalize`}
                >
                  {status}
                </Badge>
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
              <>
                <CustomViewIcon
                  isLoading={viewRowId === row.id}
                  onClick={(e: React.MouseEvent<Element, MouseEvent>) =>
                    handleView(e, row.id)
                  }
                />
                <ApproveConfirmModal
                  trigger={
                    <CustomApproveIcon disabled={row?.status !== "pending"} />
                  }
                  refetch={refetch}
                  ID={row.id}
                />
                <RejectConfirmModal
                  trigger={
                    <CustomRejectIcon disabled={row?.status !== "pending"} />
                  }
                  onSave={(reason: string) =>
                    handleSingleReject(row.id, reason)
                  }
                  loading={loading}
                />
              </>
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
    startDate,
    endDate,
    searchValue,
    sortField,
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
          <div className="relative">
            <RCTable
              originData={originalData}
              useColumn={useColumn}
              sortedInfo={sortedInfo}
              handleSort={handleSort}
              maxWidth={1200}
            />
          </div>
          <div className="mt-3 flex flex-col md:flex-row justify-between">
            <div>
              <AppSelect
                value={String(itemsPerPage)}
                onSelect={handleSelectItemsPerPage}
                groups={CountItems}
                customClass="w-[80px] h-8 app-input mb-4 md:mb-0"
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

export default RequestTable;
