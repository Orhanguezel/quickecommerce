"use client";
import { AppSelect } from "@/components/blocks/common";
import Delete from "@/components/blocks/custom-icons/Delete";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { Badge, Switch } from "@/components/ui";
import { CountItems } from "@/config/helperJson";

import { CustomViewIcon } from "@/components/blocks/custom-icons";
import ChangePasswordIcon from "@/components/blocks/custom-icons/ChangePassword";
import CustomEmailVerifyIcon from "@/components/blocks/custom-icons/CustomEmailVerifyIcon";
import CustomSuspendIcon from "@/components/blocks/custom-icons/CustomSuspendIcon";
import TableEdit from "@/components/blocks/custom-icons/TableEdit";
import { BulkActionBar } from "@/components/blocks/shared";
import { Routes } from "@/config/routes";
import GlobalImageLoader from "@/lib/imageLoader";
import {
  useCustomerEmailVerify,
  useCustomerListDeleteMutation,
  useCustomerListQuery,
  useCustomerListStatusUpdate,
  useCustomerSuspend,
} from "@/modules/admin-section/customer/customer-list/customer-list.action";
import { CheckCircle, ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import ChangePassword from "./modal/ChangePassword";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  serial: string;
  full_name: string;
  phone: string;
  image: string;
  email: string;
  email_verified?: boolean;
  status: any;
  actions?: any;
  selectActions?: any;
  info?: any;
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

const CustomerListTable = ({ searchValue, selectStatus }: any) => {
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
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectedAction, setSelectedAction] = useState<string>("");
  const { CustomerListData, refetch, isPending, error } = useCustomerListQuery({
    ...searchValue,
    per_page: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : "name",
    sort: sortField,
    status: selectStatus,
  });

  let totalDataLength = (CustomerListData as any)?.meta?.total;
  const startIndex = (CustomerListData as any)?.meta?.from;
  const LastPage = (CustomerListData as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (CustomerListData as any)?.customers || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [CustomerListData, startIndex]);

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
  const { mutate: blogCategoryStatus } = useCustomerListStatusUpdate();
  const handleToggleStatus = (id: string, currentStatus: number) => {
    setLoading(true);

    const newStatus = currentStatus == 1 ? 0 : 1;

    blogCategoryStatus(
      { id, status: newStatus },
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

  const { mutate: CustomerEmailVerify } = useCustomerEmailVerify();
  const handleCustomerEmailVerify = (id: string) => {
    setLoading(true);
    CustomerEmailVerify(
      { customer_id: id },
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
  const { mutate: CustomerSuspend } = useCustomerSuspend();
  const handleCustomerSuspend = (id: string) => {
    setLoading(true);
    CustomerSuspend(
      { customer_id: id },
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

  const { mutate: CustomerDelete, isPending: isRequesting } =
    useCustomerListDeleteMutation();
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
    CustomerDelete(
      { customer_ids: Ids },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
    setSelectedRows(new Set());
  };

  const handleDelete = (id: any) => {
    setLoading(true);
    const Ids = [id];
    CustomerDelete(
      { customer_ids: Ids },
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
          title: t("table_header.info"),
          dataIndex: "info",
          width: 250,
          render: (_:any , row: any) => (
            <div className="flex items-center gap-2">
              <div className="relative w-12 h-12">
                {row?.image ? (
                  <Image
                    loader={GlobalImageLoader}
                    src={row?.image}
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
              <div>
                <p className="text-blue-500 text-base font-semibold capitalize">
                  {row?.full_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-white">
                  {row?.email}
                </p>
              </div>
            </div>
          ),
        },
        {
          title: t("table_header.email"),
          dataIndex: "email",
          width: 150,
        },
        {
          title: t("table_header.phone"),
          dataIndex: "phone",
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
          width: "20%",
          fixed: !isMobile && fixRight ? "right" : undefined,
        },
      ],
      [fixLeft, fixRight, isMobile]
    );
    const router = useRouter();
    const [editRowId, setEditRowId] = useState<string | null>(null);

    const handleEdit = (e: React.MouseEvent, id: string) => {
      const url = `${Routes.editCustomer}/${id}`;
      if (e.ctrlKey || e.metaKey || e.button === 1) {
        window.open(url, "_blank");
      } else {
        setEditRowId(id);
        router.push(url);
      }
    };
    const [viewRowId, setViewRowId] = useState<string | null>(null);

    const handleDetailsView = (e: React.MouseEvent, id: string) => {
      const url = `${Routes.AdminCustomerDetails}/${id}`;
      if (e.ctrlKey || e.metaKey || e.button === 1) {
        window.open(url, "_blank");
      } else {
        setViewRowId(id);
        router.push(url);
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
              <div className="w-[90px]">
                <Badge
                  className={` ${
                    status == 1
                      ? "bg-green-50 border border-green-500 text-green-500"
                      : status == 2
                      ? "bg-red-50 border border-red-500 text-red-500"
                      : "bg-yellow-50 border border-yellow-500 text-yellow-500"
                  } capitalize`}
                >
                  {`${
                    status == 1
                      ? t("common.active")
                      : status == 2
                      ? t("common.suspended")
                      : t("common.inactive")
                  }`}
                </Badge>
              </div>

              <ConfirmationModal
                trigger={
                  <div dir="ltr">
                    <Switch checked={status == 1} />
                  </div>
                }
                loading={loading}
                onSave={() => handleToggleStatus(row.id, status)}
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
              <ChangePassword
                trigger={<ChangePasswordIcon />}
                refetch={refetch}
                row={row}
              />
              <CustomViewIcon
                isLoading={viewRowId === row.id}
                onClick={(e: React.MouseEvent<Element, MouseEvent>) =>
                  handleDetailsView(e, row.id)
                }
              />
              <TableEdit
                isLoading={editRowId === row.id}
                onClick={(e: React.MouseEvent<Element, MouseEvent>) =>
                  handleEdit(e, row.id)
                }
              />
              <ConfirmationModal
                trigger={
                  <CustomEmailVerifyIcon disabled={row?.email_verified} />
                }
                loading={loading}
                onSave={() => handleCustomerEmailVerify(row.id)}
                title={t("title.email_verify")}
                subTitle={t("sub_title.email_verify")}
              />
              <ConfirmationModal
                trigger={<CustomSuspendIcon disabled={row.status === 2} />}
                loading={loading}
                onSave={() => handleCustomerSuspend(row.id)}
                title={t("title.customer_suspend")}
                subTitle={t("sub_title.customer_suspend")}
              />

              <ConfirmationModal
                trigger={<Delete />}
                onSave={() => handleDelete(row.id)}
                loading={loading}
                title={t("title.customer_delete")}
                subTitle={t("sub_title.customer_delete")}
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
    selectStatus,
    itemsPerPage,
    currentPage,
    LastPage,
    isPending,
    refetch,
    ,
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
              maxWidth={1400}
            />
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

export default CustomerListTable;
