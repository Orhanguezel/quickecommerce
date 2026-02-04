"use client";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import { AppSelect } from "@/components/blocks/common";
import { CountItems } from "@/config/helperJson";

import {
  useProductDelete,
  useProductQuery,
} from "@/modules/admin-section/products/product.action";
import { useRequestApproveMutation } from "@/modules/admin-section/request/request.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/index";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import RequestProductsList from "./component/RequestProductsList";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

const RequestProductTable = ({ searchValue }: any) => {
  const [shouldRefetch, setShouldRefetch] = useState(false);

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
    store_id: "",
    type: "",
    status: "pending",
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
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectedAction, setSelectedAction] = useState<string>("");

  const handleApplyAction = () => {
    if (selectedAction === "approve") {
      handleBulkRequestApprove();
    }
  };

  const { mutate: ProductRequestApprove, isPending: isRequesting } =
    useRequestApproveMutation();
  const handleBulkRequestApprove = () => {
    const Ids = Array.from(selectedRows);
    ProductRequestApprove(
      { product_ids: Ids },
      {
        onSuccess: () => {
          refetch();
          setShouldRefetch(true);
        },
      }
    );
    setSelectedRows(new Set());
  };
  const handleApprove = (id: string) => {
    setLoading(true);
    const productIds = [id];
    ProductRequestApprove(
      { product_ids: productIds },
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
        <TableSkeletonLoader />
      ) : (
        <>
          <RequestProductsList
            originalData={originalData}
            handleDelete={handleDelete}
            refetch={refetch}
            loading={loading}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            selectedAction={selectedAction}
            setSelectedAction={setSelectedAction}
            handleApplyAction={handleApplyAction}
            handleRowApprove={handleApprove}
            isRequesting={isRequesting}
          />
          <div className="mt-3 flex flex-col md:flex-row justify-between">
            <div>
              <AppSelect
                value={String(itemsPerPage)}
                onSelect={handleSelectItemsPerPage}
                groups={CountItems}
                customClass="w-[80px] h-8 mb-4 lg:mb-0"
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

export default RequestProductTable;
