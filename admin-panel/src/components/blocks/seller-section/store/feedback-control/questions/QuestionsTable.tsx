"use client";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import { Badge } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import { format } from "date-fns";

import CustomReplyIcon from "@/components/blocks/custom-icons/CustomReplyIcon";
import GlobalImageLoader from "@/lib/imageLoader";
import { useQuestionsQuery } from "@/modules/seller-section/feedback-control/questions/questions.action";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import ShowReplyModal from "./modal/ShowReplyModal";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  serial: string;
  customer: string;
  product: string;
  slug: string;
  product_image_url: string;
  question: string;
  reply: string;
  replied_at: string;
  seller: string;
  status: string;
  selectActions?: any;
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

const QuestionsTable = ({ selectReplied, selectDateFilter }: any) => {
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
  const { QuestionsData, refetch, isPending, error } = useQuestionsQuery({
    per_page: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : "name",
    sort: sortField,
    reply_status: selectReplied,
    date_filter: selectDateFilter,
  });

  let totalDataLength = (QuestionsData as any)?.meta?.total;
  const startIndex = (QuestionsData as any)?.meta?.from;
  const LastPage = (QuestionsData as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (QuestionsData as any)?.data || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [QuestionsData, startIndex]);

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
          title: "",
          dataIndex: "selectActions",
          width: "3%",
          fixed: fixLeft ? "left" : undefined,
        },
        {
          title: t("table_header.sl"),
          dataIndex: "serial",
          fixed: fixLeft ? "left" : undefined,
          width: "5%",
        },
        {
          title: t("table_header.question"),
          dataIndex: "question",
          width: 150,
        },
        {
          title: t("table_header.customer"),
          dataIndex: "customer",
          width: 80,
        },
        {
          title: t("table_header.product"),
          dataIndex: "product",
          width: 100,
        },
        {
          title: t("table_header.reply"),
          dataIndex: "reply",
          width: 50,
        },
        {
          title: t("table_header.replied_at"),
          dataIndex: "replied_at",
          width: 100,
        },
        {
          title: t("table_header.status"),
          dataIndex: "status",
          width: "12%",
          fixed: !isMobile && fixRight ? "right" : undefined,
        },
      ],
      [fixLeft, fixRight, isMobile]
    );
    const renderColumns = columns.map((col) => {
      if (col.dataIndex === "product") {
        return {
          ...col,
          render: (product: any, row: RecordType) => (
            <div className="flex items-center gap-2">
              <div className="relative w-12 h-12">
                {row?.product_image_url ? (
                  <Image
                    loader={GlobalImageLoader}
                    src={row?.product_image_url}
                    alt="Brand Logo"
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
                <Link
                  className="text-blue-500 hover:underline dark:text-[#93c5fd] dark:hover:text-white"
                  href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/product-details/${row?.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <p className="">{product}</p>
                </Link>
              </div>
            </div>
          ),
        };
      }
      if (col.dataIndex === "replied_at") {
        return {
          ...col,
          render: (replied_at: any, row: RecordType) => (
            <span>
              {replied_at && format(replied_at, "dd MMMM yyyy hh:mm a")}
            </span>
          ),
        };
      }
      if (col.dataIndex === "reply") {
        return {
          ...col,
          render: (_: any, row: RecordType) => (
            <div className="flex items-center justify-start gap-2">
              <ShowReplyModal
                trigger={<CustomReplyIcon />}
                refetch={refetch}
                row={row}
              />
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
                      : "bg-gray-50 border border-gray-500 text-gray-500"
                  } capitalize`}
                >
                  {`${status == 1 ? "Show" : "Hide"}`}
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
  }, [
    sortField,
    selectReplied,
    selectDateFilter,
    currentPage,
    itemsPerPage,
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
          <div className="relative">
            <RCTable
              originData={originalData}
              useColumn={useColumn}
              sortedInfo={sortedInfo}
              handleSort={handleSort}
              maxWidth={1200}
            />
          </div>
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

export default QuestionsTable;
