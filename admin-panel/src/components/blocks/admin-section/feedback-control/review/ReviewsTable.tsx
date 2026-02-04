"use client";
import ReviewIcon from "@/assets/icons/ReviewIcon";
import { AppSelect } from "@/components/blocks/common";
import CustomApproveIcon from "@/components/blocks/custom-icons/CustomApproveIcon";
import CustomReviewRejectIcon from "@/components/blocks/custom-icons/CustomReviewRejectIcon";
import Delete from "@/components/blocks/custom-icons/Delete";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { Badge } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import {
  useReviewsApproveMutation,
  useReviewsDeleteMutation,
  useReviewsQuery,
  useReviewsRejectMutation,
} from "@/modules/admin-section/feedback-control/reviews/reviews.action";
import { BulkActionBar } from "@/components/blocks/shared";
import { useSellerStoreQuery } from "@/modules/admin-section/seller-store/seller-store.action";
import { useAppDispatch } from "@/redux/hooks";
import { setDynamicValue } from "@/redux/slices/refetchSlice";
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
  reviewable_type: string;
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
  searchValue,
  selectReviewableType,
  selectStoreID,
}: any) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const locale = useLocale();
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
  const sortField = sortedInfo.order == "ascend" ? "asc" : "desc";
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectedAction, setSelectedAction] = useState<string>("");
  const { refetch: isStoreRefetch } = useSellerStoreQuery({});
  const { ReviewsData, refetch, isPending, error } = useReviewsQuery({
    ...searchValue,
    per_page: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : "name",
    sort: sortField,
    reviewable_type: selectReviewableType,
    store_id: selectStoreID,
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
  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedRows(new Set(originalData.map((row: any) => row.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleRowSelection = (rowId: string) => {
    setSelectedRows((prev) => {
      const updated = new Set(prev);
      if (updated.has(rowId)) {
        updated.delete(rowId);
      } else {
        updated.add(rowId);
      }
      return updated;
    });
  };
  const handleApplyAction = () => {
    if (selectedAction === "approved") {
      handleBulkRequestApprove();
    }
  };
  const handleApplyReject = () => {
    if (selectedAction === "rejected") {
      handleBulkRequestReject();
    }
  };
  const handleApplyDelete = () => {
    if (selectedAction === "deleted") {
      handleBulkRequestDelete();
    }
  };

  const { mutate: ReviewsApprove, isPending: isApprove } =
    useReviewsApproveMutation();

  const handleBulkRequestApprove = () => {
    const Ids = Array.from(selectedRows);

    ReviewsApprove(
      { ids: Ids },
      {
        onSuccess: () => {
          setShouldRefetch(true);
          dispatch(setDynamicValue("store"));
          isStoreRefetch();
          setSelectedAction("");
          refetch();
        },
      }
    );
    setSelectedRows(new Set());
  };
  const { mutate: ReviewsReject, isPending: isReject } =
    useReviewsRejectMutation();
  const handleBulkRequestReject = () => {
    const Ids = Array.from(selectedRows);
    ReviewsReject(
      { ids: Ids },
      {
        onSuccess: () => {
          setShouldRefetch(true);
          dispatch(setDynamicValue("store"));
          isStoreRefetch();
          setSelectedAction("");
          refetch();
        },
      }
    );
    setSelectedRows(new Set());
  };
  const { mutate: ReviewsDelete, isPending: isDelete } =
    useReviewsDeleteMutation();
  const handleBulkRequestDelete = () => {
    const Ids = Array.from(selectedRows);
    ReviewsDelete(
      { ids: Ids },
      {
        onSuccess: () => {
          setShouldRefetch(true);
          dispatch(setDynamicValue("store"));
          isStoreRefetch();
          setSelectedAction("");
          refetch();
        },
      }
    );
    setSelectedRows(new Set());
  };

  const [loading, setLoading] = useState(false);
  const { mutate: ApproveSingleRowId } = useReviewsApproveMutation();
  const handleSingleApprove = (id: string) => {
    const Ids = [id];
    setLoading(true);
    ApproveSingleRowId(
      { ids: Ids },
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

  const { mutate: RejectSingleRowId } = useReviewsRejectMutation();
  const handleSingleReject = (id: string) => {
    const Ids = [id];
    setLoading(true);
    RejectSingleRowId(
      { ids: Ids },
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

  const { mutate: DeleteSingleRowId } = useReviewsDeleteMutation();
  const handleSingleDelete = (id: string) => {
    const Ids = [id];
    setLoading(true);
    DeleteSingleRowId(
      { ids: Ids },
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
          width: "5%",
          fixed: fixLeft ? "left" : undefined,
        },
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
          title: t("table_header.store"),
          dataIndex: "store",
          width: 100,
        },
        {
          title: t("table_header.status"),
          dataIndex: "status",
          width: 100,
        },
        {
          title: t("table_header.actions"),
          dataIndex: "actions",
          width: "12%",
          fixed: !isMobile && fixRight ? "right" : undefined,
        },
      ],
      [fixLeft, fixRight, isMobile]
    );
    const renderColumns = columns.map((col) => {
      if (col.dataIndex === "selectActions") {
        return {
          ...col,
          render: (o: any, row: RecordType) => (
            <div className="flex items-center gap-2 ">
              <input
                type="checkbox"
                onChange={() => handleRowSelection(row.id)}
                checked={selectedRows.has(row.id)}
              />
            </div>
          ),
        };
      }
      if (col.dataIndex === "reviewed") {
        return {
          ...col,
          render: (reviewed: any, row: RecordType) => (
            <>
              {row?.reviewable_type == "Deliveryman" ? (
                <span className="capitalize">{reviewed}</span>
              ) : (
                <Link
                  className="text-blue-500 hover:underline dark:text-[#93c5fd] dark:hover:text-white"
                  href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/product-details/${row?.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="capitalize">{reviewed}</span>
                </Link>
              )}
            </>
          ),
        };
      }
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
      if (col.dataIndex === "actions") {
        return {
          ...col,
          render: (o: any, row: RecordType) => (
            <div className="flex items-center gap-2 ">
              <>
                <ConfirmationModal
                  trigger={
                    <CustomApproveIcon disabled={row?.status !== "pending"} />
                  }
                  onSave={() => handleSingleApprove(row.id)}
                  loading={loading}
                  title={t("title.approve_review")}
                  subTitle={t("sub_title.approve_review")}
                />
                <ConfirmationModal
                  trigger={
                    <CustomReviewRejectIcon
                      disabled={row?.status !== "pending"}
                    />
                  }
                  onSave={() => handleSingleReject(row.id)}
                  loading={loading}
                  title={t("title.reject_review")}
                  subTitle={t("sub_title.reject_review")}
                />
              </>

              <ConfirmationModal
                trigger={<Delete />}
                onSave={() => handleSingleDelete(row.id)}
                loading={loading}
                title={t("title.delete_review")}
                subTitle={t("sub_title.delete_review")}
              />
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
    searchValue,
    sortField,
    selectReviewableType,
    selectStoreID,
    currentPage,
    isPending,
    refetch,
    error,
  ]);

  const actions = [
    {
      value: "approved",
      label: t("common.approve"),
      onClick: handleApplyAction,
    },
    {
      value: "rejected",
      label: t("common.reject"),
      onClick: handleApplyReject,
    },
    {
      value: "deleted",
      label: t("common.delete"),
      onClick: handleApplyDelete,
    },
  ];

  return (
    <>
      {isPending ? (
        <TableSkeletonLoader />
      ) : (
        <>
          <div className="relative">
            <BulkActionBar
              selectedAction={selectedAction}
              setSelectedAction={setSelectedAction}
              selectedRows={selectedRows}
              originalDataLength={originalData.length}
              handleSelectAll={handleSelectAll}
              isRequesting={isApprove || isReject || isDelete}
              actions={actions}
            />

            <RCTable
              originData={originalData}
              useColumn={useColumn}
              sortedInfo={sortedInfo}
              handleSort={handleSort}
              maxWidth={1200}
            />
          </div>
          <div className="mt-3 flex flex-col md:flex-row justify-between">
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

export default ReviewsTable;
