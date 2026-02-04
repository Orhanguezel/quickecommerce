"use client";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import Delete from "@/components/blocks/custom-icons/Delete";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import TableEdit from "@/components/blocks/custom-icons/TableEdit";
import { Badge, Switch } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import {
  useRoleDelete,
  useRolesQuery,
  useRolesStatusUpdate,
} from "@/modules/admin-section/roles/roles.action";
import { useLocale, useTranslations } from "next-intl";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import { Routes } from "@/config/routes";
import { formatLabel } from "@/lib/utils";
import { useRouter } from "next/navigation";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  serial: string;
  name: string;
  perm_title: string;
  permissions?: string;
  available_for?: string;
  status?: boolean;
  locked?: any;
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

const RolesTable = ({ searchValue }: any) => {
  const locale = useLocale();
  const t = useTranslations();
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
  const { roles, refetch, isPending, error } = useRolesQuery({
    limit: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
    sort: sortField,
    search: searchValue,
  });

  let totalDataLength = (roles as any)?.meta?.total;
  const startIndex = (roles as any)?.meta?.from;
  const LastPage = (roles as any)?.meta?.last_page;
  const rolesData = useMemo(() => {
    const data = (roles as any)?.roles || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [roles, startIndex]);

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
  const { mutate: RolesStatus } = useRolesStatusUpdate();
  const handleToggleStatus = (id: string) => {
    setLoading(true);
    RolesStatus(
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
  const { mutate: RoleDeleteMutation } = useRoleDelete();
  const handleDelete = (id: string) => {
    setLoading(true);
    RoleDeleteMutation(id, {
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
          width: 200,
          dataIndex: "name",
        },
        {
          title: t("table_header.available_for"),
          width: 200,
          dataIndex: "available_for",
        },
        {
          title: t("table_header.status"),
          dataIndex: "status",
          width: 150,
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
    const router = useRouter();
    const [editRowId, setEditRowId] = useState<string | null>(null);
    const handleEdit = (e: React.MouseEvent, id: string) => {
      const url = `${Routes.editRole}/${id}`;
      if (e.ctrlKey || e.metaKey || e.button === 1) {
        window.open(url, "_blank");
      } else {
        setEditRowId(id);
        router.push(url);
      }
    };
    const renderColumns = columns.map((col) => {
      if (col.dataIndex === "name") {
        return {
          ...col,
          render: (name: string, row: RecordType) => (
            <span>{formatLabel(name || "", "_")}</span>
          ),
        };
      }
      if (col.dataIndex === "permissions") {
        return {
          ...col,
          render: (permissions: string, row: RecordType) => (
            <div className="">
              {Array.isArray(permissions) &&
                permissions.map((permission: RecordType) => (
                  <Badge
                    key={permission.id || permission.name}
                    className="bg-blue-500 text-white  my-1"
                  >
                    {permission.perm_title}
                  </Badge>
                ))}
            </div>
          ),
        };
      }
      if (col.dataIndex === "available_for") {
        return {
          ...col,
          render: (available_for: string) => (
            <span>{formatLabel(available_for || "", "_")}</span>
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
                  {`${status == 1 ? t("common.active") : t("common.inactive")}`}
                </Badge>
              </div>
              {!row?.locked && (
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
              )}
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
                disabled={row?.locked == 1}
                isLoading={editRowId == row.id}
                onClick={(e: React.MouseEvent<Element, MouseEvent>) =>
                  handleEdit(e, row.id)
                }
              />
              <ConfirmationModal
                trigger={<Delete disabled={row?.locked == 1} />}
                onSave={() => handleDelete(row.id)}
                loading={loading}
                title={t("title.delete_role")}
                subTitle={t("sub_title.delete_role")}
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
    itemsPerPage,
    currentPage,
    sortField,
    searchValue,
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
          <RCTable
            originData={rolesData}
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

export default RolesTable;
