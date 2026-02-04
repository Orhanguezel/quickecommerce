"use client";
import { AppSelect } from "@/components/blocks/common";
import Delete from "@/components/blocks/custom-icons/Delete";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { Badge, Switch } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import {
  useQuestionsDeleteMutation,
  useQuestionsQuery,
  useQuestionsStatusUpdate,
} from "@/modules/admin-section/feedback-control/questions/questions.action";
import { format } from "date-fns";

import CustomReplyIcon from "@/components/blocks/custom-icons/CustomReplyIcon";
import { BulkActionBar } from "@/components/blocks/shared";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";
import GlobalImageLoader from "@/lib/imageLoader";
import { useSellerStoreQuery } from "@/modules/admin-section/seller-store/seller-store.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setDynamicValue, setRefetch } from "@/redux/slices/refetchSlice";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import ShowReplyModal from "./modal/ShowReplyModal";

interface RecordType {
  id: string;
  serial: string;
  customer: string;
  product: string;
  slug: string;
  store_slug: string;
  product_image_url: string;
  question: string;
  reply: string;
  replied_at: string;
  store: string;
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

const QuestionsTable = ({ searchValue, selectStatus, selectReplied }: any) => {
  const t = useTranslations();
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
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
  const { QuestionsData, refetch, isPending } = useQuestionsQuery({
    ...searchValue,
    per_page: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : "name",
    sort: sortField,
    status: selectStatus,
    reply_status: selectReplied,
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

  const handleApplyDelete = () => {
    if (selectedAction === "deleted") {
      handleBulkRequestDelete();
    }
  };
  const { mutate: ReviewsDelete, isPending: isDelete } =
    useQuestionsDeleteMutation();
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
        },
      }
    );
    setSelectedRows(new Set());
  };

  const [loading, setLoading] = useState(false);
  const { mutate: DeleteSingleRowId } = useQuestionsDeleteMutation();
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

  const { mutate: QuestionsStatus } = useQuestionsStatusUpdate();
  const handleToggleStatus = (id: string) => {
    setLoading(true);
    QuestionsStatus(
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
          width: 150,
        },
        {
          title: t("table_header.store"),
          dataIndex: "store",
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
        },
        {
          title: t("table_header.actions"),
          dataIndex: "actions",
          width: "8%",
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
      if (col.dataIndex === "product") {
        return {
          ...col,
          render: (product: any, row: RecordType) => (
            <div className="flex items-center gap-1">
              <div className="relative w-12 h-12">
                <div>
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
              </div>
              <div>
                <Link
                  className="text-blue-500 hover:underline dark:text-[#93c5fd] dark:hover:text-white"
                  href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/productDetails/${row?.slug}`}
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
                question={row?.question}
                reply={row?.reply}
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

              <ConfirmationModal
                trigger={
                  <div dir="ltr">
                    <Switch checked={status == 1} />
                  </div>
                }
                loading={loading}
                onSave={() => handleToggleStatus(row.id)}
                title={`${status == 0 ? "Show" : "Hide"} Questions`}
                subTitle={`Are you sure you want to ${
                  status == 0 ? "Show" : "Hide"
                } Questions?`}
              />
            </div>
          ),
        };
      }
      if (col.dataIndex === "actions") {
        return {
          ...col,
          render: (o: any, row: RecordType) => (
            <div className="flex items-center gap-2 ">
              <ConfirmationModal
                trigger={<Delete />}
                onSave={() => handleSingleDelete(row.id)}
                loading={loading}
                title="Delete Question!"
                subTitle="Are you sure you want to delete Question?"
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
    refetch();
    dispatch(setRefetch(false));
    if (Number(currentPage) > Number(LastPage)) {
      setCurrentPage(LastPage);
    } else {
      setCurrentPage(currentPage);
    }
  }, [
    shouldRefetch,
    isRefetch,
    dispatch,
    refetch,
    searchValue,
    sortField,
    selectStatus,
    selectReplied,
    currentPage,
    LastPage,
  ]);

  const actions = [
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
              isRequesting={isDelete}
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

export default QuestionsTable;
