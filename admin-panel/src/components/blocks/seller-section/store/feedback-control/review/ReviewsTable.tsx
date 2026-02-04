"use client";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import { Badge } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import ReviewIcon from "@/assets/icons/ReviewIcon";
import { useReviewsQuery } from "@/modules/seller-section/feedback-control/reviews/reviews.action";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  serial: string;
  reviewed: string;
  store: string;
  slug: string;
  store_slug: string;
  reviewer: string;
  review: string;
  rating: string;
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

const ReviewsTable = ({
  searchFilters,
  selectReviewableType,
  selectStoreID,
  searchRating,
}: any) => {
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
  const { ReviewsData, refetch, isPending, error } = useReviewsQuery({
    ...searchFilters,
    per_page: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : "name",
    sort: sortField,
    store_id: selectStoreID,
    rating: searchRating,
  });

  let totalDataLength = (ReviewsData as any)?.meta?.total;
  const startIndex = (ReviewsData as any)?.meta?.from;
  const LastPage = (ReviewsData as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (ReviewsData as any)?.data || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [ReviewsData, startIndex]);

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
          title: t("table_header.sl"),
          dataIndex: "serial",
          fixed: fixLeft ? "left" : undefined,
          width: "5%",
        },
        {
          title: t("table_header.review"),
          dataIndex: "review",
          width: 150,
        },
        {
          title: t("table_header.rating"),
          dataIndex: "rating",
          width: 100,
        },
        {
          title: t("table_header.reviewer"),
          dataIndex: "reviewer",
          width: 100,
        },
        {
          title: t("table_header.reviewed"),
          dataIndex: "reviewed",
          width: 100,
        },
        {
          title: t("table_header.status"),
          dataIndex: "status",
          width: 100,
          fixed: !isMobile && fixRight ? "right" : undefined,
        },
      ],
      [fixLeft, fixRight, isMobile]
    );
    const renderColumns = columns.map((col) => {
      if (col.dataIndex === "reviewed") {
        return {
          ...col,
          render: (reviewed: any, row: RecordType) => (
            <Link
              className="text-blue-500 hover:underline dark:text-[#93c5fd] dark:hover:text-white"
              href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/product-details/${row?.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="">{reviewed}</span>
            </Link>
          ),
        };
      }
      if (col.dataIndex === "rating") {
        return {
          ...col,
          render: (rating: any, row: RecordType) => {
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 !== 0;
            const totalStars = 5;
            return (
              <div className="flex items-center justify-start gap-2">
                <div className="flex items-center text-amber-500 gap-1">
                  {[...Array(totalStars)].map((_, index) => {
                    let fillPercentage = 0;
                    if (index < fullStars) {
                      fillPercentage = 100; // Full star
                    } else if (index === fullStars && hasHalfStar) {
                      fillPercentage = 50; // Half star
                    }
                    return (
                      <ReviewIcon key={index} fillPercentage={fillPercentage} />
                    );
                  })}
                </div>
              </div>
            );
          },
        };
      }
      if (col.dataIndex === "status") {
        return {
          ...col,
          render: (status: any, row: RecordType) => (
            <div className="flex items-center justify-start gap-2">
              <div className="flex items-center gap-2">
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
    searchFilters,
    sortField,
    itemsPerPage,
    currentPage,
    selectReviewableType,
    selectStoreID,
    searchRating,
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

export default ReviewsTable;
