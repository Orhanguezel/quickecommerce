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
  Button,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import { Routes } from "@/config/routes";
import GlobalImageLoader from "@/lib/imageLoader";
import { formatLabel } from "@/lib/utils";
import {
  useStaffDelete,
  useStaffQuery,
  useStaffStatusUpdate,
} from "@/modules/admin-section/staff/staff.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import ChangePasswordIcon from "../../custom-icons/ChangePassword";
import ChangePassword from "./modals/ChangePassword";
import { BulkActionBar } from "@/components/blocks/shared";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  [x: string]: any;
  id: string;
  serial: string;
  title: string;
  discount_amount?: number;
  purchase_limit?: number;
  locked?: boolean;
  discount_type?: string;
  start_time?: string;
  end_time?: string;
  image_url?: any;
  identification_number?: string;
  vehicle_type?: string;
  thumbnail_image?: any;
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

const StaffTable = ({ searchValue }: any) => {
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
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectedAction, setSelectedAction] = useState<string>("");
  const sortField = sortedInfo.order == "ascend" ? "asc" : "desc";
  const { staffList, refetch, isPending, error } = useStaffQuery({
    // ...searchValue,
    per_page: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
    sort: sortField,
    search: searchValue,
  });

  let totalDataLength = (staffList as any)?.meta?.total;
  const startIndex = (staffList as any)?.meta?.from;
  const LastPage = (staffList as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (staffList as any)?.data || [];
    return data?.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [staffList, startIndex]);

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
  const { mutate: updateStoreStatus } = useStaffStatusUpdate();
  const handleToggleStatus = (id: string) => {
    setLoading(true);
    updateStoreStatus(
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
  const { mutate: StaffDelete, isPending: isRequesting } = useStaffDelete();

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
    StaffDelete(
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
    StaffDelete(
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
          width: "6%",
        },
        {
          title: t("table_header.image"),
          dataIndex: "image_url",
          width: 100,
          render: (image_url: string) =>
            image_url ? (
              <div className="relative w-12 h-12">
                <Image
                  loader={GlobalImageLoader}
                  src={image_url}
                  alt="Brand Logo"
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
          width: 100,
          dataIndex: "name",
          render: (_: any, row: any) => (
            <div className="flex items-center capitalize gap-2">
              <div>
                <p className="">{row?.full_name}</p>
              </div>
            </div>
          ),
        },
        {
          title: t("table_header.email"),
          width: 200,
          dataIndex: "email",
          render: (_: any, row: any) => (
            <div className="flex items-center gap-2">
              <div>
                <span>{row?.email}</span>
              </div>
            </div>
          ),
        },
        {
          title: t("table_header.phone"),
          width: 150,
          dataIndex: "phone",
          render: (_: any, row: any) => (
            <div className="flex items-center gap-2">
              <div>
                <span>{row?.phone}</span>
              </div>
            </div>
          ),
        },
        {
          title: t("table_header.roles"),
          dataIndex: "roles",
          width: "20%",
        },
        {
          title: t("table_header.status"),
          dataIndex: "status",
          width: "15%",
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

    const handleEdit = (e: React.MouseEvent, id: string) => {
      const url = `${Routes.editStaff}/${id}`;
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

      if (col.dataIndex === "roles") {
        return {
          ...col,
          render: (roles: string, row: RecordType) => (
            <div className="">
              {Array.isArray(roles) &&
                roles.map((role: string, index) => (
                  <Badge
                    key={index}
                    className="bg-blue-50 border border-blue-500 text-blue-500 m-0.5 py-1 px-2 capitalize rounded"
                  >
                    {formatLabel(role || "", "_")}
                  </Badge>
                ))}
            </div>
          ),
        };
      }
      if (col.dataIndex === "status") {
        return {
          ...col,
          render: (_: any, row: RecordType) => (
            <div className="flex items-center justify-start gap-2">
              <div className="flex items-center gap-2 w-[70px]">
                <Badge
                  className={` ${
                    row?.status == 1
                      ? "bg-green-50 border border-green-500 text-green-500"
                      : "bg-gray-50 border border-gray-500 text-gray-500"
                  } capitalize`}
                >
                  {row?.status == 1 ? t("common.active") : t("common.inactive")}
                </Badge>
              </div>
              {!row?.locked && (
                <ConfirmationModal
                  trigger={
                    <div dir="ltr">
                      <Switch checked={row?.status == 1} />
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
              <div>
                <TableEdit
                  disabled={row?.locked}
                  isLoading={editRowId === row.id}
                  onClick={(e: React.MouseEvent<Element, MouseEvent>) =>
                    handleEdit(e, row.id)
                  }
                />
              </div>
              <ConfirmationModal
                trigger={<Delete disabled={row?.locked} />}
                onSave={() => handleDelete(row.id)}
                loading={loading}
                title={t("title.delete_staff")}
                subTitle={t("sub_title.delete_staff")}
              />
              <ChangePassword
                trigger={<ChangePasswordIcon />}
                refetch={refetch}
                row={row}
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
              maxWidth={1000}
            />{" "}
          </div>
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
        </>
      )}
    </>
  );
};

export default StaffTable;
