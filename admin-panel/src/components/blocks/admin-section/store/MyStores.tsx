"use client";
import Loader from "@/components/molecules/Loader";
import Pagination from "@/components/molecules/Pagination";
import RCTable from "@/components/molecules/RCTable";
import { AppSelect } from "@/components/blocks/common";
import { CustomViewIcon } from "@/components/blocks/custom-icons";
import Delete from "@/components/blocks/custom-icons/Delete";
import TableEdit from "@/components/blocks/custom-icons/TableEdit";
import ConfirmationModal from "@/components/blocks/shared/ConfirmationModal";
import { Badge } from "@/components/ui";
import { CountItems } from "@/config/helperJson";
import { Routes } from "@/config/routes";
import GlobalImageLoader from "@/lib/imageLoader";
import {
  useAdminStoreQuery,
  useStoreDelete,
} from "@/modules/admin-section/store/store.action";
import { useAppDispatch } from "@/redux/hooks/index";
import { setRefetch } from "@/redux/slices/refetchSlice";
import { ChevronsLeftIcon, ChevronsRightIcon, Settings2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import StatusUpdateModal from "./modals/StatusUpdateModal";
import TableSkeletonLoader from "@/components/molecules/TableSkeletonLoader";

interface RecordType {
  id: string;
  slug: string;
  serial: string;
  name: string;
  logo?: string;
  info?: string;
  logo_url?: string;
  banner?: string;
  banner_url?: string;
  meta_description?: string;
  subscription_type?: string;
  meta_title?: string;
  phone?: string;
  address?: string;
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

const MyStores = ({ searchValue, selectStatus, selectSeller }: any) => {
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
  const { storeList, refetch, isPending, error } = useAdminStoreQuery({
    per_page: itemsPerPage,
    language: locale,
    page: currentPage,
    sortField: sortedInfo.columnKey == "" ? "id" : "name",
    sort: sortField,
    search: searchValue,
    status: selectStatus,
    seller: selectSeller,
  });
  let totalDataLength = (storeList as any)?.meta?.total;
  const startIndex = (storeList as any)?.meta?.from;
  const LastPage = (storeList as any)?.meta?.last_page;
  const originalData = useMemo(() => {
    const data = (storeList as any)?.data || [];
    return data.map((item: any, index: number) => ({
      ...item,
      serial: startIndex + index,
    }));
  }, [storeList, startIndex]);

  const updatePage = (p: any) => {
    setCurrentPage(p);
  };
  useEffect(() => {
    if (Number(currentPage) > Number(LastPage)) {
      setCurrentPage(LastPage);
    } else {
      setCurrentPage(currentPage);
    }
  }, [LastPage, currentPage]);

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
  const { mutate: storeDelete } = useStoreDelete();
  const handleDelete = (id: string) => {
    setLoading(true);
    storeDelete(id, {
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
          width: "5%",
        },
        {
          title: t("table_header.info"),
          width: 200,
          dataIndex: "info",
          render: (_info: any, row: any) => (
            <div className="flex items-center gap-2">
              <div>
                {row?.logo_url ? (
                  <div className="relative w-12 h-12">
                    <Image
                      loader={GlobalImageLoader}
                      src={row?.logo_url}
                      alt="store Logo"
                      fill
                      sizes="48px"
                      className="w-full h-full"
                    />
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
              <div>
                <p className="text-blue-500 text-lg font-semibold">
                  {row?.name}
                </p>
                <p className="capitalize">{row?.store_type}</p>
              </div>
            </div>
          ),
        },
        {
          title: t("table_header.phone"),
          dataIndex: "phone",
          width: 100,
        },
        {
          title: t("table_header.address"),
          dataIndex: "address",
          width: 150,
        },
        {
          title: t("table_header.subscription_type"),
          dataIndex: "subscription_type",
          width: 150,
          render: (subscription_type: any, row: RecordType) => (
            <div className="flex items-center gap-2">
              <p className="capitalize">{row?.subscription_type}</p>
            </div>
          ),
        },
        {
          title: t("table_header.status"),
          dataIndex: "status",
          width: "15%",
          render: (status: any, row: RecordType) => (
            <div className="flex items-center gap-2">
              <Badge
                className={` ${
                  status == 1
                    ? "bg-green-50 border border-green-500 text-green-500"
                    : status == 2
                    ? "bg-gray-50 border border-gray-500 text-gray-500"
                    : "bg-yellow-50 border border-yellow-500 text-yellow-500"
                } capitalize`}
              >
                {`${
                  status == 1 ? "Active" : status == 2 ? "Inactive" : "Pending"
                }`}
              </Badge>
              <StatusUpdateModal
                trigger={
                  <button>
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Settings2
                        width={16}
                        height={16}
                        className="text-blue-500"
                      />
                    </div>
                  </button>
                }
                refetch={refetch}
                row={row}
              />
            </div>
          ),
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
      const url = `${Routes.editStore}/${id}`;
      if (e.ctrlKey || e.metaKey || e.button === 1) {
        window.open(url, "_blank");
      } else {
        setEditRowId(id);
        router.push(url);
        dispatch(setRefetch(true));
      }
    };
    const [viewRowId, setViewRowId] = useState<string | null>(null);
    const handleView = (Id: string) => {
      setViewRowId(Id);
      router.push(`${Routes.viewStore}/${Id}`);
      dispatch(setRefetch(true));
    };

    const renderColumns = columns.map((col) => {
      if (col.dataIndex === "actions") {
        return {
          ...col,
          render: (o: any, row: RecordType) => (
            <div className="flex items-center gap-2 ">
              <CustomViewIcon
                isLoading={viewRowId === row.id}
                onClick={() => handleView(row.id)}
              />

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
                title={t("title.delete_store")}
                subTitle={t("sub_title.delete_store")}
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
    selectStatus,
    selectSeller,
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
        <div>
          <>
            <RCTable
              originData={originalData}
              useColumn={useColumn}
              sortedInfo={sortedInfo}
              handleSort={handleSort}
              maxWidth={1200}
            />
          </>

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
        </div>
      )}
    </>
  );
};

export default MyStores;
