"use client";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import CustomRestoreIcon from "@/components/blocks/custom-icons/CustomRestoreIcon";
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
import GlobalImageLoader from "@/lib/imageLoader";

import { useSellerStoreQuery } from "@/modules/admin-section/seller-store/seller-store.action";
import {
  useTrashSellerDelete,
  useTrashSellerQuery,
  useTrashSellerRestore,
} from "@/modules/admin-section/seller/seller.action";
import { useAppDispatch } from "@/redux/hooks";
import { setDynamicValue } from "@/redux/slices/refetchSlice";
import { CheckCircle, ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { BulkActionBar } from "@/components/blocks/shared";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  serial: string;
  email: string;
  store: string;
  slug: string;
  store_slug: string;
  image: string;
  full_name: string;
  email_verified?: boolean;
  status: string;
  selectActions?: any;
  actions?: any;
  key: React.Key;
  children?: RecordType[];
  name: string;
  logo?: string;
  logo_url?: string;
  banner?: string;
  banner_url?: string;
  meta_description?: string;
  meta_title?: string;
  phone?: string;
  address?: string;
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

const TrashListTable = () => {
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
  const { TrashSellerList, refetch, isPending, error } = useTrashSellerQuery({
    per_page: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : "name",
    sort: sortField,
  });

  let totalDataLength = (TrashSellerList as any)?.meta?.total;
  const startIndex = (TrashSellerList as any)?.meta?.from;
  const LastPage = (TrashSellerList as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (TrashSellerList as any)?.data || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [TrashSellerList, startIndex]);
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
    if (selectedAction === "approve") {
      handleBulkRequestApprove();
    }
    if (selectedAction === "delete") {
      handleBulkRequestDelete();
    }
  };
  const [loading, setLoading] = useState(false);
  const { mutate: ReviewsApprove, isPending: isApprove } =
    useTrashSellerRestore();

  const handleSingleApprove = (id: string) => {
    const Ids = [id];
    setLoading(true);
    ReviewsApprove(
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

  const handleBulkRequestApprove = () => {
    const Ids = Array.from(selectedRows);

    ReviewsApprove(
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

  const { mutate: ReviewsDelete, isPending: isDelete } = useTrashSellerDelete();
  const handleSingleDelete = (id: string) => {
    const Ids = [id];
    setLoading(true);
    ReviewsDelete(
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

  const handleBulkRequestDelete = () => {
    const Ids = Array.from(selectedRows);
    ReviewsDelete(
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
                trigger={<CustomRestoreIcon />}
                onSave={() => handleSingleApprove(row.id)}
                loading={loading}
                title={t("title.restore_data", { type: "Seller" })}
                subTitle={t("sub_title.restore_data", { type: "Seller" })}
              />

              <ConfirmationModal
                trigger={<Delete />}
                onSave={() => handleSingleDelete(row.id)}
                loading={loading}
                title={t("title.permanent_delete")}
                subTitle={t("sub_title.permanent_delete", { type: "Seller" })}
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
  }, [sortField, currentPage, isPending, refetch, error, itemsPerPage]);

  const actions = [
    {
      value: "approve",
      label: t("common.restore"),
      onClick: handleApplyAction,
    },
    {
      value: "delete",
      label: t("common.delete"),
      onClick: handleApplyAction,
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
              isRequesting={isDelete || isApprove}
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

export default TrashListTable;
