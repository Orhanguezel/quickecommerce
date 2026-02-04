"use client";
import MuteVectorIcon from "@/assets/icons/MuteVectorIcon";
import VectorIcon from "@/assets/icons/VectorIcon";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import { Badge } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import GlobalImageLoader from "@/lib/imageLoader";
import { useSubscriptionStoreHistoryQueryById } from "@/modules/admin-section/business-operations/subscription/package/package.action";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  serial: string;
  name?: string;
  image_url?: string;
  image?: string;
  store?: any;
  package_info?: any;
  store_slug?: any;
  expire_date?: any;
  validity?: any;
  pos_system?: any;
  payment_gateway?: any;
  payment_status?: any;
  price?: string;
  product_featured_limit?: string;
  product_limit?: string;
  self_delivery?: string;
  actions?: any;
  status?: any;
  is_active?: any;
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

const SubscriptionStoreListHistory = ({ ID }: any) => {
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
  const { SubscriptionStoreHistory, refetch, isPending, error } =
    useSubscriptionStoreHistoryQueryById(ID);
  let totalDataLength = (SubscriptionStoreHistory as any)?.meta?.total;
  const startIndex = (SubscriptionStoreHistory as any)?.meta?.from;
  const LastPage = (SubscriptionStoreHistory as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (SubscriptionStoreHistory as any)?.data || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [SubscriptionStoreHistory, startIndex]);

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

  const useColumn = (
    fixLeft: boolean,
    fixRight: boolean
  ): ColumnsType<RecordType> => {
    const columns: ColumnsType<RecordType> = React.useMemo(
      () => [
        {
          title: t("table_header.sl"),
          dataIndex: "serial",
          fixed: fixLeft ? "left" : undefined,
          width: "6%",
        },
        {
          title: t("table_header.image"),
          dataIndex: "image_url",
          width: 100,
          render: (image_url: string) =>
            image_url ? (
              <div className="relative w-12 h-12">
                <Image
                  loader={GlobalImageLoader}
                  src={image_url}
                  alt="image"
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
                />
              </div>
            ),
        },
        {
          title: t("table_header.name"),
          dataIndex: "name",
          width: 180,
        },
        {
          title: t("table_header.store_info"),
          dataIndex: "store",
          width: 150,
        },
        {
          title: t("table_header.package_info"),
          width: 350,
          dataIndex: "package_info",
          render: (_:any , row: any) => (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <p>{t("table_header.pos_system")} :</p>

                <p>
                  {row?.pos_system == true ? (
                    <VectorIcon />
                  ) : (
                    <MuteVectorIcon />
                  )}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <p>{t("table_header.live_chat")} :</p>

                <p>
                  {row?.live_chat == 1 ? <VectorIcon /> : <MuteVectorIcon />}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <p>{t("table_header.product_limit")} :</p>

                <p>{row?.product_limit}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <p>{t("table_header.order_limit")} :</p>

                <p>{row?.order_limit}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <p>{t("table_header.featured_limit")} :</p>

                <p>{row?.product_featured_limit}</p>
              </div>
            </div>
          ),
        },
        {
          title: t("table_header.payment_gateway"),
          dataIndex: "payment_gateway",
          width: 200,
        },
        {
          title: t("table_header.payment_status"),
          dataIndex: "payment_status",
          width: 200,
        },
        {
          title: t("table_header.status"),
          dataIndex: "status",
          width: 150,
        },
        {
          title: t("table_header.expire_date"),
          dataIndex: "expire_date",
          width: 200,
        },
        {
          title: t("table_header.validity"),
          dataIndex: "validity",
          width: 150,
          render: (validity: any, row: RecordType) => (
            <div className="capitalize">{validity && `${validity} days`}</div>
          ),
        },
      ],
      [fixLeft]
    );
    const renderColumns = columns.map((col) => {
      if (col.dataIndex === "store") {
        return {
          ...col,
          render: (store: any, row: RecordType) => (
            <Link
              className="text-blue-500 hover:underline dark:text-[#93c5fd] dark:hover:text-white"
              href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/store/details/${row?.store_slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="">{store}</span>
            </Link>
          ),
        };
      }
      if (col.dataIndex === "payment_status") {
        return {
          ...col,
          render: (payment_status: any, row: RecordType) => (
            <div className="flex items-center justify-start gap-2">
              <div className="w-24">
                <span
                  className={` ${
                    payment_status === "paid"
                      ? "border border-green-500 bg-green-50 text-green-500"
                      : payment_status === "pending"
                      ? "border border-yellow-500 bg-yellow-50 text-yellow-500"
                      : "border border-red-500 bg-red-50 text-red-500"
                  } capitalize py-1 px-2 rounded`}
                >
                  {payment_status}
                </span>
              </div>
            </div>
          ),
        };
      }
      if (col.dataIndex === "status") {
        return {
          ...col,
          render: (status: any, row: RecordType) => (
            <div className="flex items-center justify-start gap-2">
              <div className="w-[75px]">
                <Badge
                  className={` ${
                    status == 1
                      ? "bg-green-50 border border-green-500 text-green-500"
                      : status == 0
                      ? "bg-yellow-50 border border-yellow-500 text-yellow-500"
                      : "bg-red-50 border border-red-500 text-red-500"
                  } capitalize`}
                >
                  {`${
                    status == 1
                      ? t("common.active")
                      : status == 0
                      ? t("common.pending")
                      : t("common.cancelled")
                  }`}
                </Badge>
              </div>
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
  }, [sortField, currentPage, itemsPerPage, isPending, refetch, error]);
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
            maxWidth={1750}
          />
          <div className="mt-4 flex justify-between">
            <div>
              <AppSelect
                value={String(itemsPerPage)}
                onSelect={handleSelectItemsPerPage}
                groups={CountItems}
                customClass="w-[80px] h-8"
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

export default SubscriptionStoreListHistory;
