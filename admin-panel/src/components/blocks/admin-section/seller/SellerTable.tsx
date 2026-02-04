"use client";
import { AppSelect } from "@/components/blocks/common";
import ChangePasswordIcon from "@/components/blocks/custom-icons/ChangePassword";
import Delete from "@/components/blocks/custom-icons/Delete";
import TableEdit from "@/components/blocks/custom-icons/TableEdit";
import { BulkActionBar } from "@/components/blocks/shared";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { Badge } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import { Routes } from "@/config/routes";
import GlobalImageLoader from "@/lib/imageLoader";
import {
  useAdminSellerListQuery,
  useSellerDelete,
} from "@/modules/admin-section/seller/seller.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import {
  CheckCircle,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Settings2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { CustomViewIcon } from "../../custom-icons";
import ChangePassword from "./modal/ChangePassword";
import StatusUpdateModal from "./modal/StatusUpdateModal";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  serial: string;
  full_name?: number;
  email: string;
  phone?: string;
  email_verified?: boolean;
  image?: string;
  actions?: any;
  selectActions?: any;
  status?: any;
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

const SellerTable = ({ searchValue, status }: any) => {
  const t = useTranslations();
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
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
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectedAction, setSelectedAction] = useState<string>("");
  const sortData =
    sortedInfo.order == "ascend"
      ? sortedInfo.columnKey
      : `${sortedInfo.columnKey}`;
  const { AdminSellerList, refetch, isPending, error } =
    useAdminSellerListQuery({
      per_page: itemsPerPage,
      language: locale,
      page: currentPage,
      sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
      sort: sortField,
      search: searchValue,
      status,
    });

  let totalDataLength = (AdminSellerList as any)?.meta?.total;
  const startIndex = (AdminSellerList as any)?.meta?.from;
  const LastPage = (AdminSellerList as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (AdminSellerList as any)?.sellers || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [AdminSellerList, startIndex]);

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

  const handleSelectItemsPerPage = (value: any) => {
    const newItemsPerPage = parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    localStorage.setItem("itemsPerPage", value);
  };
  const [loading, setLoading] = useState(false);
  const { mutate: SellerDelete, isPending: isRequesting } = useSellerDelete();
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
    SellerDelete(
      { seller_ids: Ids },
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
    SellerDelete(
      { seller_ids: Ids },
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
          width: "6%",
        },
        {
          title: t("table_header.image"),
          dataIndex: "image",
          width: 100,
          render: (image: string) =>
            image ? (
              <div className="relative w-12 h-12">
                <Image
                  loader={GlobalImageLoader}
                  src={image}
                  alt="seller_image"
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
                />{" "}
              </div>
            ),
        },
        {
          title: t("table_header.name"),
          dataIndex: "full_name",
          width: 100,
        },
        {
          title: t("table_header.email"),
          dataIndex: "email",
          width: 150,
        },
        {
          title: t("table_header.phone"),
          dataIndex: "phone",
          width: 100,
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
    const [viewRowId, setViewRowId] = useState<string | null>(null);

    const handleEdit = (e: React.MouseEvent, id: string) => {
      const url = `${Routes.editSeller}/${id}`;

      if (e.ctrlKey || e.metaKey || e.button === 1) {
        // Open in new tab
        window.open(url, "_blank");
      } else {
        // Same tab behavior
        setEditRowId(id);
        setViewRowId("");
        router.push(url);
        dispatch(setRefetch(true));
      }
    };

    const handleDashboard = (e: React.MouseEvent, id: string) => {
      const url = `${Routes.SellerDetails}/${id}`;

      if (e.ctrlKey || e.metaKey || e.button === 1) {
        // Open in new tab
        window.open(url, "_blank");
      } else {
        // Same tab behavior
        setViewRowId(id);
        setEditRowId("");
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
      if (col.dataIndex === "email") {
        return {
          ...col,
          render: (_: any, row: RecordType) => (
            <div className="flex items-center gap-4">
              <span className="text-blue-500">{row?.email}</span>
              <span className="text-teal-500">
                {row?.email_verified && <CheckCircle width={16} height={16} />}
              </span>
            </div>
          ),
        };
      }
      if (col.dataIndex === "status") {
        return {
          ...col,
          render: (status: any, row: RecordType) => (
            <div className="flex items-center justify-start gap-2">
              <div className="flex items-center gap-2 w-[95px]">
                <Badge
                  className={` ${
                    status == "1"
                      ? "bg-green-50 border border-green-500 text-green-500"
                      : status == "2"
                      ? "bg-red-50 border border-red-500 text-red-500"
                      : "bg-gray-50 border border-gray-500 text-gray-500"
                  } capitalize`}
                >
                  {status == "1"
                    ? "Active"
                    : status == "2"
                    ? "Suspended"
                    : " Inactive"}
                </Badge>
              </div>

              <StatusUpdateModal
                trigger={
                  <button>
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Settings2
                        width={16}
                        height={16}
                        className="text-blue-500"
                      />
                    </div>
                  </button>
                }
                refetch={refetch}
                row={row}
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
              <div>
                <CustomViewIcon
                  isLoading={viewRowId == row?.id}
                  onClick={(e: React.MouseEvent<Element, MouseEvent>) =>
                    handleDashboard(e, row?.id)
                  }
                />
              </div>
              <TableEdit
                isLoading={editRowId === row.id}
                onClick={(e: React.MouseEvent<Element, MouseEvent>) =>
                  handleEdit(e, row.id)
                }
              />
              <ChangePassword
                trigger={<ChangePasswordIcon />}
                refetch={refetch}
                row={row}
              />
              <ConfirmationModal
                trigger={<Delete />}
                onSave={() => handleDelete(row.id)}
                loading={loading}
                title={t("title.delete_seller")}
                subTitle={t("sub_title.delete_seller")}
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
    status,
    sortField,
    itemsPerPage,
    currentPage,
    isPending,
    refetch,
    error,
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
              isRequesting={isRequesting}
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
                customClass="w-[80px] h-8 app-input mb-4 md:mb-0"
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

export default SellerTable;
