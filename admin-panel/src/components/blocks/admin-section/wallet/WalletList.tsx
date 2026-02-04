"use client";
import { formatPrice } from "@/components/molecules/formatPrice";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import { Badge, Switch } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import {
  useWalletQuery,
  useWalletStatusChange,
} from "@/modules/admin-section/wallet/wallet.action";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  serial: string;
  owner_id: string;
  balance: string;
  owner_name?: string;
  owner_type?: string;
  status?: boolean;
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

const WalletList = ({ selectStatus, selectOwner }: any) => {
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
  const { currency, refetch: refetchCurrency } = useCurrencyQuery({});
  const currencyData = useMemo(() => {
    const data = (currency as any) || {};
    return data;
  }, [currency]);
  const CurrencyData = currencyData.currencies_info;

  const { allWallet, refetch, isPending, error } = useWalletQuery({
    per_page: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
    sort: sortField,
    owner_type: selectOwner,
    status: selectStatus,
  });
  const MyWalletData = useMemo(() => (allWallet as any) || {}, [allWallet]);

  let totalDataLength = (MyWalletData as any)?.pagination?.total;
  const startIndex = (MyWalletData as any)?.pagination?.from;
  const LastPage = (MyWalletData as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (MyWalletData as any)?.wallets || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [MyWalletData, startIndex]);

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

  const [loading, setLoading] = useState(false);
  const { mutate: StatusUpdate } = useWalletStatusChange();
  const handleToggleStatus = (id: string) => {
    setLoading(true);
    StatusUpdate(
      { id },
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

  const useColumn = (fixLeft: boolean): ColumnsType<RecordType> => {
    const columns: ColumnsType<RecordType> = useMemo(
      () => [
        {
          title: t("table_header.sl"),
          dataIndex: "serial",
          fixed: fixLeft ? "left" : undefined,
          width: "8%",
        },
        {
          title: t("table_header.owner_id"),
          dataIndex: "owner_id",
          width: 100,
        },
        {
          title: t("table_header.owner_name"),
          dataIndex: "owner_name",
          width: 150,
        },
        {
          title: t("table_header.owner_type"),
          dataIndex: "owner_type",
          width: 150,
        },
        {
          title: t("table_header.balance"),
          dataIndex: "balance",
          width: 150,
        },
        {
          title: t("table_header.status"),
          dataIndex: "status",
          width: 200,
        },
      ],
      [fixLeft]
    );
    const renderColumns = columns.map((col: any) => {
      if (col.dataIndex === "owner_id") {
        return {
          ...col,
          render: (owner_id: any, row: RecordType) => (
            <div className="">
              <span>{owner_id}</span>
            </div>
          ),
        };
      }
      if (col.dataIndex === "owner_name") {
        return {
          ...col,
          render: (owner_name: any, row: RecordType) => (
            <div className="capitalize">
              <span>{owner_name}</span>
            </div>
          ),
        };
      }
      if (col.dataIndex === "owner_type") {
        return {
          ...col,
          render: (owner_type: any, row: RecordType) => (
            <div className="capitalize">
              <span>{owner_type}</span>
            </div>
          ),
        };
      }
      if (col.dataIndex === "balance") {
        return {
          ...col,
          render: (balance: any, row: RecordType) => (
            <span className="">{formatPrice(balance, CurrencyData)}</span>
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
                    status == 1
                      ? "bg-green-50 border border-green-500 text-green-500"
                      : "bg-gray-50 border border-gray-500 text-gray-500"
                  } capitalize`}
                >
                  {`${status == 1 ? t("common.active") : t("common.inactive")}`}
                </Badge>
              </div>

              <ConfirmationModal
                trigger={
                  <div dir="ltr">
                    <Switch checked={status == 1} />
                  </div>
                }
                loading={loading}
                onSave={() => handleToggleStatus(row.id)}
                title={t("title.update_status")}
                subTitle={t("sub_title.update_status")}
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
    error,
    selectStatus,
    selectOwner,
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
            maxWidth={800}
          />
          <div className="mt-3 flex flex-col md:flex-row justify-between ">
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

export default WalletList;
