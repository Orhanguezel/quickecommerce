"use client";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import { Badge } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import { SellerRoutes } from "@/config/sellerRoutes";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/components/molecules/formatPrice";
import TableAddIcon from "@/components/blocks/custom-icons/TableAddIcon";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { useActiveFlashDealsQuery } from "@/modules/seller-section/promotional/flash-deals/flash-deals.action";
import { format } from "date-fns";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  serial: string;
  title: string;
  start_time: string;
  end_time: string;
  discount_amount?: string;
  actions?: any;
  status?: any;
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

const ActiveDealsTable = ({ searchValue }: any) => {
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
  const sortField = sortedInfo.order == "ascend" ? "asc" : "desc";
  const sortData =
    sortedInfo.order == "ascend"
      ? sortedInfo.columnKey
      : `${sortedInfo.columnKey}`;

  const { ActiveFlashDeals, refetch, isPending, error } =
    useActiveFlashDealsQuery({
      limit: itemsPerPage,
      language: locale,
      page: currentPage,
      sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
      sort: sortField,
      search: searchValue,
    });

  let totalDataLength = (ActiveFlashDeals as any)?.meta?.total;
  const startIndex = (ActiveFlashDeals as any)?.meta?.from;
  const originalData = useMemo(() => {
    const data = (ActiveFlashDeals as any)?.data || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [ActiveFlashDeals, startIndex]);

  const { currency } = useCurrencyQuery({});
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
          title: t("table_header.title"),
          dataIndex: "title",
          width: 100,
        },
        {
          title: t("table_header.start_time"),
          dataIndex: "start_time",
          width: 100,
        },
        {
          title: t("table_header.end_time"),
          dataIndex: "end_time",
          width: 100,
        },
        {
          title: t("table_header.discount_amount"),
          dataIndex: "discount_amount",
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
      router.push(`${SellerRoutes.JoinDealsAdd}/${Id}`);
      dispatch(setRefetch(true));
    };
    const renderColumns = columns.map((col) => {
      if (col.dataIndex === "start_time") {
        return {
          ...col,
          render: (start_time: any, row: RecordType) => (
            <span className="text-right">
              {format(start_time, "dd MMMM yyyy hh:mm a")}
            </span>
          ),
        };
      }
      if (col.dataIndex === "end_time") {
        return {
          ...col,
          render: (end_time: any, row: RecordType) => (
            <span className="text-right">
              {format(end_time, "dd MMMM yyyy hh:mm a")}
            </span>
          ),
        };
      }
      if (col.dataIndex === "discount_amount") {
        return {
          ...col,
          render: (discount_amount: any, row: RecordType) => (
            <span className="text-right">
              {CurrencyData
                ? formatPrice(discount_amount, CurrencyData)
                : discount_amount}
            </span>
          ),
        };
      }
      if (col.dataIndex === "status") {
        return {
          ...col,
          render: (status: any, row: RecordType) => (
            <div className="flex items-center justify-start gap-2">
              <div className="w-[75px]">
                <Badge
                  className={` ${
                    status == 1
                      ? "bg-green-50 border border-green-500 text-green-500"
                      : "bg-gray-50 border border-gray-500 text-gray-500"
                  } capitalize`}
                >
                  {`${status == 1 ? "Active" : "Resolved"}`}
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
            <div className="relative flex items-center gap-2 w-full">
              <div className="">
                <TableAddIcon
                  disabled={row.status == 0}
                  isLoading={editRowId === row.id}
                  onClick={() => handleEdit(row.id)}
                  addText="Add Product to Deals"
                />
              </div>
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
    if (!isPending && !error) {
      refetch();
      dispatch(setRefetch(false));
    }
  }, [
    isRefetch,
    dispatch,
    refetch,
    searchValue,
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
            maxWidth={1200}
          />
          <div className="mt-4 flex justify-between">
            <div>
              <AppSelect
                value={String(itemsPerPage)}
                onSelect={handleSelectItemsPerPage}
                groups={CountItems}
                customClass="w-[80px] h-8"
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

export default ActiveDealsTable;
