"use client";
import { AppSelect } from "@/components/blocks/common";
import { formatPrice } from "@/components/molecules/formatPrice";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";
import { CountItems } from "@/config/helperJson";
import { formatLabel } from "@/lib/utils";
import { useCashCollectQuery } from "@/modules/admin-section/financial/cash-collect/cash-collect.action";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import {
  ChevronsLeftIcon,
  ChevronsRightIcon,
  MessageSquareQuote,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";
import ShowReferenceModal from "./modal/ShowReferenceModal";

interface RecordType {
  id: string;
  order_id: string;
  serial: string;
  activity_value: string;
  activity_from?: any;
  reference?: any;
  created_at?: any;
  activity_type?: any;
  ref?: any;
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

const CashCollectTable = () => {
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
  const { CashCollects, refetch, isPending, error } = useCashCollectQuery({
    per_page: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
    sort: sortField,
  });

  let totalDataLength = (CashCollects as any)?.meta?.total;
  const startIndex = (CashCollects as any)?.meta?.from;
  const LastPage = (CashCollects as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (CashCollects as any)?.data || [];
    return data?.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [CashCollects, startIndex]);

  useEffect(() => {
    if (Number(currentPage) > Number(LastPage)) {
      setCurrentPage(LastPage);
    } else {
      setCurrentPage(currentPage);
    }
  }, [LastPage, currentPage]);

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

  const useColumn = (
    fixLeft: boolean,
    fixRight: boolean
  ): ColumnsType<RecordType> => {
    const columns: ColumnsType<RecordType> = React.useMemo(
      () => [
        {
          title: t("table_header.sl"),
          dataIndex: "serial",
          fixed: fixLeft ? "left" : undefined,
          width: "5%",
        },
        {
          title: t("table_header.order_no"),
          dataIndex: "order_id",
          width: 100,
        },
        {
          title: t("table_header.amount"),
          dataIndex: "activity_value",
          width: 150,
        },
        {
          title: t("table_header.collected_from"),
          dataIndex: "ref",
          width: 150,
        },
        {
          title: t("table_header.activity_type"),
          dataIndex: "activity_type",
          width: 150,
        },
        {
          title: t("table_header.activity_from"),
          dataIndex: "activity_from",
          width: 150,
        },
        {
          title: t("table_header.collected_at"),
          dataIndex: "created_at",
          width: 200,
        },
        {
          title: t("table_header.reference"),
          dataIndex: "reference",
          width: 200,
        },
      ],
      [fixLeft]
    );

    const renderColumns = columns.map((col) => {
      if (col.dataIndex === "ref") {
        return {
          ...col,
          render: (ref: any, row: RecordType) => (
            <span className="capitalize">{ref}</span>
          ),
        };
      }
      if (col.dataIndex === "activity_type") {
        return {
          ...col,
          render: (activity_type: any, row: RecordType) => (
            <span className="capitalize">
              {activity_type && formatLabel(activity_type || "", "_")}
            </span>
          ),
        };
      }
      if (col.dataIndex === "activity_value") {
        return {
          ...col,
          render: (activity_value: any, row: RecordType) => (
            <span className="text-right">
              {CurrencyData
                ? formatPrice(activity_value, CurrencyData)
                : activity_value}
            </span>
          ),
        };
      }
      if (col.dataIndex === "reference") {
        return {
          ...col,
          render: (_: any, row: RecordType) => (
            <div className="flex items-center justify-start gap-2">
              <ShowReferenceModal
                trigger={
                  <div className="cursor-pointer p-1 bg-teal-50 border border-teal-500 text-teal-500 rounded">
                    <span>
                      <MessageSquareQuote width={20} height={20} />
                    </span>
                  </div>
                }
                reference={row?.reference}
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
  }, [sortField, itemsPerPage, currentPage, isPending, refetch, error]);

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
          <div className="mt-3 flex flex-col md:flex-row justify-between">
            <div>
              <AppSelect
                value={String(itemsPerPage)}
                onSelect={handleSelectItemsPerPage}
                groups={CountItems}
                customClass="w-[80px] h-8 mb-4 md:mb-0"
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

export default CashCollectTable;
