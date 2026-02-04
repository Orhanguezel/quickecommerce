"use client";
import { AppSelect } from "@/components/blocks/common";
import Delete from "@/components/blocks/custom-icons/Delete";
import TableEdit from "@/components/blocks/custom-icons/TableEdit";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";
import { Badge, Button, Switch } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import { Routes } from "@/config/routes";
import {
  useDynamicFieldDelete,
  useDynamicFieldsQuery,
  useDynamicFieldStatusUpdate,
  useDynamicRequiredFieldUpdate,
} from "@/modules/admin-section/dynamic-fields/dynamic-fields.action";
import { useAppDispatch } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { ChevronsLeftIcon, ChevronsRightIcon, Settings } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

interface RecordType {
  id: string;
  serial: string;
  name: string;
  store_type?: string;
  type?: string;
  actions?: any;
  selectActions?: any;
  status?: any;
  is_required?: boolean;
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

const DynamicFieldsTable = ({ searchValue }: any) => {
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
  const sortField = sortedInfo.order == "ascend" ? "asc" : "desc";
  const { DynamicFields, refetch, isPending, error } = useDynamicFieldsQuery({
    limit: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
    sort: sortField,
    search: searchValue,
  });

  let totalDataLength = (DynamicFields as any)?.meta?.total;
  const startIndex = (DynamicFields as any)?.meta?.from;
  const LastPage = (DynamicFields as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (DynamicFields as any)?.data || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [DynamicFields, startIndex]);

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
  const { mutate: dynamicRequiredField } = useDynamicRequiredFieldUpdate();
  const handleRequiredField = (id: string) => {
    setLoading(true);
    dynamicRequiredField(
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

  const { mutate: DynamicFieldDeleteMutation } = useDynamicFieldDelete();
  const handleDelete = (id: string) => {
    setLoading(true);
    DynamicFieldDeleteMutation(id, {
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
          title: t("table_header.sl"),
          dataIndex: "serial",
          fixed: fixLeft ? "left" : undefined,
          width: "6%",
        },

        {
          title: t("table_header.name"),
          dataIndex: "name",
          width: 100,
        },
        {
          title: t("table_header.type"),
          dataIndex: "type",
          width: 100,
        },
        {
          title: t("table_header.store_type"),
          dataIndex: "store_type",
          width: 100,
        },
        {
          title: "Status",
          dataIndex: "status",
          width: "15%",
        },
        {
          title: "Required",
          dataIndex: "is_required",
          width: "15%",
        },
        {
          title: t("table_header.actions"),
          dataIndex: "actions",
          width: 120,
          fixed: !isMobile && fixRight ? "right" : undefined,
        },
      ],
      [fixLeft, fixRight, isMobile]
    );
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [editRowId, setEditRowId] = useState<string | null>(null);
    const handleEdit = (e: React.MouseEvent, id: string) => {
      const url = `${Routes.EditDynamicField}/${id}`;
      if (e.ctrlKey || e.metaKey || e.button === 1) {
        window.open(url, "_blank");
      } else {
        setEditRowId(id);
        router.push(url);
        dispatch(setRefetch(true));
      }
    };

    const [optionID, setOptionID] = useState<string | null>(null);
    const handleOption = (e: React.MouseEvent, id: string) => {
      const url = `${Routes.DynamicFieldOptions}/${id}`;
      if (e.ctrlKey || e.metaKey || e.button === 1) {
        window.open(url, "_blank");
      } else {
        setOptionID(id);
        router.push(url);
        dispatch(setRefetch(true));
      }
    };

    const renderColumns = columns.map((col) => {
      if (col.dataIndex === "status") {
        return {
          ...col,
          render: (status: any, row: RecordType) => (
            <div className="flex items-center justify-start gap-2">
              <div className="flex items-center gap-2">
                <Badge
                  className={` ${
                    status === "active"
                      ? "bg-green-50 border border-green-500 text-green-500"
                      : status === "archived"
                      ? "bg-blue-50 border border-blue-500 text-blue-500"
                      : "bg-gray-50 border border-gray-500 text-gray-500"
                  } capitalize`}
                >
                  {`${status}`}
                </Badge>
              </div>
            </div>
          ),
        };
      }
      if (col.dataIndex === "is_required") {
        return {
          ...col,
          render: (is_required: any, row: RecordType) => (
            <div className="flex items-center justify-start gap-2">
              <ConfirmationModal
                trigger={
                  <div dir="ltr">
                    <Switch checked={is_required == true} />
                  </div>
                }
                loading={loading}
                onSave={() => handleRequiredField(row.id)}
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
                trigger={<Delete disabled={row?.status === "archived"} />}
                onSave={() => handleDelete(row.id)}
                loading={loading}
                title="Delete Dynamic Field"
                subTitle="Are you sure you want to delete dynamic field?"
              />
              {(row.type == "select" ||
                row.type == "multiselect" ||
                row.type == "checkbox") && (
                <Button
                  disabled={optionID === row.id}
                  onClick={(e: React.MouseEvent<Element, MouseEvent>) =>
                    handleOption(e, row.id)
                  }
                  className="app-button px-2 h-8"
                >
                  {optionID === row.id ? (
                    <Loader size="sm" color="text-slate-500" />
                  ) : (
                    <Settings width={16} height={16} />
                  )}
                  <span className="mx-2">Option</span>
                </Button>
              )}
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
        <div className="relative">
          <RCTable
            originData={originalData}
            useColumn={useColumn}
            sortedInfo={sortedInfo}
            handleSort={handleSort}
            maxWidth={1000}
          />
          <div className="mt-3 flex flex-col md:flex-row justify-between">
            <div>
              <AppSelect
                value={String(itemsPerPage)}
                onSelect={handleSelectItemsPerPage}
                groups={CountItems}
                customClass="w-[80px] h-8 app-input mb-4 md:mb-0"
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

export default DynamicFieldsTable;
