"use client";
import { formatPrice } from "@/components/molecules/formatPrice";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import { CustomViewIcon } from "@/components/blocks/custom-icons";
import { Badge } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import { SellerRoutes } from "@/config/sellerRoutes";
import { formatLabel } from "@/lib/utils";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { useRequestQuery } from "@/modules/seller-section/financial/withdraw/request/request.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  order_id: string;
  serial: string;
  name: string;
  amount: string;
  payment_method?: any;
  gateways?: string;
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

const RequestTable = ({ searchValue }: any) => {
  const t = useTranslations();
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const store_id = selectedStore?.id ?? "";
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
    per_page: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
    sort: sortField,
    store_id: store_id,
    amount: searchValue,
  });

  let totalDataLength = (Requests as any)?.meta?.total;
  const startIndex = (Requests as any)?.meta?.from;
  const originalData = useMemo(() => {
    const data = (Requests as any)?.data || [];
    return data?.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [Requests, startIndex]);

  const { currency, refetch: refetchCurrency } = useCurrencyQuery({});
  const currencyData = useMemo(() => {
    const data = (currency as any) || {};
    return data;
  }, [currency]);
  const CurrencyData = currencyData.currencies_info;

  const [shouldRefetch, setShouldRefetch] = useState(false);
  const dispatch = useAppDispatch();

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
          title: "Amount",
          dataIndex: "amount",
          width: 100,
          render: (amount: any, row: RecordType) => (
            <div className="capitalize">
              {amount ? formatPrice(amount, CurrencyData) : amount}
            </div>
          ),
        },
        {
          title: t("table_header.gateway_name"),
          dataIndex: "payment_method",
          width: 150,
        },
        {
          title: "Gateways",
          dataIndex: "gateways",
          width: 500,
        },
        {
          title: t("table_header.status"),
          dataIndex: "status",
          width: 100,
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
    const [viewRowId, setViewRowId] = useState<string | null>(null);
    const handleView = (e: React.MouseEvent, id: string) => {
      const url = `${SellerRoutes.withdrawRequestDetails}/${id}`;
      if (e.ctrlKey || e.metaKey || e.button === 1) {
        window.open(url, "_blank");
      } else {
        setViewRowId(id);
        router.push(url);
        dispatch(setRefetch(true));
      }
    };
    const renderColumns = columns.map((col) => {
      if (col.dataIndex === "payment_method") {
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
          render: (payment_method: string, row: RecordType) => {
            const index =
              Math.abs(
                payment_method
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
                    {payment_method}
                  </span>
                </div>
              </div>
            );
          },
        };
      }
      if (col.dataIndex === "gateways") {
        return {
          ...col,
          render: (gateways: string[], row: RecordType) => (
            <div className="flex flex-wrap gap-1 text-gray-500 dark:text-white font-semibold">
              {Object.entries(gateways).map(([key, value], index, array) => (
                <span key={key}>
                  <span className="text-black dark:text-white capitalize">
                    {" "}
                    {key && formatLabel(key || "", "_")}{" "}
                  </span>{" "}
                  {`: ${value}`}
                  {index !== array.length - 1 && ","}
                </span>
              ))}
            </div>
          ),
        };
      }

      if (col.dataIndex === "status") {
        return {
          ...col,
          render: (status: any, row: RecordType) => (
            <div className="flex items-center justify-start gap-2">
              <div className="w-[85px]">
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
              <CustomViewIcon
                isLoading={viewRowId === row.id}
                onClick={(e: React.MouseEvent<Element, MouseEvent>) =>
                  handleView(e, row.id)
                }
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
    shouldRefetch,
    isRefetch,
    dispatch,
    refetch,
    sortField,
    itemsPerPage,
    currentPage,
    error,
    isPending,
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
            maxWidth={1000}
          />
          <div className="mt-4 flex justify-between">
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

export default RequestTable;
