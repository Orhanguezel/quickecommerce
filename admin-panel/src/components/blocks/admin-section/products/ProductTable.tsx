"use client";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import { AppSelect } from "@/components/blocks/common";
import { CountItems } from "@/config/helperJson";
import {
  useMakeFeature,
  useProductDelete,
  useProductQuery,
} from "@/modules/admin-section/products/product.action";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import AdminProductsList from "./components/AdminProductsList";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

const ProductTable = ({
  searchValue,
  selectStatus,
  selectStoreID,
  selectStoreID2,
}: any) => {
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
  const { productList, refetch, isPending, error } = useProductQuery({
    store_id: selectStoreID,
    type: selectStoreID2,
    status: selectStatus,
    per_page: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
    sort: sortField,
    search: searchValue,
  });
  let totalDataLength = (productList as any)?.meta?.total;
  const startIndex = (productList as any)?.meta?.from;
  const LastPage = (productList as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (productList as any)?.data || [];
    return data.map((item: any, index: number) => ({
      ...item,
      sl: startIndex + index,
    }));
  }, [productList, startIndex]);

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
  const [loading, setLoading] = useState(false);
  const { mutate: productDelete } = useProductDelete();
  const handleDelete = (id: string) => {
    setLoading(true);
    productDelete(id, {
      onSuccess: () => {
        refetch();
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      },
    });
  };
  const { mutate: brandStatus } = useMakeFeature();
  const handleMakeFeature = (id: string) => {
    setLoading(true);
    brandStatus(
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

  useEffect(() => {
    if (!isPending && !error) {
      refetch();
    }
  }, [
    searchValue,
    sortField,
    itemsPerPage,
    currentPage,
    selectStatus,
    selectStoreID,
    selectStoreID2,
    isPending,
    refetch,
    error,
  ]);

  return (
    <>
      {isPending ? (
        <TableSkeletonLoader />
      ) : (
        <>
          <AdminProductsList
            originalData={originalData}
            handleDelete={handleDelete}
            handleMakeFeature={handleMakeFeature}
            refetch={refetch}
            loading={loading}
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
        </>
      )}
    </>
  );
};

export default ProductTable;
