"use client";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import { AppSelect } from "@/components/blocks/common";
import { CountItems } from "@/config/helperJson";
import { useSellerStoreQuery } from "@/modules/seller-section/store/store.action";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";
import StoreGridCard from "./components/StoreGridCard";
import { toast } from "react-toastify";
import { Card } from "@/components/ui";
import NoDataFoundIcon from "@/assets/icons/NoDataFoundIcon";
import CardSkletonLoader from "@/components/molecules/CardSkletonLoader";

const MyStores = ({ searchValue }: any) => {
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
  const { storeList, refetch, isPending, error } = useSellerStoreQuery({
    limit: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
    sort: sortField,
    search: searchValue,
  });
  let totalDataLength = (storeList as any)?.meta?.total;
  const startIndex = (storeList as any)?.meta?.from;
  const LastPage = (storeList as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (storeList as any)?.data || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [storeList, startIndex]);

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

  const [transactionNo, setTransactionNo] = useState("");
  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id"
    );
    if (sessionId) {
      fetch(`/api/stripe-webhook?session_id=${sessionId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.transaction_id) {
            setTransactionNo(data.transaction_id);
            localStorage.setItem("transaction_id", data.transaction_id);
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
  }, []);

  const handleSelectItemsPerPage = (value: string) => {
    const newItemsPerPage = parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    localStorage.setItem("itemsPerPage", value);
  };

  useEffect(() => {
    if (!isPending && !error) {
      refetch();
    }
  }, [
    searchValue,
    sortField,
    itemsPerPage,
    currentPage,
    isPending,
    refetch,
    error,
  ]);

  return (
    <>
      {isPending ? (
        <CardSkletonLoader />
      ) : (
        <div className="min-h-[calc(100vh-16.5rem)]">
          <>
            {originalData && originalData.length > 0 ? (
              <div className="my-4 grid 2xl:grid-cols-3 xl:grid-cols-2 lg:grid-cols-1  sm:grid-cols-2 gap-4">
                {originalData.map(
                  (item: any, index: React.Key | null | undefined) => (
                    <div key={index}>
                      <StoreGridCard items={item} />
                    </div>
                  )
                )}
              </div>
            ) : (
              <Card className="w-full flex items-center justify-center p-6 mt-6">
                <div className="flex flex-col items-center justify-center text-gray-500 dark:text-white py-10">
                  <NoDataFoundIcon />
                  <p className="mt-2 text-sm text-gray-500 dark:text-white font-bold">
                    {t("common.not_data_found")}
                  </p>
                </div>
              </Card>
            )}
          </>
          {originalData && originalData.length > 0 && (
            <div className="mt-4 flex flex-col md:flex-row  justify-between">
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
          )}
        </div>
      )}
    </>
  );
};

export default MyStores;
