"use client";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import { AppSelect } from "@/components/blocks/common";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import {
  useInventoryDeleteMutation,
  useInventoryQuery,
  useInventoryStoreQuery,
} from "@/modules/admin-section/inventory/inventory.action";
import { useBrandsQuery } from "@/modules/common/brand/brand.action";
import { useStoreTypeQuery } from "@/modules/common/store-type/store-type.action";
import {
  ChevronsLeftIcon,
  ChevronsRightIcon,
  SquareActivity,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";
import InventoryList from "./component/InventoryList";
import { AppSearchSelect } from "@/components/blocks/common/AppSearchSelect";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

const InventoryTable = () => {
  const locale = useLocale();
  const t = useTranslations();

  const [shouldRefetch, setShouldRefetch] = useState(false);
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

  const [selectBrand, setSelectBrand] = useState<string>("");
  const [selectStore, setSelectStore] = useState<string>("");
  const [selectProductType, setSelectProductType] = useState<string>("");

  const { InventoryStoreList, refetch: sellerStoreRefetch } =
    useInventoryStoreQuery({
      seller_id: "",
    });
  const { brands } = useBrandsQuery({});
  const { storeType } = useStoreTypeQuery({});
  let brandData = (brands as any) || [];
  let productTypeData = (storeType as any) || [];
  let InventoryStoreData = (InventoryStoreList as any) || [];

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
  const { InventoryListData, refetch, isPending, isFetching, error } =
    useInventoryQuery({
      per_page: itemsPerPage,
      language: locale,
      page: currentPage,
      sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
      sort: sortField,
      search: searchValue,
      brand_id: selectBrand,
      type: selectProductType,
      store_id: selectStore,
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
  const handleSelectBrand = (value: string) => {
    const newSelectBrand = String(value);
    if (value === "none") {
      setSelectBrand("");
    } else {
      setSelectBrand(newSelectBrand);
    }
  };
  const handleSelectStore = (value: string) => {
    const newSelectStore = String(value);
    if (value === "none") {
      setSelectStore("");
    } else {
      setSelectStore(newSelectStore);
    }
  };
  const handleSelectProductType = (value: string) => {
    const newSelectProductType = String(value);
    if (value === "none") {
      setSelectProductType("");
    } else {
      setSelectProductType(newSelectProductType);
    }
  };
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectedSingleRow, setSelectedSingleRow] = useState<Set<string>>(
    new Set()
  );
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const handleDelete = (rowId: string) => {
    setSelectedSingleRow((prev) => {
      const updated = new Set(prev);
      if (updated.has(rowId)) {
        updated.delete(rowId);
      } else {
        updated.add(rowId);
      }
      return updated;
    });
    setIsDeleteModalOpen(true); // Open confirmation modal
  };

  const handleApplyAction = () => {
    if (selectedAction === "delete") {
      handleBulkDelete();
    }
    // Add other actions here (e.g., "edit", etc.)
  };

  const { mutate: inventoryDelete } = useInventoryDeleteMutation();
  const handleBulkDelete = () => {
    // Convert selectedRows Set to an array of product IDs
    const productIds = Array.from(selectedRows);

    inventoryDelete(
      { product_ids: productIds },
      {
        onSuccess: () => {
          setShouldRefetch(true);
          refetch();
        },
      }
    );
    setSelectedRows(new Set());
  };

  const confirmDelete = () => {
    const productIds = Array.from(selectedSingleRow);

    inventoryDelete(
      { product_ids: productIds },
      {
        onSuccess: () => {
          setShouldRefetch(true);
          refetch();
        },
      }
    );
    setSelectedSingleRow(new Set());
    setIsDeleteModalOpen(false);
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
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
    selectBrand,
    selectProductType,
    selectStore,
    isPending,
    refetch,
    error,
  ]);
  React.useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchValue("");
    }
  }, [searchQuery]);
  return (
    <>
      <Card className="">
        <CardContent className="flex flex-col lg:flex-row justify-between p-2 md:p-4 lg:p-4">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <SquareActivity /> Inventory{" "}
            </h1>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardContent className="flex flex-col lg:flex-row justify-between p-2 md:p-4 lg:p-4">
          <div className="flex flex-col lg:flex-row  gap-2 lg:gap-0 items-center w-full">
            <div className="flex items-center gap-2">
              <AppSearchSelect
                placeholder="Select Product type"
                value={String(selectProductType)}
                onSelect={handleSelectProductType}
                groups={productTypeData}
                customClass="w-full lg:w-48"
              />
              <AppSearchSelect
                placeholder="Select Store"
                value={String(selectStore)}
                onSelect={handleSelectStore}
                groups={InventoryStoreData}
                customClass="w-full lg:w-60"
              />
              <AppSearchSelect
                placeholder="Select brand"
                value={String(selectBrand)}
                onSelect={handleSelectBrand}
                groups={brandData}
                customClass="w-full lg:w-60"
              />
            </div>
            <div className="relative flex items-center w-full">
              <Input
                type="text"
                placeholder="Search by product..."
                value={searchQuery}
                onKeyDown={handleKeyDown}
                onChange={handleSearchInputChange}
                className="app-input mx-0 lg:mx-2 px-8"
              />
              <Button
                disabled={isFetching}
                variant="outline"
                onClick={handleSearchButtonClick}
                className="app-button mx-2 lg:mx-0"
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
            <InventoryList
              originalData={originalData}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              selectedAction={selectedAction}
              setSelectedAction={setSelectedAction}
              handleApplyAction={handleApplyAction}
              handleRowDelete={handleDelete}
              confirmDelete={confirmDelete}
              cancelDelete={cancelDelete}
              isDeleteModalOpen={isDeleteModalOpen}
              setIsDeleteModalOpen={setIsDeleteModalOpen}
            />
            <div className="mt-3 flex flex-col md:flex-row justify-between">
              <div>
                <AppSelect
                  value={String(itemsPerPage)}
                  onSelect={handleSelectItemsPerPage}
                  groups={CountItems}
                  customClass="w-[80px] h-8 mb-4 lg:mb-0"
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
          </div>
        </>
      )}
    </>
  );
};

export default InventoryTable;
