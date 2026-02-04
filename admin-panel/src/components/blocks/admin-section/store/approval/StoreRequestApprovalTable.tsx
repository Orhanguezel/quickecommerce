"use client";
import { AppSelect } from "@/components/blocks/common";
import { CustomViewIcon } from "@/components/blocks/custom-icons";
import CustomApproveIcon from "@/components/blocks/custom-icons/CustomApproveIcon";
import CustomReviewRejectIcon from "@/components/blocks/custom-icons/CustomReviewRejectIcon";
import TableEdit from "@/components/blocks/custom-icons/TableEdit";
import { BulkActionBar } from "@/components/blocks/shared";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";
import { CountItems } from "@/config/helperJson";
import { Routes } from "@/config/routes";
import GlobalImageLoader from "@/lib/imageLoader";
import {
  useStoreRequestApprovalQuery,
  useStoreRequestApproveMutation,
} from "@/modules/admin-section/approval/approval.action";
import { useAppDispatch } from "@/redux/hooks/index";
import { setDynamicValue, setRefetch } from "@/redux/slices/refetchSlice";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

interface RecordType {
  id: string;
  slug: string;
  serial: string;
  name: string;
  logo?: string;
  logo_url?: string;
  banner?: string;
  banner_url?: string;
  meta_description?: string;
  selectActions?: any;
  info?: any;
  meta_title?: string;
  phone?: string;
  address?: string;
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

const StoreRequestApprovalTable = ({ searchValue }: any) => {
  const t = useTranslations();
  const locale = useLocale();
  const [shouldRefetch, setShouldRefetch] = useState(false);
  const dispatch = useAppDispatch();
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
  const { StoreRequestApprovalData, refetch, isPending, error } =
    useStoreRequestApprovalQuery({
      per_page: itemsPerPage,
      language: locale,
      page: currentPage,
      sortField: sortedInfo.columnKey == "" ? "id" : "name",
      sort: sortField,
      search: searchValue,
    });
  let totalDataLength = (StoreRequestApprovalData as any)?.meta?.total;
  const startIndex = (StoreRequestApprovalData as any)?.meta?.from;
  const LastPage = (StoreRequestApprovalData as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (StoreRequestApprovalData as any)?.data || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [StoreRequestApprovalData, startIndex]);

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
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectedAction, setSelectedAction] = useState<string>("");

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

  const { mutate: StoreRequestApprove, isPending: isRequesting } =
    useStoreRequestApproveMutation();
  const handleBulkRequestApprove = () => {
    const Ids = Array.from(selectedRows);

    StoreRequestApprove(
      { ids: Ids, status: 1 },
      {
        onSuccess: () => {
          setShouldRefetch(true);
          dispatch(setDynamicValue("store"));
          refetch();
        },
      }
    );
    setSelectedRows(new Set());
  };
  const { mutate: StoreRequestReject, isPending: isRejecting } =
    useStoreRequestApproveMutation();
  const handleBulkRequestReject = () => {
    const Ids = Array.from(selectedRows);

    StoreRequestReject(
      { ids: Ids, status: 3 },
      {
        onSuccess: () => {
          setShouldRefetch(true);
          dispatch(setDynamicValue("store"));
          refetch();
        },
      }
    );
    setSelectedRows(new Set());
  };

  const { mutate: ApproveSingleRowId } = useStoreRequestApproveMutation();
  const handleSingleApprove = (id: string) => {
    const Ids = [id];
    setLoading(true);
    ApproveSingleRowId(
      { ids: Ids, status: 1 },
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
  const { mutate: RejectSingleRowId } = useStoreRequestApproveMutation();
  const handleSingleReject = (id: string) => {
    const Ids = [id];
    setLoading(true);
    RejectSingleRowId(
      { ids: Ids, status: 3 },
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
          title: t("table_header.info"),
          width: 200,
          dataIndex: "info",
          render: (_:any , row: any) => (
            <div className="flex items-center gap-2">
              <div>
                {row?.logo_url ? (
                  <Image
                    loader={GlobalImageLoader}
                    src={row?.logo_url}
                    alt="Brand Logo"
                    width={50}
                    height={50}
                  />
                ) : (
                  <Image
                    src="/images/no-image.png"
                    alt="No Image"
                    width={50}
                    height={50}
                  />
                )}
              </div>
              <div>
                <p className="text-blue-500 text-lg font-semibold">
                  {row?.name}
                </p>
                <p className="capitalize">{row?.store_type}</p>
              </div>
            </div>
          ),
        },
        {
          title: t("table_header.phone"),
          dataIndex: "phone",
          width: 100,
        },
        {
          title: t("table_header.address"),
          dataIndex: "address",
          width: 150,
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
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [editRowId, setEditRowId] = useState<string | null>(null);
    const handleEdit = (Id: string) => {
      setEditRowId(Id);
      router.push(`${Routes.editStore}/${Id}`);
      dispatch(setRefetch(true));
    };
    const [viewRowId, setViewRowId] = useState<string | null>(null);
    const handleView = (Id: string) => {
      setViewRowId(Id);
      router.push(`${Routes.viewStore}/${Id}`);
      dispatch(setRefetch(true));
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
      if (col.dataIndex === "actions") {
        return {
          ...col,
          render: (o: any, row: RecordType) => (
            <div className="flex items-center gap-2 ">
              <CustomViewIcon
                isLoading={viewRowId === row.id}
                onClick={() => handleView(row.id)}
              />

              <TableEdit
                isLoading={editRowId === row.id}
                onClick={() => handleEdit(row.id)}
              />
              <ConfirmationModal
                trigger={<CustomApproveIcon />}
                onSave={() => handleSingleApprove(row.id)}
                loading={loading}
                title="Approve Store Request"
                subTitle="Are you sure you want to approve store request ?"
              />
              <ConfirmationModal
                trigger={<CustomReviewRejectIcon />}
                onSave={() => handleSingleReject(row.id)}
                loading={loading}
                title="Reject Store Request"
                subTitle="Are you sure you want to reject store request ?"
              />
            </div>
          ),
        };
      }
      return col;
    });
    return renderColumns;
  };

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
  ];
  return (
    <>
      {isPending ? (
        <TableSkeletonLoader />
      ) : (
        <div>
          <div className="relative">
            <BulkActionBar
              selectedAction={selectedAction}
              setSelectedAction={setSelectedAction}
              selectedRows={selectedRows}
              originalDataLength={originalData.length}
              handleSelectAll={handleSelectAll}
              isRequesting={isRequesting || isRejecting}
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
        </div>
      )}
    </>
  );
};

export default StoreRequestApprovalTable;
