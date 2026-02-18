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
  useBannerDelete,
  useBannerQuery,
  useBannerStatusUpdate,
} from "@/modules/admin-section/promotional/banner/banner.action";
import { useAppDispatch } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { formatLabel } from "@/lib/utils";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  serial: string;
  title: string;
  theme_name: string;
  type?: string;
  desktop_row?: number;
  desktop_columns?: number;
  order?: number;
  thumbnail_image_url?: string;
  actions?: any;
  status?: boolean;
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

const BannerTable = () => {
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
  const sortData =
    sortedInfo.order == "ascend"
      ? sortedInfo.columnKey
      : `${sortedInfo.columnKey}`;
  const { Banners, refetch, isPending, error } = useBannerQuery({
    per_page: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
    sort: sortField,
  });

  let totalDataLength = (Banners as any)?.meta?.total;
  const startIndex = (Banners as any)?.meta?.from;
  const LastPage = (Banners as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (Banners as any)?.data || [];
    return data?.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [Banners, startIndex]);
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

  const { mutate: flashDealsStatus } = useBannerStatusUpdate();
  const handleToggleStatus = (id: string) => {
    setLoading(true);
    flashDealsStatus(
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
  const [loading, setLoading] = useState(false);
  const { mutate: FlashDealDelete } = useBannerDelete();
  const handleDelete = (id: string) => {
    setLoading(true);
    FlashDealDelete(id, {
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
          width: "10%",
        },
        {
          title: t("table_header.title"),
          dataIndex: "title",
          width: 200,
        },
        {
          title: "Theme Name",
          dataIndex: "theme_name",
          width: 200,
        },
        {
          title: "Row",
          dataIndex: "desktop_row",
          width: 90,
        },
        {
          title: "Cols",
          dataIndex: "desktop_columns",
          width: 90,
        },
        {
          title: t("table_header.type"),
          dataIndex: "type",
          width: 100,
        },
        {
          title: "Order",
          dataIndex: "order",
          width: 100,
        },
        {
          title: t("table_header.thumb"),
          dataIndex: "thumbnail_image_url",
          width: 100,
        },
        {
          title: t("table_header.status"),
          dataIndex: "status",
          width: 150,
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

    const handleEdit = (e: React.MouseEvent, id: string) => {
      const url = `${Routes.editBanner}/${id}`;
      if (e.ctrlKey || e.metaKey || e.button === 1) {
        window.open(url, "_blank");
      } else {
        setEditRowId(id);
        router.push(url);
        dispatch(setRefetch(true));
      }
    };

    const renderColumns = columns.map((col) => {
      if (col.dataIndex === "theme_name") {
        return {
          ...col,
          render: (theme_name: any, row: RecordType) => (
            <div className="capitalize">
              {theme_name && formatLabel(theme_name || "", "_")}
            </div>
          ),
        };
      }
      if (col.dataIndex === "thumbnail_image_url") {
        return {
          ...col,
          render: (thumbnail_image_url: any, row: RecordType) => (
            <div className="relative w-12 h-12">
              {thumbnail_image_url !== null ? (
                <Image
                  loader={GlobalImageLoader}
                  src={thumbnail_image_url}
                  alt="thumbnail_image_url"
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
      if (col.dataIndex === "type") {
        return {
          ...col,
          render: (type: any, row: RecordType) => (
            <div className="flex items-center justify-between">
              {type === "Banner-1"
                ? "Promo One"
                : type === "Banner-2"
                ? "Promo Two "
                : "Exclusive Deals"}
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
              <ConfirmationModal
                trigger={<Delete />}
                onSave={() => handleDelete(row.id)}
                loading={loading}
                title={t("title.delete_banner")}
                subTitle={t("sub_title.delete_banner")}
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
  }, [sortField, itemsPerPage, currentPage, isPending, refetch, error]);

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

export default BannerTable;
