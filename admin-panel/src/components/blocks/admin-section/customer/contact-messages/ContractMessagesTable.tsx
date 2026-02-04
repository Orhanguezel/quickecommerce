"use client";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import Delete from "@/components/blocks/custom-icons/Delete";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import {
  Badge,
  Button,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import { format } from "date-fns";

import CustomResolveIcon from "@/components/blocks/custom-icons/CustomResolveIcon";
import CustomReviewIcon from "@/components/blocks/custom-icons/CustomReviewIcon";
import {
  useContractMessagesDeleteMutation,
  useContractMessagesQuery,
  useContractMessagesStatusUpdate,
} from "@/modules/admin-section/customer/contact-messages/contact-messages.action";
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
import ShowReplyModal from "./modal/ShowReplyModal";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  serial: string;
  message: string;
  name: string;
  phone: string;
  email: string;
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

const ContractMessagesTable = ({ searchValue }: any) => {
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
  const { ContractMessagesData, refetch, isPending, error } =
    useContractMessagesQuery({
      ...searchValue,
      per_page: itemsPerPage,
      language: locale,
      page: currentPage,
      sortField: sortedInfo.columnKey == "" ? "id" : "name",
      sort: sortField,
    });

  let totalDataLength = (ContractMessagesData as any)?.meta?.total;
  const startIndex = (ContractMessagesData as any)?.meta?.from;
  const LastPage = (ContractMessagesData as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (ContractMessagesData as any)?.data || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [ContractMessagesData, startIndex]);

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
    if (selectedAction === "2") {
      handleBulkRequestReject();
    }
  };

  const handleApplyDelete = () => {
    if (selectedAction === "deleted") {
      handleBulkRequestDelete();
    }
  };

  const { mutate: ReviewsApprove, isPending: isApprove } =
    useContractMessagesStatusUpdate();

  const handleBulkRequestApprove = () => {
    const Ids = Array.from(selectedRows);

    ReviewsApprove(
      { ids: Ids, status: "1" },
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
  const { mutate: ReviewsReject, isPending: isReject } =
    useContractMessagesStatusUpdate();
  const handleBulkRequestReject = () => {
    const Ids = Array.from(selectedRows);
    ReviewsReject(
      { ids: Ids, status: "2" },
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

  const { mutate: ContactMessageDelete, isPending: isDelete } =
    useContractMessagesDeleteMutation();
  const handleBulkRequestDelete = () => {
    const Ids = Array.from(selectedRows);
    ContactMessageDelete(
      { ids: Ids },
      {
        onSuccess: () => {
          refetch();
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
  const { mutate: ApproveSingleRowId } = useContractMessagesStatusUpdate();
  const handleSingleApprove = (id: string) => {
    const Ids = [id];
    setLoading(true);
    ApproveSingleRowId(
      { ids: Ids, status: "1" },
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

  const { mutate: RejectSingleRowId } = useContractMessagesStatusUpdate();
  const handleSingleReject = (id: string) => {
    const Ids = [id];
    setLoading(true);
    RejectSingleRowId(
      { ids: Ids, status: "2" },
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

  const { mutate: DeleteSingleRowId } = useContractMessagesDeleteMutation();
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
          width: "7%",
        },
        {
          title: t("table_header.name"),
          dataIndex: "name",
          width: 150,
        },

        {
          title: t("table_header.phone"),
          dataIndex: "phone",
          width: 100,
        },
        {
          title: t("table_header.email"),
          dataIndex: "email",
          width: 100,
        },
        {
          title: t("table_header.reply"),
          dataIndex: "reply",
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
          width: "15%",
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
                  <div className="p-2 cursor-pointer bg-teal-50 border border-teal-500 text-teal-500 rounded">
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
      if (col.dataIndex === "status") {
        return {
          ...col,
          render: (status: any, row: RecordType) => (
            <div className="flex items-center justify-start gap-2">
              <div>
                <Badge
                  className={` ${
                    status == "1"
                      ? "bg-green-50 border border-green-500 text-green-500"
                      : status == "2"
                      ? "bg-yellow-50 border border-yellow-500 text-yellow-500"
                      : "bg-blue-50 border border-blue-500 text-blue-500"
                  } capitalize`}
                >
                  {`${
                    status == "1"
                      ? t("common.reviewed")
                      : status == "2"
                      ? t("common.resolved")
                      : t("common.new")
                  }`}
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
                  trigger={<CustomReviewIcon disabled={row?.status == "1"} />}
                  onSave={() => handleSingleApprove(row.id)}
                  loading={loading}
                  title={t("title.message_review")}
                  subTitle={t("sub_title.message_review")}
                />

                <ConfirmationModal
                  trigger={<CustomResolveIcon disabled={row?.status == "2"} />}
                  onSave={() => handleSingleReject(row.id)}
                  loading={loading}
                  title={t("title.message_resolve")}
                  subTitle={t("sub_title.message_resolve")}
                />
              </>
              <ConfirmationModal
                trigger={<Delete />}
                onSave={() => handleSingleDelete(row.id)}
                loading={loading}
                title={t("title.message_delete")}
                subTitle={t("sub_title.message_delete")}
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
          <div className="relative">
            <div className="relative md:absolute mt-4 md:mt-0 shadow-custom md:shadow-none p-2 md:p-0 bg-white md:bg-transparent rounded">
              <div className="mx-0 md:mx-2 flex flex-col md:flex-row items-start md:items-center justify-start md:justify-center gap-2">
                <Select
                  key={selectedAction}
                  onValueChange={setSelectedAction}
                  value={selectedAction}
                >
                  <SelectTrigger className="w-full md:w-[180px] border px-4 py-2 rounded app-input">
                    <SelectValue
                      placeholder={t("place_holder.select_action")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="none">{t("common.none")}</SelectItem>
                      <SelectItem value="1">{t("common.reviewed")}</SelectItem>
                      <SelectItem value="2">{t("common.resolved")}</SelectItem>
                      <SelectItem value="deleted">
                        {t("common.delete")}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 w-full">
                  <Button
                    variant="outline"
                    className="app-button my-2"
                    disabled={selectedRows.size === 0 || selectedAction !== "1"}
                    onClick={handleApplyAction}
                  >
                    {isApprove ? "Reviewing...." : "Review"}
                  </Button>
                  <Button
                    variant="outline"
                    className="app-button my-2"
                    disabled={selectedRows.size === 0 || selectedAction !== "2"}
                    onClick={handleApplyReject}
                  >
                    {isReject ? "Resolving...." : "Resolve"}
                  </Button>
                  <Button
                    variant="outline"
                    className="app-delete-button my-2"
                    onClick={handleApplyDelete}
                    disabled={
                      selectedRows.size === 0 || selectedAction !== "deleted"
                    }
                  >
                    {isDelete ? "Deleting...." : "Delete"}
                  </Button>
                </div>
              </div>
              <div className="absolute z-50 mt-[90px] md:mt-4 mx-3 md:mx-5">
                <input
                  type="checkbox"
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  checked={
                    selectedRows.size === originalData.length &&
                    originalData.length > 0
                  }
                />
              </div>
            </div>
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

export default ContractMessagesTable;
