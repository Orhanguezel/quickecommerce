"use client";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import { Badge, Card, CardContent } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import {
  useGenerateWalletHMAQuery,
  useTransactionsQuery,
  useWalletPaymentStatusMutation,
  useWalletQuery,
} from "@/modules/seller-section/financial/wallet/wallet.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import {
  ChevronsLeftIcon,
  ChevronsRightIcon,
  DollarSignIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import DepositModal from "./modal/DepositModal";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { formatPrice } from "@/components/molecules/formatPrice";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";
interface RecordType {
  id: string;
  serial: string;
  owner_name: string;
  transaction_ref: string;
  transaction_details: string;
  amount?: string;
  type?: string;
  purpose?: string;
  payment_gateway?: string;
  payment_status?: string;
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

const WalletList = ({ startDate, endDate }: any) => {
  const t = useTranslations();
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const walletHistoryId = localStorage.getItem("wallet_history_id") || "";
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const store_id = selectedStore?.id ?? "";
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
  const { WalletDetails, refetch: walletRefetch } = useWalletQuery({
    store_id,
  });
  let MyWalletData = (WalletDetails as any) || {};
  let WalletDetailsData = (WalletDetails as any)?.wallets || {};
  const { TransactionsList, refetch, isPending, error } = useTransactionsQuery({
    limit: itemsPerPage,
    language: locale,
    page: currentPage,
    start_date: startDate,
    end_date: endDate,
    store_id,
  });
  const TransactionsListData = useMemo(
    () => (TransactionsList as any) || {},
    [TransactionsList]
  );
  let totalDataLength = (TransactionsListData as any)?.meta?.total;
  const startIndex = (TransactionsListData as any)?.meta?.from;
  const LastPage = (TransactionsListData as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (TransactionsListData as any)?.wallets || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [TransactionsListData, startIndex]);

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

  const { generateHMAC } = useGenerateWalletHMAQuery({
    wallet_history_id: walletHistoryId,
  });
  const hmac = (generateHMAC as any)?.hmac;
  const timestamp = (generateHMAC as any)?.timestamp;
  const { mutate: paymentStatus } = useWalletPaymentStatusMutation(hmac);
  const onSubmit = useCallback(
    async (walletHistoryID: string, transaction_id: string, urlParams: any) => {
      const defaultData = {
        wallet_history_id: walletHistoryID,
        transaction_ref: transaction_id,
        timestamp,
      };

      if (!timestamp) {
        return null;
      }

      return paymentStatus(
        { ...(defaultData as any) },
        {
          onSuccess: (res) => {
            urlParams.delete("session_id");
            const newUrl =
              window.location.pathname +
              (urlParams.toString() ? `?${urlParams}` : "");
            window.history.replaceState(null, "", newUrl);
            refetch();
            dispatch(setRefetch(true));
            walletRefetch();
          },
        }
      );
    },
    [paymentStatus, refetch, dispatch, timestamp, walletRefetch]
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id"
    );
    const isPaid = localStorage.getItem(`payment_status_${walletHistoryId}`);

    if (sessionId) {
      fetch(`/api/stripe-webhook?session_id=${sessionId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.transaction_id) {
            onSubmit(walletHistoryId, data.transaction_id, urlParams);
          } else {
            toast.error("Failed to retrieve transaction details");
          }
        })
        .catch((error) => {
          toast.error(
            error instanceof Error
              ? `Error refetching data: ${error.message}`
              : "An unknown error occurred while refetching data"
          );
        });
    }
  }, [walletHistoryId, onSubmit]);

  const useColumn = (fixLeft: boolean): ColumnsType<RecordType> => {
    const columns: ColumnsType<RecordType> = useMemo(
      () => [
        {
          title: t("table_header.sl"),
          dataIndex: "serial",
          fixed: fixLeft ? "left" : undefined,
          width: "6%",
        },
        {
          title: t("table_header.owner_name"),
          dataIndex: "owner_name",
          width: 150,
        },
        {
          title: t("table_header.transaction_ref"),
          dataIndex: "transaction_ref",
          width: 200,
        },
        { title: t("table_header.amount"), dataIndex: "amount", width: 100 },
        { title: t("table_header.type"), dataIndex: "type", width: 100 },
        {
          title: t("table_header.purpose"),
          dataIndex: "purpose",
          width: 200,
        },
        {
          title: t("table_header.payment_gateway"),
          dataIndex: "payment_gateway",
          width: 200,
        },
        {
          title: t("table_header.payment_status"),
          dataIndex: "payment_status",
          width: 150,
          render: (payment_status: string, row: RecordType) => (
            <div>
              <Badge
                className={` ${
                  payment_status === "paid"
                    ? "bg-green-50 border border-green-500 text-green-500"
                    : payment_status === "pending"
                    ? "bg-yellow-50 border border-yellow-500 text-yellow-500"
                    : "bg-red-50 border border-red-500 text-red-500"
                } capitalize`}
              >
                {payment_status || "N/A"}
              </Badge>
            </div>
          ),
        },
      ],
      [fixLeft]
    );
    const renderColumns = columns.map((col: any) => {
      if (col.dataIndex === "payment_gateway") {
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
          render: (payment_gateway: string, row: RecordType) => {
            const index =
              Math.abs(
                (payment_gateway || "")
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
                    {payment_gateway || "N/A"}
                  </span>
                </div>
              </div>
            );
          },
        };
      }
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
    itemsPerPage,
    currentPage,
    isPending,
    refetch,
    error,
  ]);

  return (
    <>
      <div>
        <div className="space-y-6 mt-6">
          {isPending ? (
            <div>
              <TableSkeletonLoader />
            </div>
          ) : (
            <>
              <Card>
                <CardContent className="p-2 md:p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
                    <div className="flex items-center justify-between">
                      <div className="">
                        <p className="font-semibold text-gray-500 dark:text-white text-base">
                          {t("common.available_balance")}
                        </p>
                        <p className="text-lg md:text-2xl font-bold text-blue-500">
                          {WalletDetailsData?.total_balance
                            ? formatPrice(
                                WalletDetailsData?.total_balance,
                                CurrencyData
                              )
                            : WalletDetailsData?.total_balance}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <DepositModal
                        trigger={
                          <div className="flex p-2 cursor-pointer items-center justify-between gap-2 app-button shadow-xl rounded">
                            <div className="bg-blue-500 text-white p-1 rounded-full shadow-xl">
                              <DollarSignIcon width={16} height={16} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">
                                {t("common.deposit_amount")}
                              </p>
                            </div>
                          </div>
                        }
                        MyWalletData={MyWalletData}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-2 md:p-6">
                  <p className="text-2xl font-bold text-gray-500 dark:text-white">
                    {t("common.transaction_history")}
                  </p>

                  <RCTable
                    originData={originalData}
                    useColumn={useColumn}
                    sortedInfo={sortedInfo}
                    handleSort={handleSort}
                    maxWidth={1200}
                  />

                  <div className="mt-4 flex flex-col md:flex-row gap-2 justify-between">
                    <div>
                      <AppSelect
                        value={String(itemsPerPage)}
                        onSelect={handleSelectItemsPerPage}
                        groups={CountItems}
                        customClass="w-[80px] h-8 "
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
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default WalletList;
