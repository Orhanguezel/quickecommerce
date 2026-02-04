"use client";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import { Badge } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import CustomNoticeIcon from "@/components/blocks/custom-icons/CustomNoticeIcon";
import { useNoticesQuery } from "@/modules/seller-section/settings/notices/notices.action";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";
import ShowReplyModal from "./modal/ShowReplyModal";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  serial: string;
  title: string;
  type: string;
  priority: string;
  created_at: string;
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

const NoticesTable = () => {
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
  const { NoticesData, refetch, isPending, error } = useNoticesQuery({
    per_page: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : "name",
    sort: sortField,
  });

  let totalDataLength = (NoticesData as any)?.meta?.total;
  const startIndex = (NoticesData as any)?.meta?.from;
  const LastPage = (NoticesData as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (NoticesData as any)?.data || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [NoticesData, startIndex]);

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
          width: 150,
        },
        {
          title: t("table_header.created_at"),
          dataIndex: "created_at",
          width: 150,
        },
        {
          title: t("table_header.priority"),
          dataIndex: "priority",
          width: "12%",
        },
        {
          title: t("table_header.status"),
          dataIndex: "status",
          width: "12%",
        },
        {
          title: "Actions",
          dataIndex: "actions",
          width: "12%",
          fixed: !isMobile && fixRight ? "right" : undefined,
        },
      ],
      [fixLeft, fixRight, isMobile]
    );
    const [invoiceRowId, setInvoiceRowId] = useState<string | null>(null);
    const handleInvoice = (Id: string) => {
      setInvoiceRowId(Id);
    };
    const renderColumns = columns.map((col) => {
      if (col.dataIndex === "priority") {
        return {
          ...col,
          render: (priority: any, row: RecordType) => (
            <div className="relative flex items-center justify-start gap-2">
              <div className="w-[75px]">
                <span
                  className={`border ${
                    priority === "low"
                      ? "text-red-500 border-red-500 bg-red-50"
                      : priority === "medium"
                      ? "text-yellow-500 border-yellow-500 bg-yellow-50"
                      : "text-green-500 border-green-500 bg-green-50"
                  } capitalize px-2 py-1 rounded`}
                >
                  {priority}
                </span>
              </div>
            </div>
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
                  {`${status == 1 ? "Show" : "Hide"}`}
                </Badge>
              </div>
            </div>
          ),
        };
      }
      if (col.dataIndex === "actions") {
        return {
          ...col,
          render: (_: any, row: any) => (
            <div className="flex items-center justify-start gap-2">
              <ShowReplyModal
                trigger={
                  <CustomNoticeIcon
                    onClick={() => handleInvoice(row.notice_id)}
                  />
                }
                RowId={invoiceRowId}
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
  }, [sortField, currentPage, itemsPerPage, isPending, refetch, error]);
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

export default NoticesTable;
