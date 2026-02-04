"use client";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import { CountItems } from "@/config/helperJson";
import GlobalImageLoader from "@/lib/imageLoader";
import { useMyFlashDealsQuery } from "@/modules/seller-section/promotional/flash-deals/flash-deals.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  serial: string;
  flash_sale: string;
  product: string;
  products: string;
  end_time: string;
  store: string;
  actions?: any;
  status?: any;
  key: React.Key;
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

const MyDealsTable = ({ searchValue }: any) => {
  const locale = useLocale();
  const t = useTranslations();
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const store_id = selectedStore?.id;
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
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
  const { MyFlashDeals, refetch, isPending, error } = useMyFlashDealsQuery({
    store_id: store_id || "",
    per_page: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
    sort: sortField,
    search: searchValue,
  });

  let totalDataLength = (MyFlashDeals as any)?.meta?.total;
  const startIndex = (MyFlashDeals as any)?.meta?.from;
  const LastPage = (MyFlashDeals as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (MyFlashDeals as any)?.data || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [MyFlashDeals, startIndex]);
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

  const useColumn = (fixLeft: boolean): ColumnsType<RecordType> => {
    const columns: ColumnsType<RecordType> = React.useMemo(
      () => [
        {
          title: t("table_header.sl"),
          dataIndex: "serial",
          width: "10%",
          fixed: fixLeft ? "left" : undefined,
        },
        {
          title: t("table_header.flash_deals"),
          dataIndex: "flash_sale",
          width: 200,
        },
        {
          title: t("table_header.products"),
          width: 200,
          dataIndex: "products",
          render: (_:any , row: any) => (
            <div className="flex items-center gap-2">
              <div className="relative w-12 h-12">
                {row?.product_image ? (
                  <Image
                    loader={GlobalImageLoader}
                    src={row?.product_image}
                    alt="product Logo"
                    fill
                    sizes="48px"
                    className="w-full h-full"
                  />
                ) : (
                  <Image
                    src="/images/no-image.png"
                    alt="No Image"
                    fill
                    sizes="48px"
                    className="w-full h-full"
                  />
                )}
              </div>
              <div>
                <p className="capitalize">{row?.product}</p>
              </div>
            </div>
          ),
        },
        {
          title: t("table_header.end_date"),
          dataIndex: "end_time",
          width: 200,
        },
      ],
      [fixLeft]
    );

    const renderColumns = columns.map((col) => {
      if (col.dataIndex === "end_time") {
        return {
          ...col,
          render: (end_time: any, row: RecordType) => <span>{end_time}</span>,
        };
      }
      return col;
    });
    return renderColumns;
  };
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!isPending && !error) {
      refetch();
    }
  }, [
    isRefetch,
    dispatch,
    refetch,
    searchValue,
    sortField,
    itemsPerPage,
    currentPage,
    isPending,
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

export default MyDealsTable;
