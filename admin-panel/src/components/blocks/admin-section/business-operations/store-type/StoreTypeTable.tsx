"use client";
import { formatPrice } from "@/components/molecules/formatPrice";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import TableEdit from "@/components/blocks/custom-icons/TableEdit";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import { Badge, Switch } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import { Routes } from "@/config/routes";
import GlobalImageLoader from "@/lib/imageLoader";
import {
  useStoreTypeQuery,
  useStoreTypeStatusChange,
} from "@/modules/admin-section/business-operations/store-type/store-type.action";
import { useCurrencyQuery } from "@/modules/common/com/com.action";
import { useAppDispatch } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  [x: string]: any;
  id: string;
  serial: string;
  name?: number;
  image?: any;
  additional_charge_amount?: any;
  additional_charge_commission?: any;
  additional_charge_enable_disable?: any;
  additional_charge_name?: any;
  additional_charge_type?: any;
  actions?: any;
  status?: number;
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

const StoreTypeTable = ({ searchValue }: any) => {
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
  const { StoreTypeList, refetch, isPending, error } = useStoreTypeQuery({
    per_page: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
    sort: sortField,
    search: searchValue,
  });

  let totalDataLength = (StoreTypeList as any)?.meta?.total;
  const startIndex = (StoreTypeList as any)?.meta?.from;
  const LastPage = (StoreTypeList as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (StoreTypeList as any)?.data || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [StoreTypeList, startIndex]);

  const { currency, refetch: refetchCurrency } = useCurrencyQuery({});
  const currencyData = useMemo(() => {
    const data = (currency as any) || {};
    return data;
  }, [currency]);
  const CurrencyData = currencyData.currencies_info;

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
  const { mutate: StoreTypeStatusUpdate } = useStoreTypeStatusChange();
  const handleToggleStatus = (id: string) => {
    setLoading(true);
    StoreTypeStatusUpdate(
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
          title: t("table_header.image"),
          width: 100,
             dataIndex: "image",
          render: (_:any , row: any) => (
            <div className="flex items-center gap-2">
              {row?.image ? (
                <div className="relative w-12 h-12">
                  <Image
                    loader={GlobalImageLoader}
                    src={row?.image}
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
                  />
                </div>
              )}
            </div>
          ),
        },
        {
          width: 150,
          title: t("table_header.name"),
          dataIndex: "name",
        },
        {
          width: "10%",
          title: t("table_header.type"),
          dataIndex: "type",
        },
        {
          width: 150,
          title: t("table_header.total_stores"),
          dataIndex: "total_stores",
        },
        {
          width: 250,
          title: t("table_header.additional_charge_info"),
             dataIndex: "additional_charge_info",
          render: (_:any , row: any) => (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className=" text-sm font-semibold capitalize">
                  {t("common.additional_charge")}
                </span>
                <span className="flex items-center gap-1 text-sm ">
                  <span>: </span>
                  <Badge
                    className={` ${
                      row?.additional_charge_enable_disable == 1
                        ? "bg-green-50 border border-green-500 text-green-500"
                        : "bg-gray-50 border border-gray-500 text-gray-500"
                    } capitalize`}
                  >
                    {`${
                      row?.additional_charge_enable_disable == 1
                        ? "Enable"
                        : "Disable"
                    }`}
                  </Badge>
                </span>
              </div>

              {row?.additional_charge_name && (
                <div className="flex items-center gap-2">
                  <span className=" text-sm font-semibold capitalize">
                    {t("common.name")}
                  </span>
                  <span className=" text-sm text-black dark:text-white font-semibold capitalize">
                    : {row?.additional_charge_name}
                  </span>
                </div>
              )}
              {row?.additional_charge_amount && (
                <div className="flex items-center gap-2">
                  <span className=" text-sm font-semibold capitalize">
                    {t("common.amount")}
                  </span>
                  <span className=" text-sm text-black dark:text-white font-semibold capitalize">
                    :{" "}
                    {formatPrice(row?.additional_charge_amount, CurrencyData) ??
                      ""}{" "}
                    {row?.additional_charge_type && (
                      <span className="text-sm text-black dark:text-white font-semibold capitalize">
                        ({row?.additional_charge_type})
                      </span>
                    )}
                  </span>
                </div>
              )}

              {row?.additional_charge_commission && (
                <div className="flex items-center gap-2">
                  <span className=" text-sm font-semibold capitalize">
                    {t("common.commission")}
                  </span>
                  <span className=" text-sm text-black dark:text-white font-semibold capitalize">
                    : {row?.additional_charge_commission}%
                  </span>
                </div>
              )}
            </div>
          ),
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
      const url = `${Routes.editStoreType}/${id}`;

      if (e.ctrlKey || e.metaKey || e.button === 1) {
        window.open(url, "_blank");
      } else {
        setEditRowId(id);
        router.push(url);
        dispatch(setRefetch(true));
      }
    };

    const renderColumns = columns.map((col) => {
      if (col.dataIndex === "type") {
        return {
          ...col,
          render: (type: any, row: RecordType) => (
            <div className="flex items-center justify-start gap-2">
              <span className=" text-md capitalize">{type}</span>
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

export default StoreTypeTable;
