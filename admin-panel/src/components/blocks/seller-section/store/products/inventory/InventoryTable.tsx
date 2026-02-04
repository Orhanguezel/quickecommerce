"use client";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import { AppSelect } from "@/components/blocks/common";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import { useInventoryQuery } from "@/modules/seller-section/inventory/inventory.action";
import { useAppSelector } from "@/redux/hooks";
import {
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Search,
  SquareActivity,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";
import InventoryList from "./component/InventoryList";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";
const stockList = [
  {
    label: "Low Stock",
    value: "low_stock",
  },
  {
    label: "Out of Stock",
    value: "out_of_stock",
  },
];
const InventoryTable = () => {
  const locale = useLocale();
  const t = useTranslations();
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const store_id = selectedStore?.id;
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
  const [selectPayment4Status, setSelectPayment4Status] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchButtonClick = () => {
    setSearchValue(searchQuery);
  };
  const handleKeyDown = (event: { key: string }) => {
    if (event.key === "Enter") {
      handleSearchButtonClick();
    }
  };

  const sortField = sortedInfo.order == "ascend" ? "asc" : "desc";
  const { InventoryListData, refetch, isPending, isFetching } =
    useInventoryQuery({
      per_page: itemsPerPage,
      language: locale,
      page: currentPage,
      sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
      sort: sortField,
      search: searchValue,
      store_id: store_id,
      stock_status: selectPayment4Status,
    });

  let totalDataLength = (InventoryListData as any)?.meta?.total;
  const startIndex = (InventoryListData as any)?.meta?.from;
  const LastPage = (InventoryListData as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (InventoryListData as any)?.data || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [InventoryListData, startIndex]);

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
  const handlePayment4Status = (value: string) => {
    const newSelectOwner = String(value);
    if (value === "none") {
      setSelectPayment4Status("");
    } else {
      setSelectPayment4Status(newSelectOwner);
    }
  };
  useEffect(() => {
    if (!isPending) refetch();
  }, [
    searchValue,
    sortField,
    itemsPerPage,
    currentPage,
    selectPayment4Status,
    isPending,
    refetch,
  ]);
  React.useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchValue("");
    }
  }, [searchQuery]);
  return (
    <>
      <Card className="">
        <CardContent className="grid grid-cols-1 xl:grid-cols-5 gap-4 p-2 md:p-4">
          <div className="col-span-1">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <SquareActivity /> Inventory{" "}
            </h1>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardContent className="p-2 md:p-6">
          <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
            <div className="flex  flex-col xl:flex-row items-start gap-2 xl:gap-0 xl:items-center w-full xl:w-auto">
              <AppSelect
                placeholder={t("place_holder.select_stock_status")}
                value={String(selectPayment4Status)}
                onSelect={handlePayment4Status}
                groups={stockList}
                customClass=" w-full xl:w-44"
              />
            </div>
            <div className="relative flex items-center w-full">
              <div
                className={`${
                  locale === "ar" ? "right-3" : "left-3"
                } absolute  text-gray-500 dark:text-white mt-0.5`}
              >
                <Search width={18} height={18} />
              </div>
              <Input
                type="text"
                placeholder={t("place_holder.search_by_product")}
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={handleSearchInputChange}
                className="app-input px-8"
              />
              <Button
                variant="outline"
                onClick={handleSearchButtonClick}
                className="app-button mx-2"
              >
                {t("button.search")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {isPending ? (
        <TableSkeletonLoader />
      ) : (
        <>
          <div>
            <InventoryList originalData={originalData} isPending={isPending} />
            <div className="mt-3 flex flex-col md:flex-row justify-between">
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
          </div>
        </>
      )}
    </>
  );
};

export default InventoryTable;
