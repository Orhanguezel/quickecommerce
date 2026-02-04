"use client";
import { AppSelect } from "@/components/blocks/common";
import Delete from "@/components/blocks/custom-icons/Delete";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { Badge } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import { format } from "date-fns";

import CustomSubscribeIcon from "@/components/blocks/custom-icons/CustomSubscribeIcon";
import { BulkActionBar } from "@/components/blocks/shared";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";
import {
  useSubscriberListDeleteMutation,
  useSubscriberListQuery,
  useSubscriberListStatusUpdate,
} from "@/modules/admin-section/customer/subscriber-list/subscriber-list.action";
import { useSellerStoreQuery } from "@/modules/admin-section/seller-store/seller-store.action";
import { useAppDispatch } from "@/redux/hooks";
import { setDynamicValue } from "@/redux/slices/refetchSlice";
import {
  ChevronsLeftIcon,
  ChevronsRightIcon,
  MessageSquareQuote,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";
import ShowReplyModal from "../contact-messages/modal/ShowReplyModal";

interface RecordType {
  id: string;
  serial: string;
  message: string;
  unsubscribed_at: string;
  phone: string;
  email: string;
  reply: string;
  replied_at: string;
  seller: string;
  is_subscribed: any;
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

const SubscriberListTable = () => {
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
  const [selectedAction, setSelectedAction] = useState<any>("");
  const { refetch: isStoreRefetch } = useSellerStoreQuery({});
  const { SubscriberListData, refetch, isPending, error } =
    useSubscriberListQuery({
      per_page: itemsPerPage,
      language: locale,
      page: currentPage,
      sortField: sortedInfo.columnKey == "" ? "id" : "name",
      sort: sortField,
    });

  let totalDataLength = (SubscriberListData as any)?.meta?.total;
  const startIndex = (SubscriberListData as any)?.meta?.from;
  const LastPage = (SubscriberListData as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (SubscriberListData as any)?.data || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [SubscriberListData, startIndex]);

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
    if (selectedAction === "1") {
      handleBulkRequestApprove();
    }
  };
  const handleApplyReject = () => {
    if (selectedAction === "0") {
      handleBulkRequestReject();
    }
  };

  const { mutate: ReviewsApprove, isPending: isApprove } =
    useSubscriberListStatusUpdate();

  const handleBulkRequestApprove = () => {
    const Ids = Array.from(selectedRows);

    ReviewsApprove(
      { ids: Ids, status: 1 },
      {
        onSuccess: () => {
          setShouldRefetch(true);
          dispatch(setDynamicValue("store"));
          isStoreRefetch();
          refetch();
          setSelectedAction("");
        },
      }
    );
    setSelectedRows(new Set());
  };
  const { mutate: ReviewsReject, isPending: isReject } =
    useSubscriberListStatusUpdate();
  const handleBulkRequestReject = () => {
    const Ids = Array.from(selectedRows);
    ReviewsReject(
      { ids: Ids, status: 0 },
      {
        onSuccess: () => {
          setShouldRefetch(true);
          dispatch(setDynamicValue("store"));
          isStoreRefetch();
          refetch();
          setSelectedAction("");
        },
      }
    );
    setSelectedRows(new Set());
  };

  const [loading, setLoading] = useState(false);
  const { mutate: ApproveSingleRowId } = useSubscriberListStatusUpdate();
  const handleSingleApprove = (row: any) => {
    const { id, is_subscribed } = row;
    const Ids = [id];
    setLoading(true);
    ApproveSingleRowId(
      { ids: Ids, status: is_subscribed == 1 ? 0 : 1 },
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

  const { mutate: DeleteSingleRowId } = useSubscriberListDeleteMutation();
  const handleSingleDelete = (id: string) => {
    const Ids = [id];
    setLoading(true);
    DeleteSingleRowId(id, {
      onSuccess: () => {
        refetch();
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      },
    });
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
          width: "7%",
        },
        {
          title: t("table_header.email"),
          dataIndex: "email",
          width: 100,
        },
        {
          title: t("table_header.unsubscribed_at"),
          dataIndex: "unsubscribed_at",
          width: 100,
        },
        {
          title: t("table_header.status"),
          dataIndex: "is_subscribed",
          width: "15%",
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
                trigger={
                  <div className="p-4 bg-teal-50 border border-teal-500 text-teal-500 rounded">
                    <span>
                      <MessageSquareQuote width={20} height={20} />
                    </span>
                  </div>
                }
                refetch={refetch}
                row={row}
              />
            </div>
          ),
        };
      }
      if (col.dataIndex === "is_subscribed") {
        return {
          ...col,
          render: (is_subscribed: any, row: RecordType) => (
            <div className="flex items-center justify-start gap-2">
              <div>
                <Badge
                  className={` ${
                    is_subscribed == 1
                      ? "bg-green-50 border border-green-500 text-green-500"
                      : "bg-gray-50 border border-gray-500 text-gray-500"
                  } capitalize`}
                >
                  {`${is_subscribed == 1 ? "Subscribed" : "Unsubscribed"}`}
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
                    <CustomSubscribeIcon is_subscribed={row.is_subscribed} />
                  }
                  onSave={() => handleSingleApprove(row)}
                  loading={loading}
                  title={`${
                    row.is_subscribed == 1 ? "Unsubscribe" : "Subscribe"
                  }`}
                  subTitle={`Are you sure you want to ${
                    row.is_subscribed == 1 ? "Unsubscribe" : "Subscribe"
                  }?`}
                />
              </>
              <ConfirmationModal
                trigger={<Delete />}
                onSave={() => handleSingleDelete(row.id)}
                loading={loading}
                title={t("title.delete_subscriber")}
                subTitle={t("sub_title.delete_subscriber")}
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
    sortField,
    itemsPerPage,
    currentPage,
    LastPage,
    isPending,
    refetch,
    error,
  ]);

  const actions = [
    {
      value: "1",
      label: "Subscribe",
      onClick: handleApplyAction,
    },
    {
      value: "0",
      label: "Unsubscribe",
      onClick: handleApplyReject,
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
              isRequesting={isApprove || isReject}
              actions={actions}
            />
            <RCTable
              originData={originalData}
              useColumn={useColumn}
              sortedInfo={sortedInfo}
              handleSort={handleSort}
              maxWidth={1000}
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

export default SubscriberListTable;
