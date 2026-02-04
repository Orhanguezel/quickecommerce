"use client";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import Delete from "@/components/blocks/custom-icons/Delete";
import TableEdit from "@/components/blocks/custom-icons/TableEdit";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import { Badge, Switch } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import { Routes } from "@/config/routes";
import GlobalImageLoader from "@/lib/imageLoader";
import {
  useCouponDelete,
  useCouponQuery,
  useCouponStatusChange,
} from "@/modules/admin-section/coupon/coupon.action";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/index";
import { setCouponId } from "@/redux/slices/couponSlice";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import TableAddIcon from "../../custom-icons/TableAddIcon";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";
interface RecordType {
  id: string;
  serial: string;
  title?: string;
  description?: string;
  image_url?: string;
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

const CouponTable = ({ searchValue }: any) => {
  const t = useTranslations();
  const isRefetch = useAppSelector((state) => state.refetchValue.isRefetch);
  const locale = useLocale();
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    return parseInt(localStorage.getItem("itemsPerPage") || "10");
  });
  const getPageFromLocalStorage = (pageId: string) => {
    const key = `currentPage_${pageId}`;
    const savedPage = localStorage.getItem(key);
    return savedPage ? parseInt(savedPage) : 1;
  };
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const pageId = "coupon_table";
    return getPageFromLocalStorage(pageId);
  });
  const [sortedInfo, setSortedInfo] = useState<{
    columnKey: string;
    order: string;
  }>({
    columnKey: "",
    order: "",
  });
  const sortField = sortedInfo.order == "ascend" ? "asc" : "desc";
  const { couponList, refetch, isPending } = useCouponQuery({
    limit: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
    sort: sortField,
    search: searchValue,
  });

  let totalDataLength = (couponList as any)?.meta?.total;
  const startIndex = (couponList as any)?.meta?.from;
  const originalData = useMemo(() => {
    const data = (couponList as any)?.coupons || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [couponList, startIndex]);

  const [shouldRefetch, setShouldRefetch] = useState(false);
  const dispatch = useAppDispatch();

  const updatePage = (p: any, pageId: string) => {
    const key = `currentPage_${pageId}`;
    setCurrentPage(p);
    localStorage.setItem(key, p);
    setShouldRefetch(true);
  };

  useEffect(() => {
    if (shouldRefetch) {
      refetch();
      setShouldRefetch(false);
    }
    if (isRefetch) {
      refetch();
      dispatch(setRefetch(false));
    }
  }, [shouldRefetch, isRefetch, dispatch, refetch]);

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
  const { mutate: couponStatus } = useCouponStatusChange();
  const handleToggleStatus = (id: string) => {
    setLoading(true);
    couponStatus(
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

  const { mutate: couponDelete } = useCouponDelete();
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
          title: t("table_header.thumb"),
          dataIndex: "image_url",
          width: 100,
        },
        {
          title: t("table_header.title"),
          dataIndex: "title",
          width: 200,
        },
        {
          title: t("table_header.status"),
          dataIndex: "status",
          width: 150,
        },
        {
          title: t("table_header.actions"),
          dataIndex: "actions",
          width: "13%",
          fixed: !isMobile && fixRight ? "right" : undefined,
        },
      ],
      [fixLeft, fixRight, isMobile]
    );

    const dispatch = useAppDispatch();
    const router = useRouter();
    const [editRowId2, setEditRowId2] = useState<string | null>(null);
    const handleClick = (couponId: string) => {
      setEditRowId2(couponId);
      dispatch(setCouponId(couponId));
      router.push(`${Routes.addCouponLine}`);
    };
    const [editRowId, setEditRowId] = useState<string | null>(null);

    const handleEdit = (e: React.MouseEvent, id: string) => {
      const url = `${Routes.editCoupon}/${id}`;
      if (e.ctrlKey || e.metaKey || e.button === 1) {
        window.open(url, "_blank");
      } else {
        setEditRowId(id);
        router.push(url);
        dispatch(setRefetch(true));
      }
    };

    const renderColumns = columns.map((col) => {
      if (col.dataIndex === "image_url") {
        return {
          ...col,
          render: (image_url: any, row: RecordType) => (
            <div className="relative w-12 h-12">
              {image_url !== null ? (
                <Image
                  loader={GlobalImageLoader}
                  src={image_url}
                  alt="image_url"
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
          ),
        };
      }
      if (col.dataIndex === "status") {
        return {
          ...col,
          render: (status: any, row: RecordType) => (
            <div className="flex items-center justify-start gap-2">
              <div className="flex items-center gap-2">
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
              <TableAddIcon
                isLoading={editRowId2 === row.id}
                onClick={() => handleClick(row.id)}
                addText={t("common.add_coupon_line")}
              />
              <ConfirmationModal
                trigger={<Delete />}
                onSave={() => handleDelete(row.id)}
                loading={loading}
                title={t("title.delete_coupon")}
                subTitle={t("sub_title.delete_coupon")}
              />
            </div>
          ),
        };
      }
      return col;
    });
    return renderColumns;
  };
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
              onChange={(e) => updatePage(e, "coupon_table")}
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

export default CouponTable;
