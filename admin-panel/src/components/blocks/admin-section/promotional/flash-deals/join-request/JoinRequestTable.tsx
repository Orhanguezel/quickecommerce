"use client";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import RejectConfirmModal from "@/components/blocks/shared/RejectConfirmModal";
import {
  Button,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import GlobalImageLoader from "@/lib/imageLoader";
import {
  useJoinRequestApproveMutation,
  useJoinRequestQuery,
  useJoinRequestRejectMutation,
} from "@/modules/admin-section/promotional/flash-deals/flash-deals.action";
import { useSellerStoreQuery } from "@/modules/admin-section/seller-store/seller-store.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setDynamicValue, setRefetch } from "@/redux/slices/refetchSlice";
import {
  ChevronsLeftIcon,
  ChevronsRightIcon,
  SquareCheck,
  SquareX,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  serial: string;
  flash_sale: string;
  store: string;
  product_image: string;
  product: string;
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

const JoinRequestTable = ({ searchValue, options }: any) => {
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
  const { JoinRequestData, refetch, isPending } = useJoinRequestQuery({
    limit: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : "name",
    sort: sortField,
    search: searchValue,
  });

  let totalDataLength = (JoinRequestData as any)?.meta?.total;
  const startIndex = (JoinRequestData as any)?.meta?.from;
  const originalData = useMemo(() => {
    const data = (JoinRequestData as any)?.data || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [JoinRequestData, startIndex]);

  const updatePage = (p: any) => {
    setCurrentPage(p);
    setShouldRefetch(true);
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
  const handleApplyReject = (reason: string) => {
    if (selectedAction === "rejected") {
      handleBulkRequestReject(reason);
    }
  };

  const { mutate: JoinRequestApprove, isPending: isApprove } =
    useJoinRequestApproveMutation();

  const handleBulkRequestApprove = () => {
    const Ids = Array.from(selectedRows);

    JoinRequestApprove(
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
  const { mutate: JoinRequestReject, isPending: isReject } =
    useJoinRequestRejectMutation();
  const handleBulkRequestReject = (reason: string) => {
    const Ids = Array.from(selectedRows);
    const payload = { ids: Ids, rejection_reason: reason };
    JoinRequestReject(payload, {
      onSuccess: () => {
        setShouldRefetch(true);
        dispatch(setDynamicValue("store"));
        isStoreRefetch();
        setSelectedAction("");
      },
    });
    setSelectedRows(new Set());
  };

  const [approveSingleRowId, setApproveSingleRowId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const { mutate: ApproveSingleRowId } = useJoinRequestApproveMutation();
  const handleSingleApprove = (id: string) => {
    setApproveSingleRowId(id);
    const Ids = [id];
    setLoading(true);
    ApproveSingleRowId(
      { ids: Ids },
      {
        onSuccess: () => {
          setApproveSingleRowId(null);
          refetch();
          setLoading(false);
        },
        onError: () => {
          setApproveSingleRowId(null);
          setLoading(false);
        },
      }
    );
  };

  const [rejectSingleRowId, setRejectSingleRowId] = useState<string | null>(
    null
  );
  const { mutate: RejectSingleRowId } = useJoinRequestRejectMutation();
  const handleSingleReject = (id: string, reason: string) => {
    setRejectSingleRowId(id);
    const payload = { ids: [id], rejection_reason: reason };
    setLoading(true);
    RejectSingleRowId(payload, {
      onSuccess: () => {
        setRejectSingleRowId(null);
        refetch();
        setLoading(false);
      },
      onError: () => {
        setRejectSingleRowId(null);
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
          width: "5%",
        },
        {
          title: t("table_header.image"),
          dataIndex: "product_image",

          width: "10%",
          render: (row: any) => (
            <div className="flex items-center gap-2">
              <div className="relative w-12 h-12">
                {row?.product_image ? (
                  <Image
                    loader={GlobalImageLoader}
                    src={row?.product_image}
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
          ),
        },
        {
          title: t("table_header.product"),
          dataIndex: "product",
          width: 100,
        },
        {
          title: t("table_header.store"),
          dataIndex: "store",
          width: 100,
        },
        {
          title: t("table_header.flash_sale"),
          dataIndex: "flash_sale",
          width: 100,
        },
        {
          title: t("table_header.actions"),
          dataIndex: "actions",
          width: "10%",
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
      if (col.dataIndex === "actions") {
        return {
          ...col,
          render: (o: any, row: RecordType) => (
            <div className="flex items-center gap-2 ">
              <ConfirmationModal
                trigger={
                  <button disabled={approveSingleRowId === row.id}>
                    <div
                      className={`flex items-center gap-1 text-green-500 bg-green-100 rounded-lg ${
                        approveSingleRowId === row.id
                          ? "p-1 opacity-50"
                          : " p-2 "
                      }`}
                    >
                      {approveSingleRowId === row.id ? (
                        <Loader color="text-green-500" size="sm" />
                      ) : (
                        <SquareCheck
                          width={16}
                          height={16}
                          className="text-green-500"
                        />
                      )}{" "}
                    </div>
                  </button>
                }
                onSave={() => handleSingleApprove(row.id)}
                loading={loading}
                subTitle={t("sub_title.approve_flash_sale")}
              />
              <RejectConfirmModal
                trigger={
                  <button disabled={rejectSingleRowId === row.id}>
                    <div
                      className={`flex items-center gap-1 text-red-500 bg-red-100 rounded-lg ${
                        rejectSingleRowId === row.id
                          ? "p-1 opacity-50"
                          : " p-2 "
                      }`}
                    >
                      {rejectSingleRowId === row.id ? (
                        <Loader color="text-red-500" size="sm" />
                      ) : (
                        <SquareX
                          width={16}
                          height={16}
                          className="text-red-500"
                        />
                      )}{" "}
                    </div>
                  </button>
                }
                onSave={(reason: string) => handleSingleReject(row.id, reason)}
                loading={loading}
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
    if (shouldRefetch || searchValue || sortField) {
      refetch();
      setShouldRefetch(false);
    }
    if (isRefetch) {
      refetch();
      dispatch(setRefetch(false));
    }
  }, [shouldRefetch, isRefetch, dispatch, refetch, searchValue, sortField]);
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
                  <SelectTrigger className="w-[180px] border px-4 py-2 rounded app-input">
                    <SelectValue placeholder="Select Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="approved">
                        {t("label.approved")}
                      </SelectItem>
                      <SelectItem value="rejected">
                        {t("label.rejected")}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {selectedAction !== "rejected" && (
                  <Button
                    variant="outline"
                    className="app-button mx-2 my-2"
                    disabled={
                      selectedRows.size === 0 || selectedAction !== "approved"
                    }
                    onClick={handleApplyAction}
                  >
                    {isApprove ? "Requesting...." : t("button.approve_request")}
                  </Button>
                )}
                {selectedAction !== "approved" && (
                  <RejectConfirmModal
                    trigger={
                      <Button
                        variant="outline"
                        className="app-button mx-2 my-2"
                        disabled={
                          selectedRows.size === 0 ||
                          selectedAction !== "rejected"
                        }
                      >
                        {isApprove
                          ? "Requesting...."
                          : t("button.reject_request")}
                      </Button>
                    }
                    onSave={(reason: string) => handleApplyReject(reason)}
                    loading={loading}
                  />
                )}
              </div>
              <div className="absolute z-50 mt-4 mx-3">
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

export default JoinRequestTable;
