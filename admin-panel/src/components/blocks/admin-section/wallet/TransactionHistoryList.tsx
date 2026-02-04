"use client";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import CustomStatusUpdateIcon from "@/components/blocks/custom-icons/CustomStatusUpdateIcon";
import { Badge } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import { useTransactionsQuery } from "@/modules/admin-section/wallet/wallet.action";
import { formatDate } from "date-fns";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import PaymentStatusUpdateModal from "./modal/PaymentStatusUpdateModal";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  serial: string;
  owner_name: string;
  created_at: string;
  transaction_ref: string;
  transaction_details: string;
  amount?: string;
  type?: string;
  purpose?: string;
  payment_status?: any;
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

const TransactionHistoryList = ({ startDate, endDate }: any) => {
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

  const { TransactionsList, refetch, isPending, error } = useTransactionsQuery({
    per_page: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
    sort: sortField,
    start_date: startDate,
    end_date: endDate,
  });
  const TransactionsListData = useMemo(
    () => (TransactionsList as any) || {},
    [TransactionsList]
  );

  let totalDataLength = (TransactionsListData as any)?.pagination?.total;
  const startIndex = (TransactionsListData as any)?.pagination?.from;
  const LastPage = (TransactionsListData as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (TransactionsListData as any)?.wallets || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [TransactionsListData, startIndex]);

  const updatePage = (p: any) => {
    setCurrentPage(p);
  };
  useEffect(() => {
    if (Number(currentPage) > Number(LastPage)) {
      setCurrentPage(LastPage);
    } else {
      setCurrentPage(currentPage);
    }
  }, [LastPage, currentPage]);

  const handleSelectItemsPerPage = (value: string) => {
    const newItemsPerPage = parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    localStorage.setItem("itemsPerPage", value);
  };

  const handleSort = (columnKey: string) => {
    setSortedInfo((prev) => {
      const isSameColumn = prev.columnKey === columnKey;
      const newOrder =
        isSameColumn && prev.order === "ascend" ? "descend" : "ascend";
      return { columnKey, order: newOrder };
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
    const columns: ColumnsType<RecordType> = useMemo(
      () => [
        {
          title: t("table_header.sl"),
          dataIndex: "serial",
          fixed: fixLeft ? "left" : undefined,
          width: "5%",
        },
        {
          title: t("table_header.owner_name"),
          dataIndex: "owner_name",
          width: 150,
        },
        {
          title: t("table_header.reference"),
          dataIndex: "transaction_ref",
          width: 150,
        },

        {
          title: t("table_header.created_at"),
          dataIndex: "created_at",
          width: 150,
        },
        { title: t("table_header.amount"), dataIndex: "amount", width: 100 },
        { title: t("table_header.type"), dataIndex: "type", width: 100 },
        { title: t("table_header.purpose"), dataIndex: "purpose", width: 150 },
        {
          title: t("table_header.payment_status"),
          dataIndex: "payment_status",
          width: 100,
        },
        {
          title: t("table_header.actions"),
          dataIndex: "actions",
          width: "8%",
          fixed: !isMobile && fixRight ? "right" : undefined,
        },
      ],
      [fixLeft, fixRight, isMobile]
    );
    const renderColumns = columns.map((col: any) => {
      if (col.dataIndex === "owner_name") {
        return {
          ...col,
          render: (owner_name: any, row: RecordType) => (
            <div className="capitalize px-2">
              <span>{owner_name}</span>
            </div>
          ),
        };
      }
      if (col.dataIndex === "created_at") {
        return {
          ...col,
          render: (created_at: any, row: RecordType) => (
            <div>
              {created_at && formatDate(created_at, "dd MMMM yyyy hh:mm a")}
            </div>
          ),
        };
      }
      if (col.dataIndex === "payment_status") {
        return {
          ...col,
          render: (payment_status: any, row: RecordType) => (
            <div className="flex items-center justify-start gap-2">
              <div className="flex items-center gap-2">
                {payment_status && (
                  <Badge
                    className={` ${
                      payment_status === "paid"
                        ? "bg-green-50 border border-green-500 text-green-500"
                        : payment_status === "pending"
                        ? "bg-yellow-50 border border-yellow-500 text-yellow-500"
                        : "bg-gray-50 border border-gray-500 text-gray-500"
                    } capitalize`}
                  >
                    {payment_status}
                  </Badge>
                )}
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
              <PaymentStatusUpdateModal
                trigger={<CustomStatusUpdateIcon />}
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
  useEffect(() => {
    if (!isPending && !error) {
      refetch();
    }
  }, [
    sortField,
    itemsPerPage,
    currentPage,
    isPending,
    refetch,
    startDate,
    endDate,
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
            maxWidth={1200}
          />
          <div className="mt-3 flex flex-col md:flex-row justify-between ">
            <div>
              <AppSelect
                value={String(itemsPerPage)}
                onSelect={handleSelectItemsPerPage}
                groups={CountItems}
                customClass="w-[80px] h-8 mb-4 md:mb-0"
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

export default TransactionHistoryList;
