"use client";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import Delete from "@/components/blocks/custom-icons/Delete";
import TableEdit from "@/components/blocks/custom-icons/TableEdit";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import {
  Badge,
  Switch,
  Button,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import { Routes } from "@/config/routes";
import {
  useNoticeDelete,
  useNoticeQuery,
  useNoticeStatusUpdate,
} from "@/modules/admin-section/store-notices/store-notices.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { format } from "date-fns";
import {
  ChevronsLeftIcon,
  ChevronsRightIcon,
  MessageSquareQuote,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import ShowMessageModal from "./modal/ShowMessageModal";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  serial: string;
  title: string;
  priority?: string;
  message?: string;
  expire_date?: string;
  active_date?: string;
  actions?: any;
  selectActions?: any;
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

const StoreNoticesTable = ({ searchValue }: any) => {
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
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectedAction, setSelectedAction] = useState<string>("");
  const sortField = sortedInfo.order == "ascend" ? "asc" : "desc";
  const { Notices, refetch, isPending, error } = useNoticeQuery({
    ...searchValue,
    per_page: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
    sort: sortField,
  });

  let totalDataLength = (Notices as any)?.meta?.total;
  const startIndex = (Notices as any)?.meta?.from;
  const LastPage = (Notices as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (Notices as any)?.data || [];
    return data?.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [Notices, startIndex]);

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

  const { mutate: flashDealsStatus } = useNoticeStatusUpdate();
  const handleToggleStatus = (id: string) => {
    setLoading(true);
    flashDealsStatus(
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
  const [loading, setLoading] = useState(false);
  const { mutate: NoticeDelete, isPending: isRequesting } = useNoticeDelete();

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
      handleBulkDelete();
    }
  };

  const handleBulkDelete = () => {
    const Ids = Array.from(selectedRows);
    NoticeDelete(
      { ids: Ids },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
    setSelectedRows(new Set());
  };

  const handleDelete = (id: string) => {
    setLoading(true);
    const Ids = [id];
    NoticeDelete(
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
          width: "10%",
        },
        {
          title: t("table_header.title"),
          dataIndex: "title",
          width: 200,
        },
        {
          title: "Message",
          dataIndex: "message",
          width: 100,
        },
        {
          title: "Priority",
          dataIndex: "priority",
          width: 100,
        },
        {
          title: "Active Date",
          dataIndex: "active_date",
          width: 150,
        },
        {
          title: "Expire Date",
          dataIndex: "expire_date",
          width: 150,
        },
        {
          title: t("table_header.status"),
          dataIndex: "status",
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
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [editRowId, setEditRowId] = useState<string | null>(null);

    const handleEdit = (e: React.MouseEvent, id: string) => {
      const url = `${Routes.EditNotice}/${id}`;
      if (e.ctrlKey || e.metaKey || e.button === 1) {
        window.open(url, "_blank");
      } else {
        setEditRowId(id);
        router.push(url);
        dispatch(setRefetch(true));
      }
    };

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
      if (col.dataIndex === "message") {
        return {
          ...col,
          render: (_: any, row: RecordType) => (
            <div className="flex items-center justify-start gap-2">
              <ShowMessageModal
                trigger={
                  <div className="cursor-pointer p-1 bg-teal-50 border border-teal-500 text-teal-500 rounded">
                    <span>
                      <MessageSquareQuote width={20} height={20} />
                    </span>
                  </div>
                }
                question={row?.message}
              />
            </div>
          ),
        };
      }
      if (col.dataIndex === "priority") {
        return {
          ...col,
          render: (priority: any, row: RecordType) => (
            <div className="relative flex items-center justify-start gap-2">
              <div className="w-[75px]">
                <span
                  className={`border ${
                    priority === "low"
                      ? "text-red-500 border-red-500 bg-red-50"
                      : priority === "medium"
                      ? "text-yellow-500 border-yellow-500 bg-yellow-50"
                      : "text-green-500 border-green-500 bg-green-50"
                  } capitalize px-2 py-1 rounded`}
                >
                  {priority}
                </span>
              </div>
            </div>
          ),
        };
      }
      if (col.dataIndex === "active_date") {
        return {
          ...col,
          render: (active_date: any, row: RecordType) => (
            <span>
              {active_date && format(active_date, "dd MMMM yyyy hh:mm a")}
            </span>
          ),
        };
      }
      if (col.dataIndex === "expire_date") {
        return {
          ...col,
          render: (expire_date: any, row: RecordType) => (
            <span>
              {expire_date && format(expire_date, "dd MMMM yyyy hh:mm a")}
            </span>
          ),
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
                    status == 1 ? "bg-green-500" : "bg-yellow-500"
                  } capitalize`}
                >
                  {`${status == 1 ? "Active" : "Inactive"}`}
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
                title={t("title.update_status")}
                subTitle={t("sub_title.update_status")}
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
              <TableEdit
                isLoading={editRowId === row.id}
                onClick={(e: React.MouseEvent<Element, MouseEvent>) =>
                  handleEdit(e, row.id)
                }
              />
              <ConfirmationModal
                trigger={<Delete />}
                onSave={() => handleDelete(row.id)}
                loading={loading}
                title="Delete Notice "
                subTitle="Are you sure you want to delete notice ?"
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
            <div className="absolute">
              <div className="mx-2 flex items-center justify-center gap-2">
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
                  <SelectContent className="">
                    <SelectGroup>
                      <SelectItem value="none">{t("common.none")}</SelectItem>
                      <SelectItem value="deleted">
                        {t("common.delete")}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  className="app-button my-2"
                  disabled={
                    selectedRows.size === 0 || selectedAction !== "deleted"
                  }
                  onClick={handleApplyDelete}
                >
                  {isRequesting ? "Delete...." : t("button.delete")}
                </Button>
              </div>
              <div className="absolute z-50 mt-4 mx-5">
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
              maxWidth={1200}
            />{" "}
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

export default StoreNoticesTable;
