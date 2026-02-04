"use client";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import TableEditIcon from "@/assets/icons/TableEditIcon";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import CustomChatIcon from "@/components/blocks/custom-icons/CustomChatIcon";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import { Badge } from "@/components/ui";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CountItems } from "@/config/helperJson";
import { SellerRoutes } from "@/config/sellerRoutes";
import { useBlogCategoryStatusUpdate } from "@/modules/admin-section/blog/blog-category/blog-category.action";
import {
  useSupportTicketResolve,
  useSupportTicketsQuery,
} from "@/modules/seller-section/support-ticket/support-ticket.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import StatusUpdateModal from "./modal/StatusUpdateModal";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  serial: string;
  title: string;
  store: string;
  department: string;
  priority?: string;
  meta_description?: string;
  actions?: any;
  status?: any;
  key: React.Key;
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

const SupportTicketTable = ({
  selectStatus,
  selectPaymentStatus,
  selectPayment2Status,
}: any) => {
  const locale = useLocale();
  const t = useTranslations();
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const store_id = selectedStore?.id;
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
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
  const { SupportTickets, refetch, isPending } = useSupportTicketsQuery({
    limit: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
    sort: sortField,
    store_id: store_id || "",
    department_id: selectPayment2Status,
    priority: selectPaymentStatus,
    status: selectStatus,
  });
  let totalDataLength = (SupportTickets as any)?.meta?.total;
  const startIndex = (SupportTickets as any)?.meta?.from;
  const originalData = useMemo(() => {
    const data = (SupportTickets as any)?.data || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [SupportTickets, startIndex]);

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
  const { mutate: blogCategoryStatus } = useBlogCategoryStatusUpdate();
  const handleToggleStatus = (id: string) => {
    setLoading(true);
    blogCategoryStatus(
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
  const { mutate: blogCategoryDelete } = useSupportTicketResolve();
  const handleTicketResolve = (id: string) => {
    setLoading(true);
    blogCategoryDelete(
      { ticket_id: id },
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
          title: t("table_header.sl"),
          dataIndex: "serial",
          fixed: fixLeft ? "left" : undefined,
          width: "5%",
        },
        {
          title: t("table_header.title"),
          dataIndex: "title",
          width: 100,
        },
        {
          title: t("table_header.priority"),
          dataIndex: "priority",
          width: 100,
        },
        {
          title: t("table_header.department"),
          dataIndex: "department",
          width: 100,
        },
        {
          title: t("table_header.status"),
          dataIndex: "status",
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
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [editRowId, setEditRowId] = useState<string | null>(null);
    const handleEdit = (Id: string) => {
      setEditRowId(Id);
      router.push(`${SellerRoutes.supportTicketDetails}/${Id}`);
      dispatch(setRefetch(true));
    };
    const renderColumns = columns.map((col) => {
      if (col.dataIndex === "priority") {
        return {
          ...col,
          render: (priority: any, row: RecordType) => (
            <div className="relative flex items-center justify-start gap-2">
              <div className="w-[75px]">
                <span
                  className={`border ${
                    priority === "urgent"
                      ? "text-red-500 border-red-500 bg-red-50"
                      : priority === "high"
                      ? "text-pink-500 border-pink-500 bg-pink-50"
                      : priority === "medium"
                      ? "text-yellow-500 border-yellow-500 bg-yellow-50"
                      : "text-green-500 border-green-500 bg-green-50"
                  } capitalize px-2 py-1 rounded`}
                >
                  {priority}
                </span>
              </div>
              {row.status == 1 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <StatusUpdateModal
                        trigger={
                          <button>
                            <div className="border border-[#627D98] hover:bg-[#627D98] hover:text-white p-1.5 rounded">
                              <TableEditIcon />
                            </div>
                          </button>
                        }
                        refetch={refetch}
                        row={row}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-blue-500 text-white">
                    Priority Update
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
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
              {row.status == 1 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <ConfirmationModal
                        trigger={
                          <button>
                            <div className="border border-[#627D98] hover:bg-[#627D98] hover:text-white p-1.5 rounded">
                              <TableEditIcon />
                            </div>
                          </button>
                        }
                        onSave={() => handleTicketResolve(row.id)}
                        loading={loading}
                        title="Resolve Ticket"
                        subTitle="Are You Sure You Want to Resolve this ticket?"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-500">
                    Resolve
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          ),
        };
      }
      if (col.dataIndex === "actions") {
        return {
          ...col,
          render: (o: any, row: RecordType) => (
            <div className="relative flex items-center gap-2 w-full">
              <CustomChatIcon
                disabled={row.status == 0}
                isLoading={editRowId === row.id}
                onClick={() => handleEdit(row.id)}
              />
            </div>
          ),
        };
      }
      return col;
    });
    return renderColumns;
  };
  const dispatch = useAppDispatch();
  useEffect(() => {
    refetch();
    dispatch(setRefetch(false));
  }, [
    isRefetch,
    dispatch,
    refetch,
    sortField,
    itemsPerPage,
    currentPage,
    selectStatus,
    selectPaymentStatus,
    selectPayment2Status,
  ]);
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
            maxWidth={1200}
          />
          <div className="mt-4 flex justify-between">
            <div>
              <AppSelect
                value={String(itemsPerPage)}
                onSelect={handleSelectItemsPerPage}
                groups={CountItems}
                customClass="w-[80px] h-8"
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

export default SupportTicketTable;
