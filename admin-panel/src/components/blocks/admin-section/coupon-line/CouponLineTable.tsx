"use client";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import Delete from "@/components/blocks/custom-icons/Delete";
import { CountItems } from "@/config/helperJson";
import { Routes } from "@/config/routes";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import TableEdit from "@/components/blocks/custom-icons/TableEdit";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import {
  useCouponLineDelete,
  useCouponLineQuery,
} from "@/modules/admin-section/coupon-line/coupon-line.action";
import { useAppDispatch } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  serial: string;
  coupon_code?: string;
  discount_type?: string;
  discount?: number;
  title?: number;
  min_order_value?: number;
  max_discount?: number;
  usage_limit?: number;
  start_date?: any;
  end_date?: any;
  actions?: any;
  status?: boolean;
  is_active?: any;
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

const CouponLineTable = ({ searchValue }: any) => {
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
  const queryOptions = useMemo(
    () => ({
      limit: itemsPerPage,
      language: locale,
      page: currentPage,
      sortField: sortedInfo.columnKey || "id",
      sort: sortedInfo.order === "ascend" ? "asc" : "desc",
      search: searchValue,
    }),
    [locale, currentPage, sortedInfo, searchValue, itemsPerPage]
  );

  const { couponLineList, refetch, isPending, error } =
    useCouponLineQuery(queryOptions);

  let totalDataLength = (couponLineList as any)?.meta?.total;
  const startIndex = (couponLineList as any)?.meta?.from;
  const LastPage = (couponLineList as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (couponLineList as any)?.coupon_lines || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [couponLineList, startIndex]);

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
      return newOrder === prev.order ? prev : { columnKey, order: newOrder };
    });
  };

  const handleSelectItemsPerPage = (value: string) => {
    const newItemsPerPage = parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    localStorage.setItem("itemsPerPage", value);
  };
  const [loading, setLoading] = useState(false);
  const { mutate: couponDelete } = useCouponLineDelete();
  const handleDelete = (id: string) => {
    setLoading(true);
    couponDelete(id, {
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
          title: t("table_header.title"),
          width: 100,
          dataIndex: "title",
          render: (_: any, row: any) => (
            <p className=" capitalize">{row?.coupon?.title}</p>
          ),
        },
        {
          title: t("table_header.coupon_code"),
          dataIndex: "coupon_code",
          width: 100,
        },
        {
          title: t("table_header.start_date"),
          dataIndex: "start_date",
          width: 150,
        },
        {
          title: t("table_header.end_date"),
          dataIndex: "end_date",
          width: 150,
        },
        {
          title: t("table_header.discount_type"),
          width: 100,
          dataIndex: "discount_type",
          render: (_: any, row: any) => (
            <p className=" capitalize">{row?.discount_type}</p>
          ),
        },
        {
          title: t("table_header.discount"),
          dataIndex: "discount",
          width: 100,
        },
        {
          title: t("table_header.min_order"),
          dataIndex: "min_order_value",
          width: 100,
        },
        {
          title: t("table_header.max_discount"),
          dataIndex: "max_discount",
          width: 100,
        },
        {
          title: t("table_header.usage_limit"),
          dataIndex: "usage_limit",
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

    const handleEdit = (e: React.MouseEvent, id: string) => {
      const url = `${Routes.editCouponLine}/${id}`;
      if (e.ctrlKey || e.metaKey || e.button === 1) {
        window.open(url, "_blank");
      } else {
        setEditRowId(id);
        router.push(url);
        dispatch(setRefetch(true));
      }
    };
    const renderColumns = columns.map((col) => {
      if (col.dataIndex === "start_date") {
        return {
          ...col,
          render: (start_date: any, row: RecordType) => (
            <span>
              {start_date && format(start_date, "dd MMMM yyyy hh:mm a")}
            </span>
          ),
        };
      }
      if (col.dataIndex === "end_date") {
        return {
          ...col,
          render: (end_date: any, row: RecordType) => (
            <span>{end_date && format(end_date, "dd MMMM yyyy hh:mm a")}</span>
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
                trigger={<Delete />}
                onSave={() => handleDelete(row.id)}
                loading={loading}
                title={t("title.delete_couponLine")}
                subTitle={t("sub_title.delete_couponLine")}
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
  }, [searchValue, itemsPerPage, currentPage, isPending, refetch, error]);

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

export default CouponLineTable;
