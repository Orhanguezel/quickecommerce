"use client";
import MuteVectorIcon from "@/assets/icons/MuteVectorIcon";
import VectorIcon from "@/assets/icons/VectorIcon";
import { formatPrice } from "@/components/molecules/formatPrice";
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
import {
  usePackageDelete,
  usePackageQuery,
  usePackageStatusChange,
} from "@/modules/admin-section/business-operations/subscription/package/package.action";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { useAppDispatch } from "@/redux/hooks/index";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  serial: string;
  name?: string;
  description?: string;
  image?: string;
  live_chat?: boolean;
  mobile_app?: boolean;
  order_limit?: boolean;
  pos_system?: boolean;
  price?: string;
  product_featured_limit?: string;
  product_limit?: string;
  self_delivery?: string;
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

const PackageTable = ({ searchValue }: any) => {
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
  const { PackageList, refetch, isPending, error } = usePackageQuery({
    limit: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
    sort: sortField,
    search: searchValue,
  });

  let totalDataLength = (PackageList as any)?.meta?.total;
  const startIndex = (PackageList as any)?.meta?.from;
  const LastPage = (PackageList as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (PackageList as any)?.packages || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [PackageList, startIndex]);

  useEffect(() => {
    if (Number(currentPage) > Number(LastPage)) {
      setCurrentPage(LastPage);
    } else {
      setCurrentPage(currentPage);
    }
  }, [LastPage, currentPage]);

  const { currency, refetch: refetchCurrency } = useCurrencyQuery({});
  const currencyData = useMemo(() => {
    const data = (currency as any) || {};
    return data;
  }, [currency]);
  const CurrencyData = currencyData.currencies_info;

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
  const { mutate: PackageDelete } = usePackageDelete();
  const handleDelete = (id: string) => {
    setLoading(true);
    PackageDelete(id, {
      onSuccess: () => {
        refetch();
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      },
    });
  };
  const { mutate: packageStatus } = usePackageStatusChange();
  const handleToggleStatus = (id: string) => {
    setLoading(true);
    packageStatus(
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
          width: 150,
        },
        {
          title: t("table_header.price"),
          dataIndex: "price",
          width: 100,
          render: (price: any) => (
            <div className="capitalize">
              {price ? formatPrice(price, CurrencyData) : price}
            </div>
          ),
        },
        {
          title: t("table_header.order_limit"),
          dataIndex: "order_limit",
          width: 150,
        },
        {
          title: t("table_header.product_limit"),
          dataIndex: "product_limit",
          width: 150,
        },
        {
          title: t("table_header.featured_limit"),
          dataIndex: "product_featured_limit",
          width: 150,
        },

        {
          title: t("table_header.pos_system"),
          dataIndex: "pos_system",
          render: (pos_system: any) => (
            <span className="px-4 inline-block">
              {pos_system == true ? <VectorIcon /> : <MuteVectorIcon />}
            </span>
          ),
          width: 150,
        },
        {
          title: t("table_header.live_chat"),
          dataIndex: "live_chat",
          render: (live_chat: any) => (
            <span className="px-4 inline-block">
              {live_chat == 1 ? <VectorIcon /> : <MuteVectorIcon />}
            </span>
          ),
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
      const url = `${Routes.editPackage}/${id}`;
      if (e.ctrlKey || e.metaKey || e.button === 1) {
        window.open(url, "_blank");
      } else {
        setEditRowId(id);
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
                title={t("title.delete_package")}
                subTitle={t("sub_title.delete_package")}
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

export default PackageTable;
