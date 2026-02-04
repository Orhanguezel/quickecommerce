"use client";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import { Badge, Card, CardContent, Input } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import GlobalImageLoader from "@/lib/imageLoader";
import { useInventoryStoreQuery } from "@/modules/admin-section/inventory/inventory.action";
import {
  useFlashDealsAllProductsQuery,
  useFlashDealsDropdownQuery,
} from "@/modules/admin-section/promotional/flash-deals/flash-deals.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import {
  BaggageClaim,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  serial: string;
  product_name: string;
  flash_sale_title?: string;
  store?: string;
  product_image?: string;
  actions?: any;
  status?: boolean;
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

const StatusList = [
  { id: 1, label: "Approved", value: "approved" },
  { id: 2, label: "Pending", value: "pending" },
  { id: 3, label: "rejected", value: "rejected" },
];

const FlashDealsAllProductsTable = () => {
  const t = useTranslations();
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
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

  const initialStartDate = "2025-01-01";
  const initialEndDate = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [selectBrand, setSelectBrand] = useState<string>("");
  const [selectStore, setSelectStore] = useState<string>("");
  const [selectProductType, setSelectProductType] = useState<string>("");

  const { InventoryStoreList } = useInventoryStoreQuery({
    seller_id: "",
  });
  const { FlashDealsDropdown } = useFlashDealsDropdownQuery({});

  let StoreData = (InventoryStoreList as any) || [];
  let FlashDealsData = (FlashDealsDropdown as any) || [];
  const sortField = sortedInfo.order == "ascend" ? "asc" : "desc";

  const { FlashDealsAllProducts, refetch, isPending } =
    useFlashDealsAllProductsQuery({
      limit: itemsPerPage,
      language: locale,
      page: currentPage,
      sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
      sort: sortField,
      store_id: selectStore,
      flash_sale_id: selectProductType,
      start_date: startDate,
      end_date: endDate,
      status: selectBrand,
    });

  let totalDataLength = (FlashDealsAllProducts as any)?.meta?.total;
  const startIndex = (FlashDealsAllProducts as any)?.meta?.from;
  const originalData = useMemo(() => {
    const data = (FlashDealsAllProducts as any)?.data || [];
    return data?.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [FlashDealsAllProducts, startIndex]);

  const [shouldRefetch, setShouldRefetch] = useState(false);
  const dispatch = useAppDispatch();

  const updatePage = (p: any) => {
    setCurrentPage(p);
    setShouldRefetch(true);
  };

  useEffect(() => {
    refetch();
    dispatch(setRefetch(false));
  }, [
    shouldRefetch,
    isRefetch,
    dispatch,
    refetch,
    sortField,
    itemsPerPage,
    selectStore,
    startDate,
    endDate,
    selectProductType,
    selectBrand,
  ]);

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
          title: t("table_header.image"),
          dataIndex: "product_image",
          width: 100,
          render: (product_image: string) =>
            product_image == "" ? (
              <div className="relative w-12 h-12">
                <Image
                  loader={GlobalImageLoader}
                  src={product_image}
                  alt="product image"
                  fill
                  sizes="48px"
                  className="w-full h-full"
                />{" "}
              </div>
            ) : (
              <div className="relative w-12 h-12">
                <Image
                  src="/images/no-image.png"
                  alt="No Image"
                  fill
                  sizes="48px"
                  className="w-full h-full"
                />{" "}
              </div>
            ),
        },
        {
          title: t("table_header.name"),
          dataIndex: "product_name",
          width: 100,
        },

        {
          title: t("table_header.flash_sale"),
          dataIndex: "flash_sale_title",
          width: 100,
        },
        {
          title: t("table_header.store"),
          dataIndex: "store",
          width: 100,
        },

        {
          title: t("table_header.status"),
          dataIndex: "status",
          width: 50,
          fixed: !isMobile && fixRight ? "right" : undefined,
          render: (status: string, row: RecordType) => (
            <div>
              <Badge
                className={` ${
                  status === "approved"
                    ? "bg-green-50 border border-green-500 text-green-500"
                    : status === "pending"
                    ? "bg-yellow-50 border border-yellow-500 text-yellow-500"
                    : "bg-red-50 border border-red-500 text-red-500"
                } capitalize`}
              >
                {status}
              </Badge>
            </div>
          ),
        },
      ],
      [fixLeft, fixRight, isMobile]
    );
    const renderColumns = columns.map((col) => {
      return col;
    });
    return renderColumns;
  };

  const handleStartDateChange = (e: { target: { value: any } }) => {
    const value = e.target.value;
    setStartDate(value);
    if (endDate && new Date(endDate) < new Date(value)) {
      setEndDate("");
    }
  };

  const handleEndDateChange = (e: { target: { value: any } }) => {
    const value = e.target.value;
    if (new Date(value) >= new Date(startDate)) {
      setEndDate(value);
    } else {
      alert("End date cannot be earlier than the start date!");
    }
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
  const handleFlashDeals = (value: string) => {
    const newSelectProductType = String(value);
    if (value === "none") {
      setSelectProductType("");
    } else {
      setSelectProductType(newSelectProductType);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-black dark:text-white flex items-center gap-2">
              {" "}
              <BaggageClaim /> {t("label.all_products")}{" "}
            </h1>
          </div>
          <div className="flex items-end gap-4">
            <div>
              <span className="text-sm text-gray-500 dark:text-white px-2">
                {t("label.flash_deals")}
              </span>
              <AppSelect
                placeholder={t("place_holder.select_flash_deals")}
                value={String(selectProductType)}
                onSelect={handleFlashDeals}
                groups={FlashDealsData}
                customClass="mx-2"
              />
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-white px-2">
                {t("label.store")}
              </span>
              <AppSelect
                placeholder={t("place_holder.select_store")}
                value={String(selectStore)}
                onSelect={handleSelectStore}
                groups={StoreData}
                customClass="mx-2"
              />
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-white px-2">
                {t("label.status")}
              </span>

              <AppSelect
                placeholder={t("place_holder.select_status")}
                value={String(selectBrand)}
                onSelect={handleSelectBrand}
                groups={StatusList}
                customClass="mx-2"
              />
            </div>
            <div className="flex items-end gap-4 mx-2">
              <div>
                <span className="text-sm text-gray-500 dark:text-white">
                  {t("label.start_date")}
                </span>
                <Input
                  id="start_date"
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  className="app-input"
                />
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-white ">
                  {t("label.end_date")}
                </span>
                <Input
                  id="end_date"
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  className="app-input"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {isPending ? (
        <TableSkeletonLoader />
      ) : (
        <>
          <RCTable
            originData={originalData}
            useColumn={useColumn}
            sortedInfo={sortedInfo}
            handleSort={handleSort}
          />
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

export default FlashDealsAllProductsTable;
