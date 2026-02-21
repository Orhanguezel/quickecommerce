"use client";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import Delete from "@/components/blocks/custom-icons/Delete";
import TableEdit from "@/components/blocks/custom-icons/TableEdit";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import { Badge, Switch } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import { SellerRoutes } from "@/config/sellerRoutes";
import {
  useCategoryDelete,
  useCategoryListQuery,
  useCategoryStatusChange,
} from "@/modules/seller-section/category/category.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  serial: number;
  category_name?: string;
  status?: number;
  store_id?: string | null;
  actions?: any;
  key: React.Key;
}

interface ColumnType<RecordType> {
  title: string;
  dataIndex?: keyof RecordType;
  key?: string;
  width?: number | string;
  fixed?: "left" | "right" | undefined;
  ellipsis?: boolean;
}

type ColumnsType<RecordType> = ColumnType<RecordType>[];

const CategoryTable = ({ searchValue }: { searchValue: string }) => {
  const t = useTranslations();
  const locale = useLocale();
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const store_id = selectedStore?.id ?? "";

  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    return parseInt(localStorage.getItem("itemsPerPage") || "10");
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortedInfo, setSortedInfo] = useState<{
    columnKey: string;
    order: string;
  }>({ columnKey: "", order: "" });

  const sortField = sortedInfo.order === "ascend" ? "asc" : "desc";

  const { categories, refetch, isPending } = useCategoryListQuery({
    limit: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey || "id",
    sort: sortField,
    search: searchValue,
    store_id,
  });

  const totalDataLength = (categories as any)?.meta?.total;
  const startIndex = (categories as any)?.meta?.from ?? 1;
  const lastPage = (categories as any)?.meta?.last_page;

  const originalData = useMemo(() => {
    const data = (categories as any)?.data || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
      id: String(item?.id),
    }));
  }, [categories, startIndex]);

  useEffect(() => {
    if (Number(currentPage) > Number(lastPage) && lastPage > 0) {
      setCurrentPage(lastPage);
    }
  }, [lastPage, currentPage]);

  const updatePage = (p: number) => setCurrentPage(p);

  const handleSort = (columnKey: string) => {
    setSortedInfo((prev) => {
      const isSameColumn = prev.columnKey === columnKey;
      const newOrder =
        isSameColumn && prev.order === "ascend" ? "descend" : "ascend";
      return { columnKey, order: newOrder };
    });
  };

  const handleSelectItemsPerPage = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
    localStorage.setItem("itemsPerPage", value);
  };

  const [loading, setLoading] = useState(false);
  const { mutate: categoryStatus } = useCategoryStatusChange();
  const { mutate: categoryDelete } = useCategoryDelete();

  const handleToggleStatus = (row: RecordType) => {
    setLoading(true);
    categoryStatus(
      { id: row.id, status: row.status === 1 ? 0 : 1 },
      {
        onSuccess: () => {
          refetch();
          setLoading(false);
        },
        onError: () => setLoading(false),
      }
    );
  };

  const handleDelete = (id: string) => {
    setLoading(true);
    categoryDelete(id, {
      onSuccess: () => {
        refetch();
        setLoading(false);
      },
      onError: () => setLoading(false),
    });
  };

  const useColumn = (
    fixLeft: boolean,
    fixRight: boolean
  ): ColumnsType<RecordType> => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [editRowId, setEditRowId] = useState<string | null>(null);

    const handleEdit = (e: React.MouseEvent, id: string) => {
      const url = `${SellerRoutes.editCategory}/${id}`;
      if (e.ctrlKey || e.metaKey || e.button === 1) {
        window.open(url, "_blank");
      } else {
        setEditRowId(id);
        router.push(url);
        dispatch(setRefetch(true));
      }
    };

    const columns: ColumnsType<RecordType> = useMemo(
      () => [
        {
          title: t("table_header.sl"),
          dataIndex: "serial",
          fixed: fixLeft ? "left" : undefined,
          width: "6%",
        },
        {
          title: t("table_header.name"),
          dataIndex: "category_name",
          width: 200,
        },
        {
          title: t("table_header.status"),
          dataIndex: "status",
          width: 140,
        },
        {
          title: t("table_header.actions"),
          dataIndex: "actions",
          width: 100,
          fixed: fixRight ? "right" : undefined,
        },
      ],
      [fixLeft, fixRight]
    );

    return columns.map((col) => {
      if (col.dataIndex === "status") {
        return {
          ...col,
          render: (_: any, row: RecordType) => {
            // Only show toggle for own categories (store_id is set)
            const isOwn = !!row.store_id;
            return (
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    row?.status === 1
                      ? "bg-green-50 border border-green-500 text-green-500"
                      : "bg-gray-50 border border-gray-500 text-gray-500"
                  }
                >
                  {row?.status === 1
                    ? t("common.active")
                    : t("common.inactive")}
                </Badge>
                {isOwn && (
                  <ConfirmationModal
                    trigger={
                      <div dir="ltr">
                        <Switch checked={row?.status === 1} />
                      </div>
                    }
                    loading={loading}
                    onSave={() => handleToggleStatus(row)}
                    title={t("title.update_status")}
                    subTitle={t("sub_title.update_status")}
                  />
                )}
              </div>
            );
          },
        };
      }
      if (col.dataIndex === "actions") {
        return {
          ...col,
          render: (_: any, row: RecordType) => {
            const isOwn = !!row.store_id;
            if (!isOwn) {
              return (
                <span className="text-xs text-gray-400 italic">Admin</span>
              );
            }
            return (
              <div className="flex items-center gap-2">
                <TableEdit
                  isLoading={editRowId === row?.id}
                  onClick={(e: React.MouseEvent<Element, MouseEvent>) =>
                    handleEdit(e, row?.id)
                  }
                />
                <ConfirmationModal
                  trigger={<Delete />}
                  onSave={() => handleDelete(row.id)}
                  loading={loading}
                  title={t("title.delete_category")}
                  subTitle={t("sub_title.delete_category")}
                />
              </div>
            );
          },
        };
      }
      return col;
    });
  };

  useEffect(() => {
    refetch();
  }, [searchValue, sortField, itemsPerPage, currentPage, refetch]);

  return (
    <>
      {isPending ? (
        <TableSkeletonLoader />
      ) : (
        <>
          <RCTable
            originData={originalData}
            useColumn={useColumn}
            sortedInfo={sortedInfo}
            handleSort={handleSort}
            maxWidth={900}
          />
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

export default CategoryTable;
