"use client";
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
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

interface RecordType {
  [x: string]: any;
  id: string;
  serial: string;
  name?: number;
  image?: any;
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
  const { isRefetch, dynamicValue } = useAppSelector(
    (state) => state.refetchValue
  );
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const locale = useLocale();
  const [shouldRefetch, setShouldRefetch] = useState(false);
  const [featureStatus, setFeatureStatus] = useState<{
    [key: string]: boolean;
  }>({});
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
  const { StoreTypeList, refetch, isPending } = useStoreTypeQuery({
    limit: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : sortedInfo.columnKey,
    sort: sortField,
    search: searchValue,
  });

  let totalDataLength = (StoreTypeList as any)?.meta?.total;
  const startIndex = (StoreTypeList as any)?.meta?.from;
  const originalData = useMemo(() => {
    const data = (StoreTypeList as any)?.data || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [StoreTypeList, startIndex]);

  useEffect(() => {
    const initialFeatureStatus = originalData.reduce(
      (acc: Record<string, boolean>, row: RecordType) => {
        acc[row.id] = row.status === 1;
        return acc;
      },
      {}
    );
    if (
      JSON.stringify(initialFeatureStatus) !== JSON.stringify(featureStatus)
    ) {
      setFeatureStatus(initialFeatureStatus);
    }
  }, [originalData, featureStatus]);

  const updatePage = (p: any) => {
    setCurrentPage(p);
    setShouldRefetch(true);
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
          width: "5%",
          title: t("table_header.sl"),
          dataIndex: "serial",
          fixed: fixLeft ? "left" : undefined,
        },
        {
          title: t("table_header.image"),
          width: 100,
          dataIndex: "image",
          render: (_: any, row: any) => (
            <div className="flex items-center gap-2">
              {row?.image ? (
                <div className="relative w-12 h-12">
                  <Image
                    loader={GlobalImageLoader}
                    src={row?.image}
                    alt="Store Type Logo"
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
              )}
            </div>
          ),
        },
        {
          width: 100,
          title: t("table_header.title"),
          dataIndex: "name",
        },
        {
          width: 100,
          title: t("table_header.store_type"),
          dataIndex: "type",
        },
        {
          width: 100,
          title: t("table_header.total_store"),
          dataIndex: "total_stores",
        },
        {
          title: t("table_header.status"),
          dataIndex: "status",
          width: "15%",
        },
        {
          title: t("table_header.actions"),
          dataIndex: "actions",
          width: "5%",
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
      router.push(`${Routes.editStoreType}/${Id}`);
      dispatch(setRefetch(true));
    };

    const renderColumns = columns.map((col) => {
      if (col.dataIndex === "type") {
        return {
          ...col,
          render: (type: any, row: RecordType) => (
            <div className="flex items-center justify-start gap-2">
              <Badge className="bg-[#E8F1FD] text-[#102A43] dark:text-white text-md capitalize">
                {type}
              </Badge>
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

  useEffect(() => {
    if (shouldRefetch || searchValue) {
      refetch();
      setShouldRefetch(false);
    }
    if (dynamicValue === "search_store_type") {
      refetch();
      setShouldRefetch(false);
      dispatch(setRefetch(false));
    }
    if (isRefetch) {
      refetch();
      dispatch(setRefetch(false));
    }
  }, [shouldRefetch, isRefetch, dispatch, refetch, searchValue, dynamicValue]);

  return (
    <>
      {isPending ? (
        <Loader customClass="mt-10" size="large" />
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

export default StoreTypeTable;
